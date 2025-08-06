// Modelo de usuario en memoria
class User {
  constructor() {
    this.users = [
      {
        id: 1,
        name: "admin",
        email: "admin@spsgroup.com.br",
        type: "admin",
        password: "1234",
        createdAt: new Date(),
        active: true
      }
    ];
    this.nextId = 2;
  }

  // Obtener todos los usuarios
  getAll() {
    return this.users
      .filter(user => user.active !== false) // Solo retornar usuarios activos
      .map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
  }

  // Obtener usuario por ID
  getById(id) {
    const user = this.users.find(u => u.id === parseInt(id) && u.active !== false);
    if (!user) return null;
    
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  // Obtener usuario por email
  getByEmail(email) {
    return this.users.find(u => u.email === email && u.active !== false);
  }

  // Verificar si un email ya existe en cualquier usuario (activo o inactivo)
  emailExists(email) {
    return this.users.some(u => u.email === email);
  }

  // Crear nuevo usuario
  create(userData) {
    // Verificar email único (incluyendo usuarios inactivos)
    if (this.emailExists(userData.email)) {
      throw new Error('Email already exists');
    }

    const newUser = {
      id: this.nextId++,
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
      active: true
    };
    
    this.users.push(newUser);
    
    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  // Actualizar usuario
  update(id, userData) {
    const userIndex = this.users.findIndex(u => u.id === parseInt(id));
    if (userIndex === -1) return null;

    // Verificar email único si se está actualizando (incluyendo usuarios inactivos)
    if (userData.email) {
      // Buscar cualquier usuario con ese email excepto el actual
      const emailInUse = this.users.some(u => 
        u.email === userData.email && u.id !== parseInt(id)
      );
      if (emailInUse) {
        throw new Error('Email already exists');
      }
    }

    this.users[userIndex] = {
      ...this.users[userIndex],
      ...userData,
      updatedAt: new Date()
    };

    const { password, ...userWithoutPassword } = this.users[userIndex];
    return userWithoutPassword;
  }

  // Marcar usuario como inactivo (soft delete)
  delete(id) {
    const userIndex = this.users.findIndex(u => u.id === parseInt(id));
    if (userIndex === -1) return false;

    // En lugar de eliminar, marcamos como inactivo
    this.users[userIndex].active = false;
    this.users[userIndex].updatedAt = new Date();
    return true;
  }

  // Validar contraseña
  validatePassword(email, password) {
    const user = this.getByEmail(email);
    // Solo validar si el usuario existe, está activo y la contraseña coincide
    return user && user.active !== false && user.password === password;
  }
}

module.exports = new User();
