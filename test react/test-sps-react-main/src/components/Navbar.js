import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthService from '../services/AuthService';
import '../styles/Navbar.css';

function Navbar() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    // Verificar estado de autenticación
    const checkAuthStatus = () => {
      try {
        const loggedIn = AuthService.isAuthenticated();
        setIsLoggedIn(loggedIn);
        
        if (loggedIn) {
          const user = AuthService.getCurrentUser();
          if (!user) {
            // Si no hay usuario pero hay token, posible inconsistencia
            console.warn('Token presente pero no hay datos de usuario');
            AuthService.logout();
            setIsLoggedIn(false);
            return;
          }
          
          // Extraer solo el nombre de usuario antes del @ si es un correo electrónico
          let displayName = user?.name || user?.email || 'Usuario';
          if (displayName.includes('@')) {
            displayName = displayName.split('@')[0];
          }
          setUserName(displayName);
          setIsAdmin(AuthService.isAdmin());
        } else {
          // Limpiar datos si no está autenticado
          setUserName('');
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Error al verificar estado de autenticación:', error);
        // En caso de error, cerrar sesión para evitar estados inconsistentes
        AuthService.logout();
        setIsLoggedIn(false);
        setUserName('');
        setIsAdmin(false);
      }
    };
    
    checkAuthStatus();
    
    // Crear un evento personalizado para actualizar el navbar cuando cambie la autenticación
    const handleAuthChange = () => checkAuthStatus();
    window.addEventListener('authChange', handleAuthChange);
    
    return () => {
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, []);

  const handleLogout = () => {
    // Mostrar confirmación antes de cerrar sesión
    if (window.confirm('¿Está seguro que desea cerrar sesión?')) {
      try {
        // Intentar cerrar sesión
        AuthService.logout();
        
        // Disparar evento de cambio de autenticación
        window.dispatchEvent(new Event('authChange'));
        
        // Redireccionar a la página de inicio de sesión
        navigate('/signin');
      } catch (error) {
        console.error('Error al cerrar sesión:', error);
        // Forzar limpieza en caso de error
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        
        // Redireccionar a la página de inicio de sesión
        navigate('/signin');
      }
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container container">
        <div className="navbar-logo">
          <Link to="/">SPS Group</Link>
        </div>
        
        <div className="navbar-links">
          <Link to="/" className="navbar-link">Inicio</Link>
          {isLoggedIn && (
            <>
              <Link to="/users" className="navbar-link">Usuarios</Link>
              {isAdmin && (
                <Link to="/token-info" className="navbar-link">Info Token</Link>
              )}
            </>
          )}
        </div>
        
        <div className="navbar-auth">
          {isLoggedIn ? (
            <div className="user-menu">
              <span className="user-name">{userName}</span>
              {isAdmin && <span className="admin-badge">Admin</span>}
              <button onClick={handleLogout} className="logout-btn">Cerrar Sesión</button>
            </div>
          ) : (
            <Link to="/signin" className="navbar-link login-link">Iniciar Sesión</Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;