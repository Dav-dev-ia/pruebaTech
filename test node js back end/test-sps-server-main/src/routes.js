const express = require("express");
const { Router } = express;
const User = require("./models/User");
const jwt = require("jsonwebtoken");
const authenticateToken = require("./middleware/auth");
const { isAdmin } = require("./middleware/checkRole");
const rateLimit = require("express-rate-limit");

// Configurar rate limiter para prevenir ataques de fuerza bruta
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 20, // Aumentado a 20 intentos por ventana para mejorar la experiencia de usuario
  message: { error: "Demasiados intentos de inicio de sesión. Por favor, inténtelo de nuevo más tarde." },
  standardHeaders: true, // Devolver info de límite en los headers `RateLimit-*`
  legacyHeaders: false, // Deshabilitar los headers `X-RateLimit-*`
  skipSuccessfulRequests: true // No contar solicitudes exitosas contra el límite
});

// Configurar rate limiter para las rutas de la API
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 300, // Aumentado a 300 solicitudes por ventana para mejorar rendimiento
  message: { error: "Demasiadas solicitudes. Por favor, inténtelo de nuevo más tarde." },
  standardHeaders: true, // Devolver info de límite en los headers `RateLimit-*`
  legacyHeaders: false, // Deshabilitar los headers `X-RateLimit-*`
  skipSuccessfulRequests: true, // No contar solicitudes exitosas contra el límite
  // Usar un generador de claves simplificado para evitar problemas con IPv6
  keyGenerator: (req) => {
    return req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown-ip';
  }
});

const routes = Router();


// La ruta principal será manejada por el middleware de archivos estáticos en index.js

/**
 * @route POST /api/login
 * @desc Autenticar usuario y generar token JWT
 * @access Público
 */
routes.post("/login", loginLimiter, (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validar campos requeridos
    if (!email || !password) {
      return res.status(400).json({ 
        error: "Campos requeridos", 
        message: "El email y la contraseña son obligatorios" 
      });
    }

    // Prevenir inyección SQL y XSS
    const sanitizedEmail = email.toString().trim().toLowerCase();
    const sanitizedPassword = password.toString();

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedEmail)) {
      return res.status(400).json({ 
        error: "Formato inválido", 
        message: "El formato del email es inválido" 
      });
    }

    // Validar credenciales
    if (User.validatePassword(sanitizedEmail, sanitizedPassword)) {
      const user = User.getByEmail(sanitizedEmail);
      const { password, ...userWithoutPassword } = user;
      
      // Generar token JWT con información mínima necesaria
      const token = jwt.sign(
        { 
          id: userWithoutPassword.id, 
          email: userWithoutPassword.email,
          name: userWithoutPassword.name,
          type: userWithoutPassword.type
        }, 
        process.env.JWT_SECRET || 'your-secret-key', 
        {
          expiresIn: '8h' // Reducir tiempo de expiración por seguridad
        }
      );
      
      // Registrar inicio de sesión exitoso
      console.log(`Inicio de sesión exitoso: ${sanitizedEmail} en ${new Date().toISOString()}`);
      
      return res.json({ 
        token, 
        user: userWithoutPassword,
        message: "Inicio de sesión exitoso"
      });
    } else {
      // Registrar intento fallido (sin revelar si el email existe)
      console.log(`Intento de inicio de sesión fallido para: ${sanitizedEmail} en ${new Date().toISOString()}`);
      
      return res.status(401).json({ 
        error: "Credenciales inválidas", 
        message: "El email o la contraseña son incorrectos" 
      });
    }
  } catch (error) {
    console.error('Error en inicio de sesión:', error);
    return res.status(500).json({ 
      error: "Error de servidor", 
      message: "Ocurrió un error al procesar la solicitud" 
    });
  }
});

/**
 * @route GET /api/users
 * @desc Obtener todos los usuarios
 * @access Privado - Todos los usuarios autenticados
 */
routes.get("/users", apiLimiter, authenticateToken, (req, res) => {
  try {
    res.json(User.getAll());
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ 
      error: "Error de servidor", 
      message: "Ocurrió un error al obtener los usuarios" 
    });
  }
});

/**
 * @route GET /api/users/:id
 * @desc Obtener un usuario por ID
 * @access Privado - Todos los usuarios autenticados
 */
routes.get("/users/:id", apiLimiter, authenticateToken, (req, res) => {
  try {
    // Validar que el ID sea un número
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ 
        error: "ID inválido", 
        message: "El ID del usuario debe ser un número" 
      });
    }

    // Verificar que el usuario tenga permisos para ver este usuario
    // Los usuarios normales solo pueden ver su propio perfil
    if (req.user.type !== 'admin' && req.user.id !== id) {
      return res.status(403).json({ 
        error: "Acceso denegado", 
        message: "No tiene permisos para ver este usuario" 
      });
    }

    const user = User.getById(id);
    if (!user) {
      return res.status(404).json({ 
        error: "Usuario no encontrado", 
        message: "El usuario solicitado no existe" 
      });
    }
    res.json(user);
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({ 
      error: "Error de servidor", 
      message: "Ocurrió un error al obtener el usuario" 
    });
  }
});

/**
 * @route POST /api/users
 * @desc Crear un nuevo usuario
 * @access Privado - Solo administradores
 */
routes.post("/users", apiLimiter, authenticateToken, isAdmin, (req, res) => {
  try {
    const { name, email, password, type } = req.body;

    // Validar campos requeridos
    if (!name || !email || !password || !type) {
      return res.status(400).json({ 
        error: "Campos incompletos", 
        message: "Todos los campos son obligatorios: nombre, email, contraseña y tipo" 
      });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: "Formato inválido", 
        message: "El formato del email es inválido" 
      });
    }

    // Validar tipo de usuario
    if (type !== 'admin' && type !== 'user') {
      return res.status(400).json({ 
        error: "Tipo inválido", 
        message: "El tipo de usuario debe ser 'admin' o 'user'" 
      });
    }

    // Validar longitud de contraseña
    if (password.length < 4) {
      return res.status(400).json({ 
        error: "Contraseña insegura", 
        message: "La contraseña debe tener al menos 4 caracteres" 
      });
    }

    const newUser = User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      type
    });

    res.status(201).json({
      user: newUser,
      message: "Usuario creado exitosamente"
    });
  } catch (error) {
    if (error.message === 'Email already exists') {
      return res.status(400).json({ 
        error: "Email duplicado", 
        message: "El email ya está registrado" 
      });
    }
    
    console.error('Error al crear usuario:', error);
    res.status(500).json({ 
      error: "Error de servidor", 
      message: "Ocurrió un error al crear el usuario" 
    });
  }
});

/**
 * @route PUT /api/users/:id
 * @desc Actualizar un usuario existente
 * @access Privado - Solo administradores
 */
routes.put("/users/:id", apiLimiter, authenticateToken, isAdmin, (req, res) => {
  try {
    // Validar que el ID sea un número
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ 
        error: "ID inválido", 
        message: "El ID del usuario debe ser un número" 
      });
    }

    // Validar que al menos un campo sea proporcionado
    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({ 
        error: "Sin datos", 
        message: "No se proporcionaron datos para actualizar" 
      });
    }

    // Validar formato de email si se proporciona
    if (req.body.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(req.body.email)) {
        return res.status(400).json({ 
          error: "Formato inválido", 
          message: "El formato del email es inválido" 
        });
      }
    }

    // Validar tipo de usuario si se proporciona
    if (req.body.type && req.body.type !== 'admin' && req.body.type !== 'user') {
      return res.status(400).json({ 
        error: "Tipo inválido", 
        message: "El tipo de usuario debe ser 'admin' o 'user'" 
      });
    }

    // Validar longitud de contraseña si se proporciona
    if (req.body.password && req.body.password.length < 4) {
      return res.status(400).json({ 
        error: "Contraseña insegura", 
        message: "La contraseña debe tener al menos 4 caracteres" 
      });
    }

    // Sanitizar datos
    const userData = {};
    if (req.body.name) userData.name = req.body.name.trim();
    if (req.body.email) userData.email = req.body.email.trim().toLowerCase();
    if (req.body.password) userData.password = req.body.password;
    if (req.body.type) userData.type = req.body.type;

    const updatedUser = User.update(id, userData);
    if (!updatedUser) {
      return res.status(404).json({ 
        error: "Usuario no encontrado", 
        message: "El usuario que intenta actualizar no existe" 
      });
    }

    res.json({
      user: updatedUser,
      message: "Usuario actualizado exitosamente"
    });
  } catch (error) {
    if (error.message === 'Email already exists') {
      return res.status(400).json({ 
        error: "Email duplicado", 
        message: "El email ya está registrado por otro usuario" 
      });
    }
    
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ 
      error: "Error de servidor", 
      message: "Ocurrió un error al actualizar el usuario" 
    });
  }
});

/**
 * @route DELETE /api/users/:id
 * @desc Eliminar un usuario
 * @access Privado - Solo administradores
 */
routes.delete("/users/:id", apiLimiter, authenticateToken, isAdmin, (req, res) => {
  try {
    // Validar que el ID sea un número
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ 
        error: "ID inválido", 
        message: "El ID del usuario debe ser un número" 
      });
    }

    // Prevenir eliminación del usuario administrador principal
    if (id === 1) {
      return res.status(403).json({ 
        error: "Operación no permitida", 
        message: "No se puede eliminar el usuario administrador principal" 
      });
    }

    const deleted = User.delete(id);
    if (!deleted) {
      return res.status(404).json({ 
        error: "Usuario no encontrado", 
        message: "El usuario que intenta eliminar no existe" 
      });
    }

    res.status(200).json({ 
      message: "Usuario eliminado exitosamente" 
    });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ 
      error: "Error de servidor", 
      message: "Ocurrió un error al eliminar el usuario" 
    });
  }
});

module.exports = routes;
