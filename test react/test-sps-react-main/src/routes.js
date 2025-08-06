import React from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import AuthService from "./services/AuthService";

import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import Users from "./pages/Users";
import UserEdit from "./pages/UserEdit";

/**
 * Componente para rutas que requieren autenticación
 * @param {Object} props - Propiedades del componente
 * @param {React.ReactNode} props.children - Componentes hijos
 * @returns {React.ReactNode} - Componente renderizado
 */
const PrivateRoute = ({ children }) => {
  return AuthService.isAuthenticated() ? children : <Navigate to="/signin" replace />;
};

/**
 * Componente para rutas que requieren rol de administrador
 * @param {Object} props - Propiedades del componente
 * @param {React.ReactNode} props.children - Componentes hijos
 * @returns {React.ReactNode} - Componente renderizado
 */
const AdminRoute = ({ children }) => {
  if (!AuthService.isAuthenticated()) {
    return <Navigate to="/signin" replace />;
  }
  
  return AuthService.isAdmin() ? 
    children : 
    <Navigate to="/users" replace />;
};

/**
 * Componente para redirigir usuarios autenticados desde páginas públicas
 * @param {Object} props - Propiedades del componente
 * @param {React.ReactNode} props.children - Componentes hijos
 * @returns {React.ReactNode} - Componente renderizado
 */
const PublicRoute = ({ children }) => {
  return AuthService.isAuthenticated() ? 
    <Navigate to="/users" replace /> : 
    children;
};

/**
 * Configuración de rutas de la aplicación
 * - Rutas públicas: Home, SignIn
 * - Rutas privadas (requieren autenticación): Users (vista)
 * - Rutas admin (requieren rol de administrador): UserEdit, creación de usuarios
 */
const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <PublicRoute>
        <Home />
      </PublicRoute>
    ),
  },
  {
    path: "/signin",
    element: (
      <PublicRoute>
        <SignIn />
      </PublicRoute>
    ),
  },
  {
    path: "/users",
    element: (
      <PrivateRoute>
        <Users />
      </PrivateRoute>
    ),
  },
  {
    path: "/users/new",
    element: (
      <AdminRoute>
        <UserEdit isNew={true} />
      </AdminRoute>
    ),
  },
  {
    path: "/users/:id",
    element: (
      <AdminRoute>
        <UserEdit />
      </AdminRoute>
    ),
  },
  {
    // Ruta de fallback para rutas no encontradas
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);

export default router;
