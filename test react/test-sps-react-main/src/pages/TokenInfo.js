import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import AuthService from '../services/AuthService';
import { useNavigate } from 'react-router-dom';
import '../styles/TokenInfo.css';

function TokenInfo() {
  const [token, setToken] = useState('');
  const [decodedToken, setDecodedToken] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Establecer el título de la página
    document.title = 'SPS Group - Información de Token';
    
    // Verificar si el usuario es administrador
    const admin = AuthService.isAdmin();
    setIsAdmin(admin);
    
    if (admin) {
      // Obtener el token de localStorage o sessionStorage
      const currentToken = localStorage.getItem('token') || sessionStorage.getItem('token');
      setToken(currentToken || '');
      
      // Decodificar el token (solo la parte de payload)
      if (currentToken) {
        try {
          // El token JWT tiene formato: header.payload.signature
          // Tomamos la parte del payload (índice 1) y la decodificamos
          const payload = currentToken.split('.')[1];
          const decodedData = JSON.parse(atob(payload));
          setDecodedToken(decodedData);
        } catch (error) {
          console.error('Error al decodificar el token:', error);
        }
      }
    } else {
      // Si no es administrador, redirigir a la página principal con mensaje de error
      navigate('/', { state: { accessDenied: true } });
    }
  }, [navigate]);
  
  // Si el usuario no es administrador, no renderizar el componente
  if (!isAdmin) {
    return null;
  }
  
  return (
    <Layout>
      <div className="token-info-container">
        <h1>Información de Token JWT</h1>
        
        <div className="token-section">
          <h2>Tu Token JWT</h2>
          <div className="token-display">
            <pre>{token || 'No hay token disponible'}</pre>
            <button 
              className="copy-button" 
              onClick={() => {
                navigator.clipboard.writeText(token);
                alert('Token copiado al portapapeles');
              }}
              disabled={!token}
            >
              Copiar Token
            </button>
          </div>
        </div>
        
        {decodedToken && (
          <div className="token-data-section">
            <h2>Información del Token</h2>
            <div className="token-data">
              <div className="data-item">
                <span className="data-label">ID de Usuario:</span>
                <span className="data-value">{decodedToken.id}</span>
              </div>
              <div className="data-item">
                <span className="data-label">Email:</span>
                <span className="data-value">{decodedToken.email}</span>
              </div>
              <div className="data-item">
                <span className="data-label">Nombre:</span>
                <span className="data-value">{decodedToken.name}</span>
              </div>
              <div className="data-item">
                <span className="data-label">Tipo de Usuario:</span>
                <span className="data-value">{decodedToken.type}</span>
              </div>
              <div className="data-item">
                <span className="data-label">Fecha de Expiración:</span>
                <span className="data-value">
                  {new Date(decodedToken.exp * 1000).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}
        
        <div className="endpoints-section">
          <h2>Endpoints Protegidos</h2>
          <div className="endpoints-list">
            <div className="endpoint-item">
              <h3>Endpoints para Usuarios Autenticados</h3>
              <ul>
                <li>
                  <span className="endpoint-method">GET</span>
                  <span className="endpoint-url">/api/users</span>
                  <span className="endpoint-desc">Obtener lista de usuarios</span>
                </li>
                <li>
                  <span className="endpoint-method">GET</span>
                  <span className="endpoint-url">/api/users/:id</span>
                  <span className="endpoint-desc">Obtener detalles de un usuario específico</span>
                </li>
              </ul>
            </div>
            
            <div className="endpoint-item">
              <h3>Endpoints solo para Administradores</h3>
              <ul>
                <li>
                  <span className="endpoint-method">POST</span>
                  <span className="endpoint-url">/api/users</span>
                  <span className="endpoint-desc">Crear nuevo usuario</span>
                </li>
                <li>
                  <span className="endpoint-method">PUT</span>
                  <span className="endpoint-url">/api/users/:id</span>
                  <span className="endpoint-desc">Actualizar usuario existente</span>
                </li>
                <li>
                  <span className="endpoint-method">DELETE</span>
                  <span className="endpoint-url">/api/users/:id</span>
                  <span className="endpoint-desc">Eliminar usuario</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="curl-examples">
            <h3>Ejemplos de uso con cURL</h3>
            <div className="curl-example">
              <h4>Autenticación (obtener token)</h4>
              <pre>
                curl -X POST http://localhost:3001/api/login \
                -H "Content-Type: application/json" \
                -d "datos_json_aqui"
              </pre>
            </div>
            <div className="curl-example">
              <h4>Acceder a endpoint protegido</h4>
              <pre>
                curl -X GET http://localhost:3001/api/users \
                -H "Authorization: Bearer TU_TOKEN"
              </pre>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default TokenInfo;