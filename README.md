# 🧪 Prueba SPS – CRUD de Usuarios (React + Node)

Este proyecto consiste en la implementación de un sistema completo de autenticación y gestión de usuarios, dividido en dos partes: una API REST en Node.js y una interfaz web en React. El objetivo fue cumplir con los requisitos técnicos definidos para validar habilidades en desarrollo full-stack.

---

## ⚙️ Tecnologías Utilizadas

- **Frontend:** React, Axios, React Router, Context API
- **Backend:** Node.js, Express, JWT
- **Almacenamiento:** Repositorio en memoria (mock), LocalStorage para token
- **Autenticación:** JWT con usuario administrador predefinido

---

## 🚧 Retos Enfrentados y Soluciones

### 🔐 Autenticación con Usuario Predefinido (Node)
**Reto:** Implementar una ruta de login que valide contra un usuario fijo sin cifrado, y genere un token JWT válido.

**Solución:** Se creó una ruta `/auth/login` que compara los datos recibidos con el usuario `{ name: "admin", email: "admin@spsgroup.com.br", type: "admin", password: "1234" }`. Al validar, se genera un JWT que se usa para proteger todas las rutas posteriores.

---

### 🧠 Validación de Token en Rutas Protegidas (Node)
**Reto:** Asegurar que todas las rutas del CRUD solo puedan ser accedidas si el usuario está autenticado.

**Solución:** Se creó un middleware `verifyToken` que intercepta las peticiones y valida el JWT. Si el token es inválido o no existe, se retorna un error 401.

---

### 🧾 Prevención de Correos Duplicados (Node)
**Reto:** Evitar el registro de usuarios con correos electrónicos ya existentes en el repositorio en memoria.

**Solución:** Se implementó una verificación previa en la ruta `POST /users` que busca coincidencias por email antes de permitir el registro.

---

### 🧑‍💻 CRUD Condicional en React
**Reto:** Mostrar y permitir acciones del CRUD solo si el usuario está autenticado.

**Solución:** Se utilizó Context API para manejar el estado de autenticación. El token se guarda en `localStorage` y se verifica en cada render. Si no hay token, se redirige al login.

---

### 🔄 Sincronización Frontend–Backend
**Reto:** Consumir correctamente la API `test-sps-server` desde React, manejando errores y estados de carga.

**Solución:** Se usó Axios para realizar peticiones con el token en los headers. Se implementaron mensajes de error y loading para mejorar la experiencia de usuario.

---

## 🤖 Optimización con IA

Para mejorar la calidad de los comentarios en el código 
- Redacción clara y profesional del README
- 
## ✅ Estado

✔️ Autenticación funcional  
✔️ CRUD completo con validaciones  
✔️ Protección de rutas  
✔️ Interfaz reactiva y segura

---

**Para más detalles técnicos o revisión del código, consultar los repositorios:**

- 🔗 [Frontend – SPS React](https://github.com/Dav-dev-ia/pruebaTech/tree/main/test%20react/test-sps-react-main)
- 🔗 [Backend – SPS Node](https://github.com/Dav-dev-ia/pruebaTech/tree/main/test%20node%20js%20back%20end/test-sps-server-main)

---

