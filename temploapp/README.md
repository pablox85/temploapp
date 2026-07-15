# TemploAPP

MVP de lista colaborativa construido con Next.js 16 (App Router), TypeScript, Tailwind CSS 4 y Supabase. La autorización vive en PostgreSQL mediante Row Level Security; el frontend nunca utiliza `service_role`.

## Funcionalidad

- Inicio de sesión estándar con email y contraseña mediante Supabase Auth.
- Lista global con búsqueda, contador de selecciones y selección múltiple.
- Creación de ítems por cualquier usuario autenticado.
- Normalización y prevención de duplicados en la base de datos.
- Vista personal para quitar únicamente las selecciones propias.
- Panel admin con CRUD de ítems y edición de asignaciones por usuario.
- UI responsive, estados de carga/error y Server Actions validadas con Zod.

## Arquitectura

```text
app/
├── (auth)/login/                 # acceso y acción de autenticación
└── (dashboard)/dashboard/
    ├── admin/                    # administración y acciones privilegiadas
    ├── items/                    # lista, alta y acciones de selección
    └── my-items/                 # selección del usuario
components/                       # UI reutilizable y componentes cliente mínimos
lib/
├── services/                     # consultas y composición de datos
├── supabase/                     # clientes SSR y renovación de sesión
└── types/                        # tipos del esquema PostgreSQL
supabase/migrations/              # esquema, triggers, constraints y RLS
proxy.ts                          # renovación de sesión y protección de rutas
```

Los Server Components cargan datos directamente. Las mutaciones pasan por Server Actions, vuelven a comprobar la identidad y se ejecutan con la sesión del usuario. RLS es la barrera de autorización definitiva.

## Requisitos

- Node.js 22 o posterior
- npm
- Un proyecto de Supabase
- Supabase CLI (opcional, recomendado para migraciones locales/remotas)

## Instalación

```bash
npm install
cp .env.example .env.local
```

Completa `.env.local` con los valores de **Project Settings → API** en Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://TU_PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=TU_CLAVE_PUBLICA
SUPABASE_SERVICE_ROLE_KEY=TU_CLAVE_SERVICE_ROLE_SOLO_SERVIDOR
```

La clave pública puede aparecer como `anon` o como publishable key según la versión del panel. `SUPABASE_SERVICE_ROLE_KEY` solo se usa en Server Actions y nunca debe exponerse al navegador.

### Modo demo

Con `NEXT_PUBLIC_USE_DEMO_DATA=true`, la pantalla de administración sigue disponible para visualizar usuarios, pero bloquea las altas y los cambios de rol con un mensaje claro. No se crean usuarios ni se actualizan roles en Supabase.

## Base de datos

La migración inicial está en [`supabase/migrations/20260715000000_initial_schema.sql`](supabase/migrations/20260715000000_initial_schema.sql). Puedes aplicarla de una de estas formas:

### Supabase CLI

```bash
supabase login
supabase link --project-ref TU_PROJECT_REF
supabase db push
```

### SQL Editor

Copia el contenido de cada migración en **SQL Editor** y ejecútalas una vez, respetando el orden de sus nombres.

La migración crea:

- `profiles`, `items` y `user_items`.
- Enum `app_role` (`admin | user`).
- `UNIQUE(items.normalized_name)` y `UNIQUE(user_id, item_id)`.
- Trigger de normalización de nombres de ítems para impedir duplicados.
- Trigger de creación automática de perfiles y backfill de usuarios existentes.
- Índices, grants y todas las políticas RLS.

## Crear usuarios y el primer administrador

Las personas inician sesión con el email y la contraseña registrados en Supabase Auth. Un administrador puede crear usuarios desde `Panel admin`; la acción valida la sesión contra `profiles`, crea la cuenta mediante Supabase Admin y asigna el rol después de que el trigger cree el perfil. Si falla el perfil, elimina solo el usuario creado en esa ejecución.

Para crear la primera cuenta:

1. Ve a **Supabase → Authentication → Users → Add user → Create new user**.
2. Escribe el email real, elige una contraseña y activa la confirmación automática.
3. Opcionalmente, en **User metadata**, agrega el nombre visible:

   ```json
   { "full_name": "Juan Pérez" }
   ```

El trigger genera el perfil. Si no proporcionas `full_name`, utiliza la parte anterior a `@` del email como nombre visible inicial.

Después de crear la primera cuenta, promuévela desde SQL Editor:

```sql
update public.profiles
set role = 'admin'
where full_name = 'Juan Pérez';
```

Los usuarios posteriores nacen con rol `user`. Un administrador puede crearlos desde `/dashboard/admin/users`, indicando nombre visible, email, contraseña y rol. Un usuario normal solo puede leer su perfil.

## Seguridad RLS

| Recurso | Usuario autenticado | Admin |
| --- | --- | --- |
| `items` SELECT | Todos | Todos |
| `items` INSERT | Sí, como sí mismo | Sí, como sí mismo |
| `items` UPDATE / DELETE | No | Sí |
| `user_items` SELECT | Sí, para contadores colaborativos | Sí |
| `user_items` INSERT / DELETE | Solo filas propias | Cualquier usuario |
| `profiles` SELECT | Solo perfil propio | Todos |
| `profiles` UPDATE | No | Sí |

Aunque las acciones del servidor hacen comprobaciones explícitas, no sustituyen RLS. Si alguien invoca una acción manualmente, PostgreSQL sigue aplicando las políticas.

## Desarrollo y comprobaciones

```bash
npm run dev
npm run lint
npm run typecheck
npm run build
```

Abre [http://localhost:3000](http://localhost:3000).

## Despliegue en Vercel

1. Sube el repositorio a GitHub, GitLab o Bitbucket.
2. Importa el proyecto en Vercel y selecciona `temploapp` como **Root Directory** si el repositorio contiene una carpeta superior.
3. Añade `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` y `SUPABASE_SERVICE_ROLE_KEY` en **Settings → Environment Variables** para Production, Preview y Development. La última es privada y no debe tener prefijo `NEXT_PUBLIC_`.
4. Despliega.
5. En Supabase, configura **Authentication → URL Configuration**:
   - Site URL: `https://tu-dominio.vercel.app`
   - Redirect URL: `https://tu-dominio.vercel.app/**`

Vercel detectará Next.js automáticamente. No se necesita ninguna clave privada ni un servidor adicional.

## Decisiones importantes

- La normalización de nombres se aplica únicamente a los ítems para impedir duplicados; no participa en la autenticación.
- Los datos de `user_items` son legibles por usuarios autenticados para calcular conteos globales. Los perfiles relacionados no se exponen salvo al propio usuario o a un admin.
- El borrado de un ítem elimina sus asignaciones mediante `ON DELETE CASCADE`.
- `assigned_by` siempre debe ser el usuario autenticado, incluso cuando un admin asigna a otra persona.
