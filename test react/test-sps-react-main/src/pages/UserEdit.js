import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import UserService from '../services/UserService';
import AuthService from '../services/AuthService';
import Layout from '../components/Layout';
import '../styles/UserEdit.css';

// Expresión regular para validar formato de email
const EMAIL_REGEX = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

function UserEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState({
    name: '',
    email: '',
    type: 'user', // Valor por defecto
    password: '',
  });
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    type: '',
    password: '',
    general: ''
  });
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Verificar si el usuario es administrador
    const checkAdminStatus = () => {
      const isUserAdmin = AuthService.isAdmin();
      setIsAdmin(isUserAdmin);
      
      // Si no es administrador, redirigir a la página principal con mensaje de error
      if (!isUserAdmin) {
        navigate('/', { state: { accessDenied: true } });
        return false;
      }
      return true;
    };

    // Establecer el título de la página
    document.title = id ? 'Editar Usuario' : 'Crear Usuario';
    
    // Verificar permisos de administrador
    if (!checkAdminStatus()) return;

    // Cargar datos del usuario si estamos en modo edición
    if (id) {
      setLoading(true);
      UserService.getUser(id)
        .then((res) => {
          setUser(res.data);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Error al cargar usuario:', err);
          setErrors(prev => ({
            ...prev,
            general: err.message || 'Error al cargar datos del usuario'
          }));
          setLoading(false);
        });
    }

    // Limpiar al desmontar
    return () => {
      document.title = 'SPS Group';
    };
  }, [id, navigate]);

  const validateField = (name, value) => {
    let errorMessage = '';
    
    switch (name) {
      case 'name':
        if (!value.trim()) {
          errorMessage = 'El nombre es requerido';
        } else if (value.trim().length < 2) {
          errorMessage = 'El nombre debe tener al menos 2 caracteres';
        }
        break;
      
      case 'email':
        if (!value.trim()) {
          errorMessage = 'El email es requerido';
        } else if (!EMAIL_REGEX.test(value)) {
          errorMessage = 'Formato de email inválido';
        }
        break;
      
      case 'type':
        if (!value) {
          errorMessage = 'El tipo de usuario es requerido';
        }
        break;
      
      case 'password':
        // Solo validar contraseña si es un nuevo usuario o si se ha ingresado algo
        if (!id && !value) {
          errorMessage = 'La contraseña es requerida para nuevos usuarios';
        } else if (value && value.length < 4) {
          errorMessage = 'La contraseña debe tener al menos 4 caracteres';
        }
        break;
      
      default:
        break;
    }
    
    return errorMessage;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Actualizar el estado del usuario
    setUser(prevUser => ({
      ...prevUser,
      [name]: value
    }));
    
    // Validar el campo y actualizar errores
    const errorMessage = validateField(name, value);
    setErrors(prevErrors => ({
      ...prevErrors,
      [name]: errorMessage,
      general: '' // Limpiar error general al hacer cambios
    }));
  };

  const validateForm = () => {
    // Validar todos los campos
    const newErrors = {
      name: validateField('name', user.name),
      email: validateField('email', user.email),
      type: validateField('type', user.type),
      password: validateField('password', user.password),
      general: ''
    };
    
    // Verificar si hay errores
    const hasErrors = Object.values(newErrors).some(error => error !== '');
    setErrors(newErrors);
    
    return !hasErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar el formulario antes de enviar
    if (!validateForm()) {
      return;
    }
    
    // Limpiar errores previos
    setErrors(prev => ({ ...prev, general: '' }));
    setLoading(true);
    
    try {
      // Preparar datos para enviar (omitir contraseña vacía en actualizaciones)
      const userData = { ...user };
      if (id && !userData.password) {
        delete userData.password;
      }
      
      if (id) {
        await UserService.updateUser(id, userData);
      } else {
        await UserService.createUser(userData);
      }
      
      // Redireccionar a la lista de usuarios
      navigate('/users');
    } catch (err) {
      console.error('Error al guardar usuario:', err);
      setErrors(prev => ({
        ...prev,
        general: err.message || (id ? 'Error al actualizar usuario' : 'Error al crear usuario')
      }));
    } finally {
      setLoading(false);
    }
  };

  // Si no es administrador, no mostrar el formulario
  if (!isAdmin) {
    return null;
  }

  return (
    <Layout>
      <div className="user-edit-container">
        <h1>{id ? 'Editar Usuario' : 'Crear Usuario'}</h1>
        {errors.general && <div className="error-message">{errors.general}</div>}
        
        {loading ? (
          <div className="loading-spinner">Cargando...</div>
        ) : (
          <div className="user-form">
            <form onSubmit={handleSubmit}>
              <div className={`form-group ${errors.name ? 'has-error' : ''}`}>
                <label>Nombre</label>
                <input 
                  name="name" 
                  value={user.name} 
                  onChange={handleChange} 
                  placeholder="Ingrese nombre"
                  disabled={loading}
                />
                {errors.name && <div className="field-error">{errors.name}</div>}
              </div>
              
              <div className={`form-group ${errors.email ? 'has-error' : ''}`}>
                <label>Email</label>
                <input 
                  name="email" 
                  type="text" 
                  value={user.email} 
                  onChange={handleChange} 
                  placeholder="Ingrese email"
                  disabled={loading}
                />
                {errors.email && <div className="field-error">{errors.email}</div>}
              </div>
              
              <div className={`form-group ${errors.type ? 'has-error' : ''}`}>
                <label>Tipo de Usuario</label>
                <select 
                  name="type" 
                  value={user.type} 
                  onChange={handleChange} 
                  disabled={loading}
                >
                  <option value="user">Usuario</option>
                  <option value="admin">Administrador</option>
                </select>
                {errors.type && <div className="field-error">{errors.type}</div>}
              </div>
              
              <div className={`form-group ${errors.password ? 'has-error' : ''}`}>
                <label>Contraseña {!id && "(requerida)"}</label>
                <input 
                  name="password" 
                  type="password" 
                  value={user.password} 
                  onChange={handleChange} 
                  placeholder={id ? "Dejar en blanco para mantener la contraseña actual" : "Ingrese contraseña"}
                  disabled={loading}
                />
                {errors.password && <div className="field-error">{errors.password}</div>}
              </div>
              
              <div className="form-buttons">
                <button 
                  type="button" 
                  className="cancel-btn" 
                  onClick={() => navigate('/users')} 
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="submit-btn" 
                  disabled={loading}
                >
                  {loading ? 'Procesando...' : (id ? 'Actualizar Usuario' : 'Crear Usuario')}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default UserEdit;
