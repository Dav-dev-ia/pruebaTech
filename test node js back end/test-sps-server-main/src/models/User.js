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
        createdAt: new Date()
      }
    ];
    this.nextId = 2;
  }

  // Obtener todos los usuarios
  getAll() {
    return this.users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
  }

  // Obtener usuario por ID
  getById(id) {
    const user = this.users.find(u => u.id === parseInt(id));
    if (!user) return null;
    
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  // Obtener usuario por email
  getByEmail(email) {
    return this.users.find(u => u.email === email);
  }

  // Crear nuevo usuario
  create(userData) {
    // Verificar email único
    if (this.getByEmail(userData.email)) {
      throw new Error('Email already exists');
    }

    const newUser = {
      id: this.nextId++,
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.users.push(newUser);
    
    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  // Actualizar usuario
  update(id, userData) {
    const userIndex = this.users.findIndex(u => u.id === parseInt(id));
    if (userIndex === -1) return null;

    // Verificar email único si se está actualizando
    if (userData.email) {
      const existingUser = this.getByEmail(userData.email);
      if (existingUser && existingUser.id !== parseInt(id)) {
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

  // Eliminar usuario
  delete(id) {
    const userIndex = this.users.findIndex(u => u.id === parseInt(id));
    if (userIndex === -1) return false;

    this.users.splice(userIndex, 1);
    return true;
  }

  // Validar contraseña
  validatePassword(email, password) {
    const user = this.getByEmail(email);
    return user && user.password === password;
  }
}

module.exports = new User();
