const checkRole = (role) => {
  return (req, res, next) => {
    // Verificar si el usuario está autenticado y tiene el rol requerido
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    if (role && req.user.type !== role) {
      return res.status(403).json({ error: 'No autorizado. Se requiere rol: ' + role });
    }

    next();
  };
};

// Middleware para verificar si el usuario es administrador
const isAdmin = (req, res, next) => {
  if (!req.user || req.user.type !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado. Se requiere rol de administrador' });
  }
  next();
};

module.exports = { checkRole, isAdmin };