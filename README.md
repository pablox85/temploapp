# TemploAPP

Aplicación web colaborativa para administrar una lista de ítems dentro de un templo o comunidad. Los usuarios autenticados pueden consultar la lista, agregar ítems y realizar sus selecciones; los administradores gestionan usuarios, roles, ítems y asignaciones.

## Demo

```text
Email: demo@demo.com
Contraseña: demo123
```

La cuenta demo debe existir en **Supabase Auth** y tener un perfil asociado. Estas credenciales son solo para pruebas y demostraciones.

## Stack

- Next.js 16 con App Router
- TypeScript estricto
- Tailwind CSS 4
- Supabase Auth, PostgreSQL y RLS
- Server Components y Server Actions
- Vercel

## Funcionalidades

- Inicio de sesión con email y contraseña.
- Lista colaborativa con búsqueda y filtros.
- Creación de ítems con normalización y prevención de duplicados.
- Selección y liberación de ítems.
- Visualización de disponibilidad y usuario asignado dentro del tenant.
- Panel administrativo con CRUD de ítems.
- Creación, listado y gestión de roles de usuarios.
- Reasignación administrativa de ítems.
- Dashboard con estadísticas de ítems, selecciones y usuarios.
- Diseño responsive, dark mode y navegación mobile-first.

## Arquitectura

```text
temploapp/
├── app/
│   ├── (auth)/login/              # autenticación
│   └── (dashboard)/dashboard/     # dashboard, ítems y administración
├── components/                   # componentes reutilizables
├── lib/
│   ├── auth/                      # autorización y acciones de usuarios
│   ├── services/                  # consultas server-side
│   ├── supabase/                  # clientes SSR y Admin server-only
│   └── types/                     # tipos TypeScript de la base
├── supabase/migrations/           # esquema, funciones, índices y RLS
└── proxy.ts                       # renovación de sesión y protección de rutas
```

Las lecturas se realizan desde Server Components y servicios server-side. Las mutaciones utilizan Server Actions. La autorización definitiva se aplica en PostgreSQL mediante Row Level Security; la `service_role` nunca se expone al navegador.

## Requisitos

- Node.js 22 o superior
- npm
- Proyecto de Supabase
- Supabase CLI (opcional, recomendado)

## Instalación local

```bash
cd temploapp
npm install
cp .env.example .env.local
```

Configura `.env.local` con las variables de Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://TU_PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=TU_CLAVE_PUBLICA
SUPABASE_SERVICE_ROLE_KEY=TU_CLAVE_PRIVADA_SOLO_SERVIDOR
NEXT_PUBLIC_USE_DEMO_DATA=false
```

`SUPABASE_SERVICE_ROLE_KEY` solo se utiliza en el servidor. Nunca debe tener prefijo `NEXT_PUBLIC_` ni enviarse al cliente.

## Base de datos y migraciones

Las migraciones están en [`temploapp/supabase/migrations`](temploapp/supabase/migrations). Deben ejecutarse en el orden de sus nombres.

Con Supabase CLI:

```bash
cd temploapp
supabase login
supabase link --project-ref TU_PROJECT_REF
supabase db push
```

También puedes copiar las migraciones en Supabase **SQL Editor** y ejecutarlas secuencialmente.

El esquema incluye tenants, perfiles, ítems, asignaciones, triggers, restricciones únicas, funciones transaccionales y políticas RLS.

## Roles y seguridad

| Acción | Usuario | Administrador |
| --- | --- | --- |
| Ver ítems y asignaciones del tenant | Sí | Sí |
| Crear ítems | Sí | Sí |
| Seleccionar o liberar sus asignaciones | Sí | Sí |
| Editar o eliminar ítems | No | Sí |
| Asignar ítems a otros usuarios | No | Sí |
| Crear usuarios y cambiar roles | No | Sí |

Todas las operaciones se vuelven a validar en el servidor y las políticas RLS aíslan los datos por tenant.

## Desarrollo

```bash
cd temploapp
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

Comprobaciones disponibles:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Despliegue en Vercel

1. Importa el repositorio en Vercel.
2. Configura `temploapp` como **Root Directory**.
3. Añade las variables de `.env.local` en Production, Preview y Development.
4. Ejecuta las migraciones en el proyecto Supabase remoto.
5. Configura en Supabase **Authentication → URL Configuration**:
   - Site URL: `https://tu-dominio.vercel.app`
   - Redirect URL: `https://tu-dominio.vercel.app/**`
6. Despliega el proyecto.

Vercel detecta Next.js automáticamente.

## Modo demo

Con `NEXT_PUBLIC_USE_DEMO_DATA=true`, la interfaz administrativa permanece disponible para demostración, pero las altas de usuarios y los cambios de rol se bloquean para evitar modificaciones reales en Supabase.

## Licencia

Proyecto privado de TemploAPP.
