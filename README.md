# PetClinicAI

Aplicación full‑stack de ejemplo para una clínica veterinaria:
- Backend: .NET 8 Minimal API + EF Core (SQL Server)
- Base de datos: SQL Server (esquema `clinic`)
- Frontend: React 18 + Vite + TypeScript

Este README recopila TODOS los prompts usados para generar la BD, el API y el frontend, además de instrucciones para correr el proyecto localmente.

## 🧭 Arquitectura

- SQL Server con BD `PetClinicAI`, esquema `clinic` y tablas: `Owners`, `Pets`, `Appointments`.
- API .NET 8 con endpoints REST para owners, pets y appointments, Swagger y CORS habilitado.
- Frontend React 18 con páginas de listado/creación, búsqueda, validaciones, toasts, filtros y paginación.

## ✅ Requisitos

- .NET SDK 8.x
- Node.js 18+ (recomendado 20+)
- SQL Server local o remoto accesible

## ⚡ Arranque rápido

1) Backend

```bash
cd PetClinicAI.API
dotnet build
dotnet run
```

2) Frontend

```bash
cd petclinicai-frontend
npm install
# Dev usando proxy de Vite (recomendado):
npm run dev
# o define la URL del backend
echo "VITE_API_BASE_URL=http://localhost:5259" > .env
npm run dev
```

Abre el navegador en http://localhost:5173 y verifica que el backend esté accesible (Swagger en http://localhost:5259/swagger).

---

## 🧩 Prompts usados (paso a paso)

### 1) Base de datos (SQL Server)

- Prompt: Conéctate a localhost, usando el perfil CSWEEK2025.
- Prompt: Crea una base de datos con el nombre de PetClinicAI.
- Prompt: Genera un script T‑SQL para SQL Server para crear una nueva base de datos llamada PetClinicAI con un esquema llamado clinic, y las siguientes tablas: Owners, Pets, Appointments (con claves primarias, foráneas y tipos adecuados).
- Prompt: Genera sentencias T‑SQL para insertar datos semilla (seed) en la base de datos PetClinicAI (al menos 3 owners, 4 pets y 3 appointments futuras).

Sugerencia adicional:
- Prompt: Muéstrame el script completo de creación (CREATE DATABASE, CREATE SCHEMA, CREATE TABLEs) y el script de seed para ejecutarlo en SSMS/azdata.

### 2) Backend (.NET 8 Minimal API)

- Prompt: Crea un proyecto .NET 8 Minimal API llamado PetClinicAI.API.
- Prompt: Instala las dependencias necesarias: Entity Framework Core con proveedor SQL Server, herramientas de diseño y Swagger.
- Prompt: Usa esta connection string para SQL Server: "Server=localhost,1433;Database=PetClinicAI;User Id=sa;Password=<TU_PASSWORD>;TrustServerCertificate=True;" (o la que corresponda a tu entorno).
- Prompt: Define los modelos: Owner, Pet, Appointment. Configura el DbContext con nombres de tabla bajo el esquema "clinic" y relaciones adecuadas.
- Prompt: Implementa endpoints GET/POST para owners, pets, appointments. Habilita Swagger y agrega DI. Incluye seed inicial si la base está vacía.
- Prompt: Organiza los .cs en carpetas según su tipo: Models, Data, Dtos, Endpoints. Extrae los endpoints en clases estáticas por recurso y mapea en Program.cs.
- Prompt: Habilita CORS para todas las conexiones (AllowAnyOrigin/AllowAnyHeader/AllowAnyMethod) en Program.cs.

Sugerencia adicional:
- Prompt: Valida el build y corrige warnings comunes, muestra estructura final del proyecto.

### 3) Frontend (React 18 + Vite + TS)

- Prompt: Crea una aplicación React 18 con Vite y TypeScript llamada petclinicai-frontend que consuma las APIs de un backend .NET 8 Minimal API corriendo en http://localhost:5259.
- Prompt: Configura una variable de entorno VITE_API_BASE_URL con la URL del backend. Crea un pequeño cliente fetch reutilizable.
- Prompt: Crea páginas usando componentes funcionales y hooks (useState, useEffect):
	- OwnersPage: Listar (GET /owners) y crear (POST /owners).
	- PetsPage: Listar (GET /pets) con info de owner y crear (POST /pets).
	- AppointmentsPage: Listar próximas (GET /appointments/upcoming) y crear (POST /appointments).
- Prompt: Agrega un menú de navegación simple para cambiar de página.
- Prompt: Incluye estados de loading y error en todas las llamadas fetch.
- Prompt: Estilos mínimos usando CSS moderno (sin framework), con tarjetas, tabs y focus ring accesible.
- Prompt: Cada formulario debe resetearse tras un alta exitosa y refrescar el listado.
- Prompt: En AppointmentsPage muestra pet name, species, owner name, phone, visit date y status.
- Prompt: Añade botón de búsqueda y filtros/paginación simple en todas las listas.
- Prompt: Añade validaciones inline de campos y toasts no intrusivos para confirmaciones y errores.
- Prompt: Añade vista detalle de Owner con sus Pets (GET /owners/{id}).
- Prompt: Ajusta el puerto real de la API en Vite (proxy) o mediante VITE_API_BASE_URL.

Sugerencia adicional:
- Prompt: Aplica un rediseño profesional/elegante con variables CSS, tarjetas, tabs y listas consistentes.

---

## ⚙️ Configuración clave aplicada

### CORS (backend)

En `PetClinicAI.API/Program.cs`:
- Política global `AllowAll` con `.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod()` y `app.UseCors("AllowAll")`.

### Proxy de Vite (dev)

En `petclinicai-frontend/vite.config.ts`:
- Proxy opcional para `/owners`, `/pets`, `/appointments` hacia `http://localhost:5259` y server en puerto 5173.

### Variable de entorno (frontend)

En `petclinicai-frontend/.env` (opcional en dev si usas proxy):

```bash
VITE_API_BASE_URL=http://localhost:5259
```

En `src/config.ts` se usa `VITE_API_BASE_URL` si está presente; si no, en dev la base es relativa (usa proxy) y en build usa `http://localhost:5259` por defecto.

---

## 🔗 Endpoints principales

- GET /owners
- POST /owners
- GET /owners/{id} (detalle con pets)
- GET /pets
- POST /pets
- GET /appointments/upcoming
- POST /appointments

Swagger: `http://localhost:5259/swagger`

---

## 📁 Estructura del repo (resumen)

- `PetClinicAI.API/` Backend .NET 8 (Models, Data, Dtos, Endpoints, Program.cs)
- `petclinicai-frontend/` React 18 + Vite + TS (pages, components, api, estilos)

---

## 🧪 Troubleshooting

- CORS bloqueado: confirma que el backend tiene `UseCors("AllowAll")` y que el frontend usa proxy o `VITE_API_BASE_URL` correcto.
- Puertos: verifica el puerto real del backend al iniciar (`dotnet run` imprime las URLs). Ajusta `.env` o `vite.config.ts`.
- SQL Server: valida la cadena de conexión y que la BD `PetClinicAI` exista y tenga el esquema `clinic` con tablas.

---

## 📌 Créditos

Generado paso a paso a partir de prompts estructurados para BD, API y frontend.
