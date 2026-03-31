# 🚨 ACCIONES INMEDIATAS - Resolver Alerta de Seguridad

Tu proyecto tiene una **vulnerabilidad crítica: RLS deshabilitado**. Aquí está el plan para arreglarlo:

---

## ⚡ ACCIÓN 1: Ejecutar SQL (2 minutos) - HAZ ESTO AHORA

1. **Ve a Supabase Dashboard**
   - https://app.supabase.com
   - Selecciona tu proyecto

2. **SQL Editor → New Query**

3. **Copia TODOS los contenidos de:**

   ```
   RLS_QUICK_SETUP.sql
   ```

   (Este archivo está en tu proyecto)

4. **Pega el SQL y ejecuta** (Ctrl+Enter)

5. **Espera confirmación**: Deberías ver ✅ sin errores

---

## ⚡ ACCIÓN 2: Crear Admin (1 minuto)

Después del SQL anterior, ejecuta esta query EN EL MISMO SQL EDITOR:

```sql
-- Primero, crea un usuario manual en Supabase Auth
-- (Lo haremos en el Paso 3)

-- Luego ejecuta esto:
INSERT INTO admin_users (user_id, email)
VALUES ('REEMPLAZA_CON_EL_UUID_DEL_USUARIO', 'tu-email@example.com');
```

**¿Cómo obtener el UUID?**

1. Ve a **Authentication → Users** en Supabase Dashboard
2. Busca tu usuario
3. Copia el "User UID"
4. Reemplaza en la query anterior

---

## ⚡ ACCIÓN 3: Crear usuario admin en Supabase (2 minutos)

1. **Supabase Dashboard → Authentication → Users**
2. **New User → Email**
   - Email: `tu-email@example.com`
   - Password: `TuContraseñaMuySegura123!`
3. **Create User**
4. **Copia el UUID** (aparece en la lista)

---

## ⚡ ACCIÓN 4: Actualizar `.env.local` (1 minuto)

Necesitas agregar la clave de servicio. Ve a:

**Supabase Dashboard → Settings → API → Service Role Secret**

Copia y agrega a tu `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... ← 👈 AGREGAR ESTO
```

⚠️ **IMPORTANTE**:

- `.env.local` NO debería estar en git (ya está en `.gitignore`)
- NUNCA compartas esta clave públicamente

---

## ⚡ ACCIÓN 5: Actualizar código (3 minutos)

### 1️⃣ Actualizar `app/lib/supabase.ts`

Reemplaza el contenido con:

```typescript
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Para API routes (servidor)
export const supabaseServer = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error(
      "❌ SUPABASE_SERVICE_ROLE_KEY no configurada en .env.local",
    );
  }
  return createClient(supabaseUrl, serviceRoleKey);
};
```

### 2️⃣ Actualizar `app/api/products/route.ts`

Cambia:

```typescript
// ❌ ANTES
import { createClient } from "@supabase/supabase-js";
let supabase = createClient(...);

// ✅ DESPUÉS
import { supabaseServer } from "@/app/lib/supabase";

export async function GET() {
  try {
    const supabase = supabaseServer();
    // ... resto del código igual
  }
}
```

---

## ⚡ ACCIÓN 6: Verificar que funciona (1 minuto)

```bash
npm run dev
```

Prueba:

1. **Catálogo**: Los productos deben cargar normalmente ✓
2. **Admin**: Intenta crear un producto
3. **Consola del navegador**: ¿Hay errores? Avísame

---

## 📋 CHECKLIST RÁPIDO

- [ ] Ejecuté `RLS_QUICK_SETUP.sql` en Supabase
- [ ] Creé usuario admin en Supabase Auth
- [ ] Obtuve la clave `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Actualicé `.env.local` con la clave
- [ ] Actualicé `app/lib/supabase.ts`
- [ ] Actualicé `app/api/products/route.ts` y otras rutas
- [ ] Probé localmente con `npm run dev`

---

## ✅ RESULTADO FINAL

✅ RLS habilitado en todas las tablas
✅ Productos públicos para lectura
✅ Datos admin/pedidos privados
✅ Sistema 100% seguro
✅ Alerta de Supabase resuelta

---

## ❓ PROBLEMAS COMUNES

### "Error: SUPABASE_SERVICE_ROLE_KEY no configurada"

→ Revisa que `.env.local` tenga la clave completa
→ La clave comienza con `eyJ`

### "Error 401 en admin"

→ Verifica que el usuario esté en la tabla `admin_users`
→ El UUID debe coincidir exactamente

### "Productos no cargan"

→ Revisa que `RLS_QUICK_SETUP.sql` completó sin errores
→ La política debe permitir lectura pública

### "Sigue viendo error de seguridad en Supabase"

→ Espera 5 minutos y recarga
→ A veces tarda en actualizar

---

## ¿NECESITAS AYUDA?

Si algo no funciona:

1. Comparte el error exacto que ves
2. Verifica que el SQL ejecutó sin errores
3. Revisa que `SUPABASE_SERVICE_ROLE_KEY` está en `.env.local`
4. Intenta: `npm run dev` de nuevo

---

**¡Hazlo ahora! ⏱️ Debería tomar 10 minutos máximo**
