# Sistema de Gestión de Usuarios SPS Group

Este proyecto consiste en una aplicación web para la gestión de usuarios, desarrollada con React para el frontend y Node.js para el backend.

## Características Principales

- Sistema de autenticación completo con JWT
- Gestión de usuarios (CRUD)
- Roles de usuario (Administrador y Usuario normal)
- Interfaz responsive y moderna
- Validaciones en tiempo real
- Persistencia de sesión con opción "Recordarme"
- Protección contra ataques de fuerza bruta
- Sanitización de inputs para prevenir XSS e inyección SQL

## Requisitos Previos

- Node.js (v14 o superior)
- npm o yarn
- Git

## Configuración del Proyecto

### Frontend (React)

1. Clonar el repositorio:
```bash
git clone <tu-repositorio>
cd test-sps-react-main
```

2. Instalar dependencias:
```bash
npm install
# o
yarn install
```

3. Crear archivo .env en la raíz del proyecto:
```env
REACT_APP_API_URL=http://localhost:3000
```

4. Iniciar el servidor de desarrollo:
```bash
npm start
# o
yarn start
```

### Backend (Node.js)

1. Navegar al directorio del backend:
```bash
cd test-sps-server-main
```

2. Instalar dependencias:
```bash
npm install
# o
yarn install
```

3. Crear archivo .env en la raíz del backend:
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

### Frontend

```
src/
├── components/       # Componentes reutilizables
├── pages/            # Páginas principales
├── services/         # Servicios para API
├── styles/           # Archivos CSS
└── routes.js         # Configuración de rutas
```

### Backend

```
src/
├── middleware/       # Middleware de autenticación y roles
├── models/           # Modelos de datos
└── routes.js         # Rutas de la API
```

## Flujo de Trabajo

1. El usuario accede a la página de inicio de sesión
2. Introduce credenciales y decide si quiere que se recuerde su sesión
3. Al autenticarse, recibe un token JWT que se almacena en localStorage o sessionStorage
4. El token se envía en cada petición a la API para validar la autenticación
5. Según el rol del usuario, tendrá acceso a diferentes funcionalidades

## Despliegue en Vercel

### Frontend

1. Crear una cuenta en [Vercel](https://vercel.com)
2. Instalar Vercel CLI:
```bash
npm install -g vercel
```

3. Configurar variables de entorno en Vercel:
   - Ve a la configuración del proyecto
   - Añade la variable REACT_APP_API_URL con la URL de tu backend desplegado

4. Desplegar:
```bash
vercel
```

5. Para producción:
```bash
vercel --prod
```

### Backend

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

## Solución de Problemas Comunes

### CORS
Si encuentras errores de CORS, asegúrate de que el backend tenga configurado correctamente el middleware de CORS para permitir peticiones desde el dominio del frontend.

### Autenticación
Si hay problemas con la autenticación, verifica:
- Que el token JWT se esté enviando correctamente en los headers
- Que el secreto JWT sea el mismo en el backend y en la configuración
- Que el token no haya expirado

### Despliegue
Si hay problemas al desplegar:
- Verifica que todas las variables de entorno estén configuradas
- Asegúrate de que el archivo vercel.json esté correctamente configurado
- Revisa los logs de Vercel para identificar errores específicos

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
git commit -m "Versión inicial del proyecto"
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

### Frontend
- Componentes funcionales con Hooks
- Separación de responsabilidades (servicios, componentes, páginas)
- Validación de formularios en tiempo real
- Manejo de estados y efectos secundarios
- Protección de rutas con autenticación
- Manejo de errores y feedback al usuario
- CSS modular para cada componente

### Backend
- Arquitectura RESTful
- Middleware para autenticación y autorización
- Validación y sanitización de inputs
- Manejo de errores con códigos HTTP apropiados
- Rate limiting para prevenir ataques
- Separación de responsabilidades (rutas, modelos, middleware)

## Retos Enfrentados Durante el Desarrollo

### Frontend
1. **Gestión del estado de autenticación**: Implementar un sistema que mantuviera la sesión del usuario según la opción "Recordarme".
   - Solución: Utilizar localStorage o sessionStorage según la preferencia del usuario.

2. **Validación de formularios**: Crear un sistema de validación en tiempo real que fuera intuitivo para el usuario.
   - Solución: Implementar validación onBlur y onChange con feedback visual inmediato.

3. **Protección de rutas**: Asegurar que solo usuarios autenticados pudieran acceder a ciertas páginas.
   - Solución: Crear un componente de ruta protegida que verificara la autenticación.

### Backend
1. **Seguridad**: Proteger contra ataques comunes como inyección, XSS y fuerza bruta.
   - Solución: Implementar sanitización de inputs, rate limiting y validación estricta.

2. **Persistencia de datos**: Crear un sistema de almacenamiento en memoria que fuera eficiente.
   - Solución: Implementar un modelo de usuario con métodos CRUD optimizados.

3. **Manejo de roles**: Diferenciar entre usuarios administradores y normales.
   - Solución: Crear middleware de verificación de roles para proteger rutas específicas.

## Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo LICENSE para más detalles.

## Contacto

Para cualquier consulta o sugerencia, por favor contacta a través de [tu-email@ejemplo.com](mailto:tu-email@ejemplo.com).
