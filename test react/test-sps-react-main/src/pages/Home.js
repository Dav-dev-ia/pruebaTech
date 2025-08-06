import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Layout from "../components/Layout";
import AuthService from "../services/AuthService";
import "../styles/Home.css";

function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLoginSuccess, setShowLoginSuccess] = useState(false);
  const [showAccessDenied, setShowAccessDenied] = useState(false);
  const location = useLocation();
  
  useEffect(() => {
    // Establecer el título de la página
    document.title = 'SPS Group - Inicio';
    
    // Verificar estado de autenticación
    const checkAuthStatus = () => {
      const loggedIn = AuthService.isAuthenticated();
      setIsAuthenticated(loggedIn);
      
      if (loggedIn) {
        const user = AuthService.getCurrentUser();
        // Extraer solo el nombre de usuario antes del @ si es un correo electrónico
        let displayName = user?.name || user?.email || 'Usuario';
        if (displayName.includes('@')) {
          displayName = displayName.split('@')[0];
        }
        setUserName(displayName);
        setIsAdmin(AuthService.isAdmin());
        
        // Mostrar mensaje de éxito si acaba de iniciar sesión
        if (location.state && location.state.justLoggedIn) {
          setShowLoginSuccess(true);
          // Ocultar el mensaje después de 5 segundos
          setTimeout(() => setShowLoginSuccess(false), 5000);
        }
        
        // Mostrar mensaje de acceso denegado si intentó acceder a una página restringida
        if (location.state && location.state.accessDenied) {
          setShowAccessDenied(true);
          // Ocultar el mensaje después de 5 segundos
          setTimeout(() => setShowAccessDenied(false), 5000);
        }
      }
    };
    
    checkAuthStatus();
    
    // Escuchar cambios en la autenticación
    const handleAuthChange = () => checkAuthStatus();
    window.addEventListener('authChange', handleAuthChange);
    
    return () => {
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, [location]);

  return (
    <Layout>
      <div className="home-container">
        <div className="hero-section">
          <h1>Bienvenido a SPS Group</h1>
          <p className="subtitle">Sistema de gestión de usuarios</p>
          
          {showLoginSuccess && (
            <div className="success-message" style={{ 
              backgroundColor: '#d4edda', 
              color: '#155724', 
              padding: '10px 15px', 
              borderRadius: '4px', 
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              <p style={{ margin: 0 }}>
                <strong>¡Conexión exitosa!</strong> Has iniciado sesión correctamente.
              </p>
            </div>
          )}
          
          {showAccessDenied && (
            <div className="error-message" style={{ 
              backgroundColor: '#f8d7da', 
              color: '#721c24', 
              padding: '10px 15px', 
              borderRadius: '4px', 
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              <p style={{ margin: 0 }}>
                <strong>Acceso denegado.</strong> No tienes permisos para acceder a esa página.
              </p>
            </div>
          )}
          
          {isAuthenticated ? (
            <div className="welcome-section">
              <div className="welcome-box" style={{
                backgroundColor: '#e8f4ff',
                border: '1px solid #b8daff',
                borderRadius: '8px',
                padding: '20px',
                marginBottom: '20px',
                textAlign: 'center',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                <h2 style={{ margin: '0 0 10px 0', color: '#0056b3' }}>¡Bienvenido, {userName}!</h2>
                <p style={{ margin: 0, fontSize: '16px', color: '#004085' }}>Gracias por iniciar sesión en nuestro sistema</p>
              </div>
              
              <div className="user-greeting">
                <p>¡Hola, <span className="user-name-highlight">{userName}</span>!</p>
                {isAdmin && <span className="admin-badge">Administrador</span>}
              </div>
              
              <p className="welcome-message">
                {isAdmin 
                  ? "Accede al panel de administración para gestionar usuarios" 
                  : "Bienvenido al sistema de SPS Group. Como usuario regular, solo puedes ver esta página de inicio."}
              </p>
              
              <div className="action-buttons">
                {isAdmin && (
                  <>
                    <Link to="/users" className="primary-button">
                      Gestionar Usuarios
                    </Link>
                    <Link to="/token-info" className="secondary-button">
                      Ver Info Token
                    </Link>
                  </>
                )}
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
