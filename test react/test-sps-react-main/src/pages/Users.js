import React, { useEffect, useState } from 'react';
import UserService from '../services/UserService';
import AuthService from '../services/AuthService';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import '../styles/Users.css';

function Users() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await UserService.getUsers();
      setUsers(response.data || response);
      setError('');
    } catch (err) {
      console.error('Error al obtener usuarios:', err);
      setError(err.message || 'Error al cargar los usuarios. Intente nuevamente.');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Verificar si el usuario es administrador
    setIsAdmin(AuthService.isAdmin());
    
    // Cargar lista de usuarios
    fetchUsers();
    
    // Configurar título de la página
    document.title = 'Gestión de Usuarios';
  }, []);

  /**
   * Maneja la eliminación de un usuario
   * @param {number} id - ID del usuario a eliminar
   * @param {string} name - Nombre del usuario para mostrar en la confirmación
   */
  const handleDelete = async (id, name) => {
    if (!isAdmin) {
      setError('No tiene permisos para eliminar usuarios');
      return;
    }
    
    if (window.confirm(`¿Está seguro que desea eliminar al usuario ${name}?`)) {
      try {
        await UserService.deleteUser(id);
        setError('');
        fetchUsers();
      } catch (err) {
        console.error('Error al eliminar usuario:', err);
        setError(err.message || 'Error al eliminar el usuario. Intente nuevamente.');
      }
    }
  };

  return (
    <Layout>
      <div className="users-container">
        <div className="users-header">
          <h1>Gestión de Usuarios</h1>
          {isAdmin && (
            <button 
              className="add-user-btn" 
              onClick={() => navigate('/users/new')}
              aria-label="Agregar nuevo usuario"
            >
              <i className="fa fa-plus"></i> Nuevo Usuario
            </button>
          )}
        </div>
        
        {error && <div className="error-message" role="alert">{error}</div>}
        
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Cargando usuarios...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="empty-state" role="status">
            <p>No se encontraron usuarios{isAdmin && '. Agregue un nuevo usuario para comenzar'}.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="users-table" aria-label="Lista de usuarios">
              <thead>
                <tr>
                  <th scope="col">Nombre</th>
                  <th scope="col">Email</th>
                  <th scope="col">Tipo</th>
                  {isAdmin && <th scope="col">Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`user-type ${user.type}`}>
                        {user.type === 'admin' ? 'Administrador' : 'Usuario'}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="action-buttons">
                        <button 
                          className="edit-btn" 
                          onClick={() => navigate(`/users/${user.id}`)}
                          aria-label={`Editar usuario ${user.name}`}
                        >
                          <i className="fa fa-edit"></i> Editar
                        </button>
                        <button 
                          className="delete-btn" 
                          onClick={() => handleDelete(user.id, user.name)}
                          aria-label={`Eliminar usuario ${user.name}`}
                          disabled={user.id === 1} // Prevenir eliminación del admin principal
                        >
                          <i className="fa fa-trash"></i> Eliminar
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Users;
