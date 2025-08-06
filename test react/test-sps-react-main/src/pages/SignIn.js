import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/AuthService';
import '../styles/SignIn.css';

// Expresión regular para validar formato de email
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const navigate = useNavigate();
  
  // Verificar si el usuario ya está autenticado
  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      window.location.href = 'http://localhost:3001/';
    }
    
    // Recuperar email si está guardado
    const savedEmail = localStorage.getItem('userEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, [navigate]);

  // Validar email cuando cambia
  const validateEmail = (email) => {
    if (!email.trim()) {
      setEmailError('El email es obligatorio');
      return false;
    } else if (!EMAIL_REGEX.test(email)) {
      setEmailError('Formato de email inválido');
      return false;
    } else {
      setEmailError('');
      return true;
    }
  };
  
  // Validar contraseña cuando cambia
  const validatePassword = (password) => {
    if (!password) {
      setPasswordError('La contraseña es obligatoria');
      return false;
    } else if (password.length < 4) {
      setPasswordError('La contraseña debe tener al menos 4 caracteres');
      return false;
    } else {
      setPasswordError('');
      return true;
    }
  };
  
  // Manejar cambios en el email
  const handleEmailChange = (e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    if (emailError) validateEmail(newEmail);
  };
  
  // Manejar cambios en la contraseña
  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    if (passwordError) validatePassword(newPassword);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Limpiar errores previos
    setError('');
    
    // Validación completa antes de enviar
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    
    if (!isEmailValid || !isPasswordValid) {
      return;
    }
    
    setLoading(true);

    try {
      const response = await AuthService.login(email, password);
      
      // Guardar información del usuario según preferencia
      if (rememberMe) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('userEmail', email);
        localStorage.setItem('user', JSON.stringify(response.user));
      } else {
        sessionStorage.setItem('token', response.token);
        sessionStorage.setItem('user', JSON.stringify(response.user));
        localStorage.removeItem('userEmail');
      }
      
      window.location.href = 'http://localhost:3001/';
    } catch (err) {
      console.error('Error de inicio de sesión:', err);
      setError(err.message || 'Error al iniciar sesión. Verifique sus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signin-container">
      <div className="signin-form">
        <h1>Sign In</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Dirección de email</label>
            <input
              type="email"
              value={email}
              onChange={handleEmailChange}
              onBlur={() => validateEmail(email)}
              required
              placeholder="Ingrese su email"
              className={emailError ? 'input-error' : ''}
              disabled={loading}
            />
            {emailError && <div className="field-error">{emailError}</div>}
          </div>
          
          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={handlePasswordChange}
              onBlur={() => validatePassword(password)}
              required
              placeholder="Ingrese su contraseña"
              className={passwordError ? 'input-error' : ''}
              disabled={loading}
            />
            {passwordError && <div className="field-error">{passwordError}</div>}
          </div>

          <div className="remember-me-container">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={() => setRememberMe(!rememberMe)}
              disabled={loading}
            />
            <label htmlFor="rememberMe">Recordarme</label>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={loading} className="signin-button">
            {loading ? (
              <>
                <span className="spinner"></span>
                <span>Iniciando sesión...</span>
              </>
            ) : (
              'Iniciar sesión'
            )}
          </button>
        </form>

        <div className="demo-info">
          <p>Use estas credenciales para iniciar sesión:</p>
          <p><strong>Email:</strong> admin@spsgroup.com.br</p>
          <p><strong>Password:</strong> 1234</p>
        </div>
      </div>
    </div>
  );
}

export default SignIn;
