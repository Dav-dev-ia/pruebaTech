import axios from 'axios';

/**
 * URL base de la API para las operaciones de usuarios
 * @constant {string}
 */
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

/**
 * Obtiene los headers de autenticación con el token JWT
 * @returns {Object} Objeto de configuración con los headers de autenticación
 */
const getAuthHeaders = () => {
  // Intentar obtener el token de localStorage o sessionStorage
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  
  // Validar que el token sea válido
  if (!token || typeof token !== 'string' || token.trim() === '') {
    throw new Error('No hay token de autenticación válido');
  }
  
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    timeout: 15000 // Timeout de 15 segundos para evitar peticiones infinitas
  };
};

/**
 * Implementa un reintento con retroceso exponencial para las peticiones a la API
 * @param {Function} apiCall - Función que realiza la llamada a la API
 * @param {number} maxRetries - Número máximo de reintentos
 * @param {number} baseDelay - Retraso base en milisegundos
 * @returns {Promise<any>} - Resultado de la llamada a la API
 */
const retryWithExponentialBackoff = async (apiCall, maxRetries = 3, baseDelay = 1000) => {
  let lastError;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error;
      
      // Si es un error de "demasiadas solicitudes" (429) o un error de red, reintentamos
      if (error.response?.status === 429 || !error.response) {
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
 * Servicio para gestionar operaciones CRUD de usuarios
 */
const UserService = {
  /**
   * Obtiene la lista de todos los usuarios
   * @returns {Promise<Object>} Promesa con la respuesta de la API
   * @throws {Error} Error si la petición falla
   */
  getUsers: async () => {
    try {
      return await retryWithExponentialBackoff(async () => {
        const headers = getAuthHeaders();
        const response = await axios.get(`${API_URL}/api/users`, headers);
        
        // Validar la respuesta
        if (!response || !response.data) {
          throw new Error('Respuesta inválida del servidor');
        }
        
        return response;
      });
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      
      // Manejar diferentes tipos de errores
      if (error.response) {
        // El servidor respondió con un código de error
        if (error.response.status === 429) {
          throw { message: 'Demasiadas solicitudes. Por favor, espere un momento e intente nuevamente.' };
        }
        throw error.response.data || { message: `Error ${error.response.status}: ${error.response.statusText || 'Error al obtener usuarios'}` };
      } else if (error.request) {
        // La petición fue hecha pero no se recibió respuesta
        throw { message: 'No se pudo conectar con el servidor. Verifique su conexión a internet.' };
      } else {
        // Error en la configuración de la petición
        throw { message: error.message || 'Error al obtener usuarios' };
      }
    }
  },

  /**
   * Obtiene un usuario por su ID
   * @param {number|string} id - ID del usuario
   * @returns {Promise<Object>} Promesa con la respuesta de la API
   * @throws {Error} Error si la petición falla
   */
  getUser: async (id) => {
    if (!id) throw new Error('ID de usuario requerido');
    
    try {
      return await axios.get(`${API_URL}/api/users/${id}`, getAuthHeaders());
    } catch (error) {
      console.error(`Error al obtener usuario ${id}:`, error);
      throw error.response?.data || { message: `Error al obtener usuario ${id}` };
    }
  },

  /**
   * Crea un nuevo usuario
   * @param {Object} user - Datos del usuario a crear
   * @param {string} user.email - Email del usuario
   * @param {string} user.name - Nombre del usuario
   * @param {string} user.type - Tipo de usuario (admin/user)
   * @param {string} user.password - Contraseña del usuario
   * @returns {Promise<Object>} Promesa con la respuesta de la API
   * @throws {Error} Error si la petición falla
   */
  createUser: async (user) => {
    // Validaciones más completas
    if (!user) throw new Error('Datos de usuario requeridos');
    if (!user.email || typeof user.email !== 'string' || !user.email.includes('@')) {
      throw new Error('Email de usuario inválido');
    }
    if (!user.name || typeof user.name !== 'string' || user.name.trim() === '') {
      throw new Error('Nombre de usuario inválido');
    }
    if (!user.password || typeof user.password !== 'string' || user.password.length < 6) {
      throw new Error('La contraseña debe tener al menos 6 caracteres');
    }
    if (user.type && !['admin', 'user'].includes(user.type)) {
      throw new Error('Tipo de usuario inválido');
    }
    
    // Sanitizar datos
    const sanitizedUser = {
      email: user.email.trim().toLowerCase(),
      name: user.name.trim(),
      password: user.password,
      type: user.type || 'user' // Valor por defecto
    };
    
    try {
      const headers = getAuthHeaders();
      return await axios.post(`${API_URL}/api/users`, sanitizedUser, headers);
    } catch (error) {
      console.error('Error al crear usuario:', error);
      
      // Manejar diferentes tipos de errores
      if (error.response) {
        // Manejar errores específicos
        if (error.response.status === 409) {
          throw { message: 'El email ya está registrado. Intente con otro email.' };
        }
        throw error.response.data || { message: 'Error al crear usuario' };
      } else if (error.request) {
        throw { message: 'No se pudo conectar con el servidor. Verifique su conexión a internet.' };
      } else {
        throw { message: error.message || 'Error al crear usuario' };
      }
    }
  },

  /**
   * Actualiza un usuario existente
   * @param {number|string} id - ID del usuario a actualizar
   * @param {Object} user - Datos actualizados del usuario
   * @returns {Promise<Object>} Promesa con la respuesta de la API
   * @throws {Error} Error si la petición falla
   */
  updateUser: async (id, user) => {
    if (!id) throw new Error('ID de usuario requerido');
    if (!user) throw new Error('Datos de usuario requeridos');
    
    try {
      return await axios.put(`${API_URL}/api/users/${id}`, user, getAuthHeaders());
    } catch (error) {
      console.error(`Error al actualizar usuario ${id}:`, error);
      throw error.response?.data || { message: `Error al actualizar usuario ${id}` };
    }
  },

  /**
   * Elimina un usuario por su ID
   * @param {number|string} id - ID del usuario a eliminar
   * @returns {Promise<Object>} Promesa con la respuesta de la API
   * @throws {Error} Error si la petición falla
   */
  deleteUser: async (id) => {
    if (!id) throw new Error('ID de usuario requerido');
    
    try {
      return await axios.delete(`${API_URL}/api/users/${id}`, getAuthHeaders());
    } catch (error) {
      console.error(`Error al eliminar usuario ${id}:`, error);
      throw error.response?.data || { message: `Error al eliminar usuario ${id}` };
    }
  },
};

export default UserService;
