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
      const loggedIn = AuthService.isAuthenticated();
      setIsLoggedIn(loggedIn);
      
      if (loggedIn) {
        const user = AuthService.getCurrentUser();
        setUserName(user?.name || user?.email || 'Usuario');
        setIsAdmin(AuthService.isAdmin());
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
      AuthService.logout();
      
      // Disparar evento de cambio de autenticación
      window.dispatchEvent(new Event('authChange'));
      
      // Redireccionar a la página de inicio de sesión
      navigate('/signin');
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
            <Link to="/users" className="navbar-link">Usuarios</Link>
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