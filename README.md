<div align="center">

# ✂️ Channel Scheduling System

**Sistema integral de agendamiento de citas para el salón de belleza Channel Peluquería**

[![Angular](https://img.shields.io/badge/Angular-20-DD0031?style=for-the-badge&logo=angular&logoColor=white)](https://angular.io/)
[![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express-5-404D59?style=for-the-badge)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)

Un sistema moderno, seguro y escalable diseñado para gestionar citas, servicios, usuarios y la disponibilidad del personal en salones de belleza.

</div>

---

## 📋 Tabla de Contenidos

- [🚀 Novedades (Release 1.1.0)](#-novedades-release-110)
- [💻 Ecosistema y Tecnologías](#-ecosistema-y-tecnologías)
- [🧭 Arquitectura del Proyecto](#-arquitectura-del-proyecto)
- [🛠️ Configuración Local](#️-configuración-local)
- [⚙️ Variables de Entorno](#️-variables-de-entorno)
- [🌐 API Endpoints](#-api-endpoints)
- [🔧 CI / CD y DevOps](#-ci--cd-y-devops)

---

## 🚀 Novedades (Release 1.1.0)

Esta versión incluye un flujo operativo completo tanto para administradores como para clientes, destacando:

- 🔐 **Autenticación robusta**: Implementada con JWT usando `jose`. Incluye recuperación de contraseña completa (solicitud, verificación OTP y reseteo).
- 👥 **Gestión de Usuarios**: Sistema de roles y estados. Soporta creación, lectura, actualización, y activación/desactivación de cuentas.
- 💅 **Catálogo de Servicios**: CRUD completo de servicios con administración de estado (activo/inactivo).
- ⏱️ **Control de Disponibilidad**: Gestión detallada para trabajadores, incluyendo horas laborales, tiempos libres, días libres y periodos vacacionales.
- 📅 **Flujo de Citas Inteligente**:
  - Verificación en tiempo real de solapamiento de horarios.
  - Reservas, historial y vista de calendario.
  - Flujo de aprobación, rechazo, cancelación y cambio de estados.
- 🛡️ **Seguridad Mejorada**: Middleware de verificación de roles, Rate Limiting integrado, y configuración CORS ajustada (especialmente para métodos `PATCH`).

---

## 💻 Ecosistema y Tecnologías

El proyecto está construido bajo una arquitectura cliente-servidor estrictamente tipada con **TypeScript**, utilizando herramientas de última generación para garantizar rendimiento y seguridad.

### ⚡ Backend (Servidor y API)

Construido sobre módulos nativos de Node y tipado estricto con **TypeScript 5.9**.

| Categoría         | Tecnologías Clave                                                                                                       |
| :---------------- | :---------------------------------------------------------------------------------------------------------------------- |
| **Núcleo API**    | **Express 5** (manejo nativo de promesas) • `cookie-parser`                                                             |
| **Base de Datos** | **Prisma 7** (ORM) • `@prisma/adapter-mariadb`                                                                          |
| **Seguridad**     | `jose` (JWT moderno) • `bcrypt` (Hashing) • `helmet` (Cabeceras HTTP) • `express-rate-limit` (Mitigación DDoS) • `cors` |
| **Validación**    | `zod` (Validación de esquemas fuertemente tipados)                                                                      |
| **Utilidades**    | `nodemailer` (Envío de correos/OTP) • `temporal-polyfill` (Manejo moderno de fechas) • `dotenv`                         |

### 🎨 Frontend (Aplicación Cliente)

Una Single Page Application (SPA) robusta, reactiva y modular basada en **Angular 20**.

| Categoría        | Tecnologías Clave                                                                        |
| :--------------- | :--------------------------------------------------------------------------------------- |
| **Framework**    | **Angular 20** (`@angular/core`, `@angular/common`, `@angular/router`, `@angular/forms`) |
| **UI & Estilos** | **Angular Material 20** (Componentes) • **Tailwind CSS 3.4** (PostCSS, Autoprefixer)     |
| **Reactividad**  | **RxJS 7.8** (Programación reactiva)                                                     |
| **Validación**   | `zod` (Compartiendo la misma lógica de validación del backend)                           |
| **Utilidades**   | `date-fns` (Manipulación de fechas en el cliente)                                        |

### 🧪 Testing & Code Quality

El código se mantiene limpio y testeado gracias a un conjunto estandarizado de herramientas:

- **Backend Testing:** `jest` (v30), `ts-jest` para cobertura de pruebas y TDD.
- **Frontend Testing:** `karma` y `jasmine`.
- **Linter & Formatter:** `eslint` (v9) y `prettier` (configurado en ambos entornos, incluyendo parseo específico para HTML de Angular).
- **Ejecución de Desarrollo:** `tsx` para recarga en caliente y ejecución rápida de TypeScript en Node.

---

## 🧭 Arquitectura del Proyecto

```text
📦 Channel_Scheduling_System
 ┣ 📂 backend/                 # API RESTful (Express + Prisma + TypeScript)
 ┃ ┣ 📜 docker-compose.yml     # Contenedor de base de datos MySQL local
 ┃ ┗ 📜 .env.example           # Plantilla de variables de entorno
 ┣ 📂 frontend/                # Aplicación cliente (Angular 20)
 ┗ 📂 .github/workflows/       # Pipelines de CI/CD (GitHub Actions)
```

---

## 🛠️ Configuración Local

Sigue estos pasos para levantar el entorno de desarrollo en tu máquina local.

### 1️⃣ Backend

```bash
# 1. Navegar al directorio backend
cd backend

# 2. Instalar dependencias limpias
npm ci

# 3. Configurar variables de entorno
cp .env.example .env

# 4. Levantar la base de datos MySQL usando Docker
docker compose up -d

# 5. Aplicar migraciones prisma al back y a la base de datos
npx prisma generate
npx prisma migrate deploy

# 6. Iniciar el servidor en modo desarrollo
npm run dev
```

_(Otros scripts útiles: `npm run build`, `npm run lint`, `npm run test`, `npm run test:coverage`)_

### 2️⃣ Frontend

```bash
# 1. Navegar al directorio frontend
cd frontend

# 2. Instalar dependencias limpias
npm ci

# 3. Levantar la aplicación Angular
npm start
```

---

## ⚙️ Variables de Entorno

Asegúrate de configurar correctamente tu archivo `backend/.env`. Aquí tienes las variables clave:

| Categoría           | Variables Principales                                                                                  |
| :------------------ | :----------------------------------------------------------------------------------------------------- |
| **Sistema**         | `NODE_ENV`, `PORT`, `FRONTEND_URL`                                                                     |
| **Base de Datos**   | `DATABASE_URL`                                                                                         |
| **Seguridad (JWT)** | `JWT_SECRET`, `JWT_EXPIRES_IN`, `JWT_SECRET_REFRESH`, `JWT_EXPIRES_IN_REFRESH`, `JWT_RESETPASS_SECRET` |
| **Seguridad (OTP)** | `OTP_SECRET`, `OTP_EXPIRES_IN`, `TOKEN_SECRET`, `FIRST_ADMIN_SECRET_CODE`                              |
| **Mailing (SMTP)**  | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM`                                       |

---

## 🌐 API Endpoints

Todos los endpoints tienen el prefijo `/api`. Expande cada sección para ver las rutas disponibles:

<details>
<summary><b>🔐 Autenticación</b></summary>

- `POST /api/auth/register` - Registro de nuevos usuarios
- `POST /api/auth/login` - Inicio de sesión
- `POST /api/auth/refresh` - Refresco de token JWT
- `POST /api/auth/logout` - Cierre de sesión
- `POST /api/auth/password-reset/request` - Solicitar reseteo de contraseña
- `POST /api/auth/password-reset/verify` - Verificar código de reseteo
- `POST /api/auth/password-reset/reset` - Establecer nueva contraseña
- `GET /api/auth/admin/exists` - Verificar si existe un primer administrador
</details>

<details>
<summary><b>👥 Usuarios</b></summary>

- `GET /api/users` - Listar usuarios
- `POST /api/users` - Crear usuario
- `GET /api/users/:id` - Obtener detalles de un usuario
- `PUT /api/users/:id` - Actualizar información del usuario
- `PATCH /api/users/:id/password` - Cambiar contraseña
- `PATCH /api/users/:id/state` - Cambiar estado del usuario (activo/inactivo)
- `PATCH /api/users/me/deactivate` - Desactivar cuenta propia
</details>

<details>
<summary><b>💅 Servicios</b></summary>

- `GET /api/services` - Listar servicios
- `POST /api/services` - Crear nuevo servicio
- `GET /api/services/:id` - Ver detalles del servicio
- `PUT /api/services/:id` - Modificar servicio
- `PATCH /api/services/:id/state` - Cambiar estado del servicio
- `DELETE /api/services/:id` - Eliminar servicio
</details>

<details>
<summary><b>⏱️ Disponibilidad (Trabajadores)</b></summary>

- `GET /api/availability/worker/:id` - Consultar disponibilidad
- `GET /api/availability/:id/config` - Consultar configuración
- `PUT /api/availability/:id/working-hours` - Configurar horas de trabajo
- `POST /api/availability/:id/time-off` - Añadir horas libres
- `POST /api/availability/:id/day-off` - Añadir día libre
- `POST /api/availability/:id/period-off` - Añadir periodo vacacional
- `DELETE /api/availability/:id` - Eliminar configuración
</details>

<details>
<summary><b>📅 Citas</b></summary>

- `POST /api/appointments/verify-overlap` - Validar solapamiento
- `POST /api/appointments` - Agendar nueva cita
- `GET /api/appointments/history` - Historial de citas
- `GET /api/appointments/calendar` - Vista para calendario
- `GET /api/appointments/quantity` - Estadísticas de citas
- `GET /api/appointments/:id` - Detalles de cita
- `PATCH /api/appointments/:id/approve` - Aprobar cita
- `PATCH /api/appointments/:id/reject` - Rechazar cita
- `PATCH /api/appointments/:id/cancel` - Cancelar cita
- `PATCH /api/appointments/:id/status` - Actualizar estado general
</details>

---

## 🔧 CI / CD y DevOps

El proyecto cuenta con integración y despliegue continuo configurado en GitHub Actions (`.github/workflows/ci.yml`).

### Pipeline automatizado:

1. Checkout del código fuente.
2. Instalación de dependencias y generación de cliente Prisma (`prisma generate`).
3. Compilación de TypeScript (Build).
4. Análisis estático de código (Linting).
5. Ejecución de migraciones de Prisma en entorno de pruebas.
6. Tests automatizados con reporte de cobertura.
7. Análisis de calidad de código con **SonarCloud Scan**.

### Estrategia de Deploy:

Preparado para despliegue en VPS (vía SSH) automatizando:

- Pull de los últimos cambios del repositorio.
- Re-compilación del Backend y Frontend.
- Reinicio automático de los servicios en producción.
