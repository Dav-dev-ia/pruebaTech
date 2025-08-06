import axios from 'axios';

/**
 * URL base de la API para las operaciones de usuarios
 * @constant {string}
 */
const API_URL = 'http://localhost:3001';

/**
 * Obtiene los headers de autenticación con el token JWT
 * @returns {Object} Objeto de configuración con los headers de autenticación
 */
const getAuthHeaders = () => {
  // Intentar obtener el token de localStorage o sessionStorage
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  return {
    headers: {
      Authorization: token ? 'Bearer ' + token : '',
      'Content-Type': 'application/json'
    },
  };
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
      return await axios.get(`${API_URL}/api/users`, getAuthHeaders());
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      throw error.response?.data || { message: 'Error al obtener usuarios' };
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
    if (!user || !user.email || !user.name || !user.password) {
      throw new Error('Datos de usuario incompletos');
    }
    
    try {
      return await axios.post(`${API_URL}/api/users`, user, getAuthHeaders());
    } catch (error) {
      console.error('Error al crear usuario:', error);
      throw error.response?.data || { message: 'Error al crear usuario' };
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
