import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

/**
 * Configura el token de autenticación en los headers de Axios
 * @param {string} token - Token JWT
 */
const setAuthHeader = (token) => {
  if (token) {
    // Validar que el token tenga un formato válido antes de usarlo
    if (typeof token === 'string' && token.trim() !== '') {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};

/**
 * Implementa un reintento con retroceso exponencial para las peticiones a la API
 * @param {Function} apiCall - Función que realiza la llamada a la API
 * @param {number} maxRetries - Número máximo de reintentos
 * @param {number} baseDelay - Retraso base en milisegundos
 * @returns {Promise<any>} - Resultado de la llamada a la API
 */
const retryWithExponentialBackoff = async (apiCall, maxRetries = 2, baseDelay = 1000) => {
  let lastError;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error;
      
      // Solo reintentamos para errores de red o si el mensaje contiene "Demasiados intentos"
      const errorMessage = error.message || '';
      if (!error.response || errorMessage.includes('Demasiados intentos')) {
        const delay = baseDelay * Math.pow(2, attempt);
        console.log(`Reintentando en ${delay}ms (intento ${attempt + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        // Para otros errores, no reintentamos
        throw error;
      }
    }
  }
  
  // Si llegamos aquí, es porque agotamos los reintentos
  throw lastError;
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
    
    // Usar retroceso exponencial para manejar posibles errores de límite de intentos
    const response = await retryWithExponentialBackoff(async () => {
      return await axios.post(API_URL + '/api/login', { 
        email: sanitizedEmail, 
        password 
      }, {
        timeout: 10000 // Timeout de 10 segundos para evitar peticiones infinitas
      });
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
      const status = error.response.status;
      const errorMessage = error.response.data.message || error.response.data.error || 'Error de autenticación';
      
      // Manejar específicamente el error de demasiados intentos
      if (status === 429 || errorMessage.includes('Demasiados intentos')) {
        throw new Error('Demasiados intentos de inicio de sesión. Por favor, espere unos minutos e intente nuevamente.');
      }
      
      throw new Error(errorMessage);
    } else if (error.request) {
      // La petición fue hecha pero no se recibió respuesta
      throw new Error('No se pudo conectar con el servidor. Verifique su conexión a internet.');
    } else {
      // Error en la configuración de la petición
      throw new Error(error.message || 'Error al procesar la solicitud de inicio de sesión.');
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
  
  // Limpiar cualquier otra información sensible que pudiera estar almacenada
  document.cookie.split(';').forEach(cookie => {
    const [name] = cookie.trim().split('=');
    if (name && (name.includes('token') || name.includes('auth'))) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    }
  });
};

/**
 * Verifica si el usuario está autenticado
 * @returns {boolean} - true si está autenticado, false en caso contrario
 */
const isAuthenticated = () => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  
  // Verificar que el token exista y tenga un formato válido
  if (!token || typeof token !== 'string' || token.trim() === '') {
    return false;
  }
  
  // Verificar si el token ha expirado (si tiene formato JWT)
  try {
    if (token.split('.').length === 3) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        // Token expirado, limpiar
        logout();
        return false;
      }
    }
  } catch (e) {
    console.error('Error al verificar token:', e);
    return false;
  }
  
  return true;
};

/**
 * Obtiene el usuario actual
 * @returns {Object|null} - Datos del usuario o null si no hay usuario autenticado
 */
const getCurrentUser = () => {
  // Verificar primero si el usuario está autenticado
  if (!isAuthenticated()) {
    return null;
  }
  
  const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    const user = JSON.parse(userStr);
    // Validar que el objeto usuario tenga la estructura esperada
    if (!user || typeof user !== 'object') {
      return null;
    }
    return user;
  } catch (error) {
    console.error('Error al parsear datos del usuario:', error);
    // Limpiar datos corruptos
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
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
