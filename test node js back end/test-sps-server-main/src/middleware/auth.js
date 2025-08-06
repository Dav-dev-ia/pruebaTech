const jwt = require('jsonwebtoken');

/**
 * Middleware de autenticación
 * Verifica que el token JWT sea válido y no haya expirado
 * Extrae la información del usuario y la añade al objeto request
 * 
 * @param {object} req - Objeto de solicitud Express
 * @param {object} res - Objeto de respuesta Express
 * @param {function} next - Función para continuar al siguiente middleware
 * @returns {void}
 */
const authenticateToken = (req, res, next) => {
  try {
    // Obtener el token del header de autorización
    const authHeader = req.headers['authorization'];
    
    // Verificar formato correcto del header (Bearer TOKEN)
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Formato de autorización inválido', 
        message: 'Se requiere un token de acceso con formato: Bearer TOKEN'
      });
    }
    
    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        error: 'Token no proporcionado', 
        message: 'Se requiere un token de acceso válido'
      });
    }

    // Verificar el token
    jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, decoded) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({ 
            error: 'Token expirado', 
            message: 'Su sesión ha expirado. Por favor, inicie sesión nuevamente'
          });
        }
        
        return res.status(403).json({ 
          error: 'Token inválido', 
          message: 'El token proporcionado no es válido'
        });
      }
      
      // Verificar que el token contenga la información mínima necesaria
      if (!decoded.id || !decoded.email || !decoded.type) {
        return res.status(403).json({ 
          error: 'Token malformado', 
          message: 'El token no contiene la información necesaria'
        });
      }
      
      // Añadir información del usuario al request
      req.user = decoded;
      next();
    });
  } catch (error) {
    console.error('Error en autenticación:', error);
    return res.status(500).json({ 
      error: 'Error de autenticación', 
      message: 'Ocurrió un error al procesar la autenticación'
    });
  }
};

module.exports = authenticateToken;
