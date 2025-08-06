# API REST para Gestión de Usuarios - SPS Group

Este proyecto implementa una API REST para la gestión de usuarios, desarrollada con Node.js y Express. Forma parte del sistema de gestión de usuarios de SPS Group, trabajando en conjunto con el frontend React.

## Características Principales

- API RESTful completa para gestión de usuarios
- Autenticación mediante JWT (JSON Web Tokens)
- Sistema de roles (administrador y usuario normal)
- Validación y sanitización de datos
- Protección contra ataques de fuerza bruta mediante rate limiting
- Almacenamiento en memoria para facilitar pruebas

## Requisitos Previos

- Node.js (v14 o superior)
- npm o yarn
- Git

## Configuración del Proyecto

1. Clonar el repositorio:
```bash
git clone <tu-repositorio>
cd test-sps-server-main
```

2. Instalar dependencias:
```bash
npm install
# o
yarn install
```

3. Crear archivo .env en la raíz del proyecto:
```env
PORT=3000
JWT_SECRET=tu_secreto_jwt
ADMIN_EMAIL=admin@spsgroup.com.br
ADMIN_PASSWORD=1234
```

4. Iniciar el servidor:
```bash
npm run dev
# o
yarn dev
```

## Estructura del Proyecto

```
src/
├── index.js           # Punto de entrada de la aplicación
├── routes.js          # Definición de rutas de la API
├── middleware/        # Middleware personalizado
│   ├── auth.js        # Middleware de autenticación JWT
│   └── checkRole.js   # Middleware de verificación de roles
└── models/            # Modelos de datos
    └── User.js        # Modelo de usuario (almacenamiento en memoria)
```

## Endpoints de la API

### Autenticación

- **POST /api/login**
  - Descripción: Autenticar usuario y generar token JWT
  - Cuerpo: `{ "email": "string", "password": "string" }`
  - Respuesta: `{ "token": "string", "user": Object, "message": "string" }`

### Usuarios

- **GET /api/users**
  - Descripción: Obtener todos los usuarios
  - Autenticación: Requerida
  - Respuesta: `[{ "id": number, "name": "string", "email": "string", "type": "string" }]`

- **GET /api/users/:id**
  - Descripción: Obtener usuario por ID
  - Autenticación: Requerida
  - Respuesta: `{ "id": number, "name": "string", "email": "string", "type": "string" }`

- **POST /api/users**
  - Descripción: Crear nuevo usuario
  - Autenticación: Requerida (solo admin)
  - Cuerpo: `{ "name": "string", "email": "string", "password": "string", "type": "string" }`
  - Respuesta: `{ "id": number, "name": "string", "email": "string", "type": "string" }`

- **PUT /api/users/:id**
  - Descripción: Actualizar usuario existente
  - Autenticación: Requerida (admin o mismo usuario)
  - Cuerpo: `{ "name": "string", "email": "string", "password": "string", "type": "string" }`
  - Respuesta: `{ "id": number, "name": "string", "email": "string", "type": "string" }`

- **DELETE /api/users/:id**
  - Descripción: Eliminar usuario
  - Autenticación: Requerida (solo admin)
  - Respuesta: `{ "message": "string" }`

## Seguridad Implementada

1. **Autenticación JWT**
   - Tokens firmados con secreto único
   - Verificación en cada petición protegida

2. **Protección contra ataques**
   - Rate limiting para prevenir ataques de fuerza bruta
   - Sanitización de inputs para prevenir inyección y XSS
   - Validación de datos en cada endpoint

3. **Control de acceso basado en roles**
   - Middleware para verificar roles de usuario
   - Restricción de acciones según el tipo de usuario

## Despliegue en Vercel

1. Asegúrate de tener un archivo `vercel.json` en la raíz del proyecto:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/index.js"
    }
  ]
}
```

2. Configurar variables de entorno en Vercel:
   - JWT_SECRET
   - ADMIN_EMAIL
   - ADMIN_PASSWORD

3. Desplegar:
```bash
vercel
```

4. Para producción:
```bash
vercel --prod
```

## Subir a GitHub

1. Crear un nuevo repositorio en GitHub

2. Inicializar Git en el proyecto (si no está ya inicializado):
```bash
git init
```

3. Añadir todos los archivos al staging:
```bash
git add .
```

4. Hacer commit de los cambios:
```bash
git commit -m "Versión inicial de la API"
```

5. Añadir el repositorio remoto:
```bash
git remote add origin https://github.com/tu-usuario/tu-repositorio.git
```

6. Subir los cambios:
```bash
git push -u origin master
# o
git push -u origin main
```

## Prácticas de Código Implementadas

- **Arquitectura RESTful**: Diseño de API siguiendo principios REST
- **Middleware modular**: Separación de responsabilidades en middleware específicos
- **Validación robusta**: Validación de datos en cada endpoint
- **Manejo de errores**: Respuestas de error consistentes con códigos HTTP apropiados
- **Seguridad**: Implementación de múltiples capas de seguridad
- **Código limpio**: Estructura organizada y comentarios explicativos

## Retos Enfrentados Durante el Desarrollo

1. **Implementación de JWT**: Configurar correctamente la generación y verificación de tokens JWT.
   - Solución: Utilizar la biblioteca jsonwebtoken con un secreto seguro y configurar middleware de autenticación.

2. **Almacenamiento en memoria**: Diseñar un sistema de almacenamiento en memoria que fuera eficiente y permitiera operaciones CRUD.
   - Solución: Implementar una clase User con métodos para gestionar el array de usuarios en memoria.

3. **Control de acceso**: Implementar un sistema que permitiera diferentes niveles de acceso según el rol del usuario.
   - Solución: Crear middleware de verificación de roles que se pudiera aplicar a rutas específicas.

4. **Seguridad**: Proteger la API contra diversos tipos de ataques.
   - Solución: Implementar rate limiting, sanitización de inputs y validación estricta de datos.

## Pruebas

Para verificar que la API funciona correctamente:

1. Iniciar el servidor:
```bash
npm run dev
```

2. Probar la autenticación con el usuario administrador predeterminado:
```bash
curl -X POST http://localhost:3000/api/login -H "Content-Type: application/json" -d '{"email":"admin@spsgroup.com.br","password":"1234"}'
```

3. Usar el token recibido para acceder a endpoints protegidos:
```bash
curl -X GET http://localhost:3000/api/users -H "Authorization: Bearer TU_TOKEN"
```

## Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo LICENSE para más detalles.

## Contacto

Para cualquier consulta o sugerencia, por favor contacta a través de [tu-email@ejemplo.com](mailto:tu-email@ejemplo.com).
