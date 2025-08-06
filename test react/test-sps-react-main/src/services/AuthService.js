import axios from 'axios';

const API_URL = 'http://localhost:3000';

/**
 * Configura el token de autenticación en los headers de Axios
 * @param {string} token - Token JWT
 */
const setAuthHeader = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};

/**
 * Inicia sesión y obtiene token JWT
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña del usuario
 * @returns {Promise<Object>} - Datos del usuario y token
 */
const login = async (email, password) => {
  try {
    // Sanitizar inputs
    const sanitizedEmail = email.trim().toLowerCase();
    
    const response = await axios.post(API_URL + '/api/login', { 
      email: sanitizedEmail, 
      password 
    });
    
    const { token, user, message } = response.data;
    
    if (token) {
      // Configurar el token en los headers para futuras peticiones
      setAuthHeader(token);
      return { token, user, message };
    } else {
      throw new Error('No se recibió token de autenticación');
    }
  } catch (error) {
    console.error('Error de inicio de sesión:', error);
    
    // Manejar diferentes tipos de errores
    if (error.response) {
      // El servidor respondió con un código de error
      const errorMessage = error.response.data.message || error.response.data.error || 'Error de autenticación';
      throw new Error(errorMessage);
    } else if (error.request) {
      // La petición fue hecha pero no se recibió respuesta
      throw new Error('No se pudo conectar con el servidor. Verifique su conexión a internet.');
    } else {
      // Error en la configuración de la petición
      throw new Error('Error al procesar la solicitud de inicio de sesión.');
    }
  }
};

/**
 * Cierra la sesión del usuario
 */
const logout = () => {
  // Eliminar token de ambos almacenamientos
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('user');
  
  // Eliminar token de los headers
  setAuthHeader(null);
};

/**
 * Verifica si el usuario está autenticado
 * @returns {boolean} - true si está autenticado, false en caso contrario
 */
const isAuthenticated = () => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  return !!token;
};

/**
 * Obtiene el usuario actual
 * @returns {Object|null} - Datos del usuario o null si no hay usuario autenticado
 */
const getCurrentUser = () => {
  const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch (error) {
    console.error('Error al parsear datos del usuario:', error);
    return null;
  }
};

/**
 * Verifica si el usuario actual tiene rol de administrador
 * @returns {boolean} - true si es admin, false en caso contrario
 */
const isAdmin = () => {
  const user = getCurrentUser();
  return user && user.type === 'admin';
};

// Configurar interceptor para manejar errores de token expirado
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expirado o inválido
      logout();
      window.location.href = '/'; // Redirigir a login
    }
    return Promise.reject(error);
  }
);

// Inicializar header de autenticación si hay token guardado
const token = localStorage.getItem('token') || sessionStorage.getItem('token');
if (token) {
  setAuthHeader(token);
}

const AuthService = {
  login,
  logout,
  isAuthenticated,
  getCurrentUser,
  isAdmin
};

export default AuthService;
