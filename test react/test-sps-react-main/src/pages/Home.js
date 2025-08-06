import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import AuthService from "../services/AuthService";
import "../styles/Home.css";

function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    // Establecer el título de la página
    document.title = 'SPS Group - Inicio';
    
    // Verificar estado de autenticación
    const checkAuthStatus = () => {
      const loggedIn = AuthService.isAuthenticated();
      setIsAuthenticated(loggedIn);
      
      if (loggedIn) {
        const user = AuthService.getCurrentUser();
        setUserName(user?.name || user?.email || 'Usuario');
        setIsAdmin(AuthService.isAdmin());
      }
    };
    
    checkAuthStatus();
    
    // Escuchar cambios en la autenticación
    const handleAuthChange = () => checkAuthStatus();
    window.addEventListener('authChange', handleAuthChange);
    
    return () => {
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, []);

  return (
    <Layout>
      <div className="home-container">
        <div className="hero-section">
          <h1>Bienvenido a SPS Group</h1>
          <p className="subtitle">Sistema de gestión de usuarios</p>
          
          {isAuthenticated ? (
            <div className="welcome-section">
              <div className="user-greeting">
                <p>¡Hola, <span className="user-name-highlight">{userName}</span>!</p>
                {isAdmin && <span className="admin-badge">Administrador</span>}
              </div>
              
              <p className="welcome-message">Accede al panel de administración para gestionar usuarios</p>
              
              <div className="action-buttons">
                <Link to="/users" className="primary-button">
                  Gestionar Usuarios
                </Link>
              </div>
            </div>
          ) : (
            <div className="login-section">
              <p className="login-message">Inicia sesión para acceder al sistema de gestión</p>
              
              <div className="action-buttons">
                <Link to="/signin" className="primary-button">
                  Iniciar Sesión
                </Link>
              </div>
            </div>
          )}  
        </div>
      </div>
    </Layout>
  );
}

export default Home;
