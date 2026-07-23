# TemploAPP

TemploAPP es una aplicación colaborativa para organizar ítems dentro de una comunidad. Permite ver la lista compartida, crear ítems, conocer su disponibilidad y administrarlos según el rol de cada persona.

## Demo

```text
Email: demo@demo.com
Contraseña: demo123
```

La cuenta demo debe existir en el proyecto de Supabase utilizado por la aplicación.

## Qué permite hacer

- Iniciar sesión con email y contraseña.
- Ver, buscar y filtrar ítems de la lista compartida.
- Crear nuevos ítems sin duplicados.
- Seleccionar o liberar ítems propios.
- Ver quién seleccionó un ítem dentro del tenant.
- Consultar estadísticas de ítems, selecciones y usuarios.
- Usar la aplicación desde escritorio o móvil, con modo oscuro.

### Administración

Las personas con rol administrador pueden:

- Editar y eliminar ítems.
- Gestionar asignaciones.
- Crear usuarios.
- Cambiar roles.
- Consultar los usuarios y sus ítems asignados.

## Tecnologías

- [Next.js](https://nextjs.org/) con App Router
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase](https://supabase.com/) para Auth, PostgreSQL y RLS
- [Vercel](https://vercel.com/) para despliegue

## Ejecutar el proyecto

### Requisitos

- Node.js 22 o superior
- npm
- Un proyecto de Supabase

Si usas nvm, desde la carpeta del proyecto ejecuta `nvm use`; el archivo `.nvmrc` selecciona Node 22.

### Instalación

```bash
npm install
cp .env.example .env.local
npm run dev
```

### Variables de entorno

```env
NEXT_PUBLIC_SUPABASE_URL=https://TU_PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=TU_CLAVE_PUBLICA
SUPABASE_SERVICE_ROLE_KEY=TU_CLAVE_PRIVADA_SOLO_SERVIDOR
NEXT_PUBLIC_USE_DEMO_DATA=false
NEXT_PUBLIC_CLARITY_PROJECT_ID=TU_ID_DE_PROYECTO_CLARITY
```

La clave `SUPABASE_SERVICE_ROLE_KEY` es exclusivamente para operaciones server-side y nunca debe exponerse en el navegador.

`NEXT_PUBLIC_CLARITY_PROJECT_ID` es opcional. Al configurarlo, Clarity se inicializa únicamente en el navegador; obtén el valor en **Microsoft Clarity → Settings → Overview**. Si no se define, no se carga ningún script de Clarity.

## Base de datos

Las migraciones están en [`supabase/migrations`](supabase/migrations). Ejecútalas en orden con Supabase CLI:

```bash
supabase login
supabase link --project-ref TU_PROJECT_REF
supabase db push
```

También puedes aplicarlas desde el SQL Editor de Supabase.

La base utiliza Row Level Security para aislar los datos por tenant y proteger todas las acciones de administración.

## Roles

| Acción | Usuario | Administrador |
| --- | --- | --- |
| Ver ítems del tenant | Sí | Sí |
| Crear ítems | Sí | Sí |
| Seleccionar o liberar ítems propios | Sí | Sí |
| Editar o eliminar ítems | No | Sí |
| Reasignar ítems | No | Sí |
| Gestionar usuarios y roles | No | Sí |

## Comprobaciones

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Despliegue en Vercel

1. Importa el repositorio en Vercel.
2. Agrega las variables de entorno de Supabase.
3. Ejecuta las migraciones en Supabase.
4. Configura la URL de producción en **Supabase Auth → URL Configuration**.
5. Despliega.

## Licencia

Proyecto privado de TemploAPP.
