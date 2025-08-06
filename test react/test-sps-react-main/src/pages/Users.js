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

  // Referencia para controlar si el componente está montado
  const isMounted = React.useRef(true);
  
  // Función para cargar usuarios con control de montaje
  const fetchUsers = async () => {
    // No necesitamos esta verificación ya que impide la carga inicial
    // if (loading) return;
    
    setLoading(true);
    try {
      const response = await UserService.getUsers();
      
      // Verificar si el componente sigue montado antes de actualizar el estado
      if (isMounted.current) {
        setUsers(response.data || response);
        setError('');
      }
    } catch (err) {
      console.error('Error al obtener usuarios:', err);
      
      // Verificar si el componente sigue montado antes de actualizar el estado
      if (isMounted.current) {
        setError(err.message || 'Error al cargar los usuarios. Intente nuevamente.');
        setUsers([]);
      }
    } finally {
      // Verificar si el componente sigue montado antes de actualizar el estado
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    // Marcar el componente como montado
    isMounted.current = true;
    
    // Verificar si el usuario está autenticado
    const isAuthenticated = AuthService.isAuthenticated();
    
    if (isAuthenticated) {
      try {
        // Verificar si el usuario es administrador
        const admin = AuthService.isAdmin();
        setIsAdmin(admin);
        
        // Cargar lista de usuarios
        fetchUsers();
        // Configurar título de la página
        document.title = 'Gestión de Usuarios';
      } catch (error) {
        console.error('Error al verificar permisos:', error);
        setError('Error al verificar permisos. Por favor, vuelve a iniciar sesión.');
        setTimeout(() => {
          AuthService.logout();
          navigate('/signin', { state: { sessionExpired: true } });
        }, 2000);
      }
    } else {
      // Redirigir a la página principal si no está autenticado
      setError('No tienes permisos para acceder a esta página. Serás redirigido a la página de inicio.');
      setTimeout(() => {
        navigate('/', { state: { accessDenied: true } });
      }, 2000);
    }
    
    // Limpiar al desmontar
    return () => {
      isMounted.current = false; // Marcar como desmontado
      setUsers([]);
      setError('');
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]); // fetchUsers se omite intencionalmente para evitar un bucle infinito

  /**
   * Maneja la eliminación de un usuario
   * @param {number} id - ID del usuario a eliminar
   * @param {string} name - Nombre del usuario para mostrar en la confirmación
   */
  const handleDelete = async (id, name) => {
    // Verificar permisos de administrador
    if (!isAdmin) {
      setError('No tiene permisos para eliminar usuarios');
      return;
    }
    
    // Verificar que el ID sea válido
    if (!id) {
      setError('ID de usuario inválido');
      return;
    }
    
    // Confirmar eliminación
    if (window.confirm(`¿Está seguro que desea eliminar al usuario ${name}?`)) {
      try {
        setLoading(true); // Mostrar indicador de carga
        await UserService.deleteUser(id);
        setError('');
        // Mostrar mensaje de éxito temporal
        setError(`Usuario ${name} eliminado correctamente`);
        setTimeout(() => setError(''), 3000);
        // Recargar lista de usuarios
        await fetchUsers();
      } catch (err) {
        console.error('Error al eliminar usuario:', err);
        setError(err.message || 'Error al eliminar el usuario. Intente nuevamente.');
      } finally {
        setLoading(false); // Ocultar indicador de carga
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
        
        {error && <div className="error-message" role="alert" style={{
          backgroundColor: error.includes('eliminado correctamente') ? '#d4edda' : '#f8d7da',
          color: error.includes('eliminado correctamente') ? '#155724' : '#721c24',
          padding: '10px 15px',
          borderRadius: '4px',
          marginBottom: '20px',
          textAlign: 'center'
        }}>{error}</div>}
        
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
