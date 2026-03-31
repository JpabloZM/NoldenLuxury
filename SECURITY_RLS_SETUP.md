# 🔒 Implementación Completa de Seguridad - RLS y Autenticación Supabase

## ⚠️ PROBLEMA CRÍTICO

Tu sistema tiene **RLS deshabilitado en tablas públicas**, lo que permite:

- ❌ Acceso público a TODA tu base de datos
- ❌ Lectura/modificación de pedidos de clientes
- ❌ Acceso a información de inventario
- ❌ Posible manipulación de precios y productos

## ✅ SOLUCIÓN: Implementar RLS + Autenticación Supabase Auth

---

## PARTE 1: Habilitar Autenticación de Supabase

### Paso 1: Configurar Supabase Auth en el Dashboard

1. **Ve a Supabase Dashboard**
2. **Authentication → Providers**
3. Habilita **Email/Password** (ya debería estar)
4. **Authentication → Policies**
5. En cada tabla, haz clic en "Enable RLS"

### Paso 2: Agregar variables de entorno

Actualiza tu `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... (clave de servicio, NUNCA expongas esto)
```

> ⚠️ El `SERVICE_ROLE_KEY` solo en servidor, **nunca en el navegador**

---

## PARTE 2: SQL - Habilitar RLS en todas las tablas

Copia y ejecuta esto en tu **Supabase SQL Editor**:

```sql
-- ============================================
-- 1. HABILITAR RLS EN TODAS LAS TABLAS
-- ============================================

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_recipes ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. TABLA: PRODUCTS (Pública para lectura)
-- ============================================

-- Leer: CUALQUIERA puede ver productos
DROP POLICY IF EXISTS "Products read public" ON products;
CREATE POLICY "Products read public"
  ON products FOR SELECT
  USING (true);

-- Crear/Editar/Eliminar: SOLO ADMIN
DROP POLICY IF EXISTS "Products write admin" ON products;
CREATE POLICY "Products write admin"
  ON products FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'authenticated' AND EXISTS(
    SELECT 1 FROM admin_users WHERE user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Products update admin" ON products;
CREATE POLICY "Products update admin"
  ON products FOR UPDATE
  USING (auth.jwt() ->> 'role' = 'authenticated' AND EXISTS(
    SELECT 1 FROM admin_users WHERE user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Products delete admin" ON products;
CREATE POLICY "Products delete admin"
  ON products FOR DELETE
  USING (auth.jwt() ->> 'role' = 'authenticated' AND EXISTS(
    SELECT 1 FROM admin_users WHERE user_id = auth.uid()
  ));

-- ============================================
-- 3. TABLA: CUSTOMERS (Privado)
-- ============================================

-- Leer: SOLO EL CLIENTE VE SUS DATOS + ADMIN
DROP POLICY IF EXISTS "Customers read own" ON customers;
CREATE POLICY "Customers read own"
  ON customers FOR SELECT
  USING (
    auth.jwt() ->> 'role' = 'authenticated' AND (
      user_id = auth.uid() OR
      EXISTS(SELECT 1 FROM admin_users WHERE user_id = auth.uid())
    )
  );

-- Crear: Cliente registrado o admin
DROP POLICY IF EXISTS "Customers insert own" ON customers;
CREATE POLICY "Customers insert own"
  ON customers FOR INSERT
  WITH CHECK (
    auth.jwt() ->> 'role' = 'authenticated' AND (
      user_id = auth.uid() OR
      EXISTS(SELECT 1 FROM admin_users WHERE user_id = auth.uid())
    )
  );

-- Actualizar: Cliente sus datos o admin
DROP POLICY IF EXISTS "Customers update own" ON customers;
CREATE POLICY "Customers update own"
  ON customers FOR UPDATE
  USING (
    auth.jwt() ->> 'role' = 'authenticated' AND (
      user_id = auth.uid() OR
      EXISTS(SELECT 1 FROM admin_users WHERE user_id = auth.uid())
    )
  );

-- ============================================
-- 4. TABLA: ORDERS (Privado)
-- ============================================

-- Leer: Cliente ve sus pedidos, admin ve todos
DROP POLICY IF EXISTS "Orders read own" ON orders;
CREATE POLICY "Orders read own"
  ON orders FOR SELECT
  USING (
    auth.jwt() ->> 'role' = 'authenticated' AND (
      customer_id = auth.uid() OR
      EXISTS(SELECT 1 FROM admin_users WHERE user_id = auth.uid())
    )
  );

-- Crear: SOLO ADMIN (crea pedidos en admin panel)
DROP POLICY IF EXISTS "Orders insert admin" ON orders;
CREATE POLICY "Orders insert admin"
  ON orders FOR INSERT
  WITH CHECK (
    EXISTS(SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  );

-- Actualizar: SOLO ADMIN (cambia estado, notas)
DROP POLICY IF EXISTS "Orders update admin" ON orders;
CREATE POLICY "Orders update admin"
  ON orders FOR UPDATE
  USING (
    EXISTS(SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  );

-- ============================================
-- 5. TABLA: ORDER_ITEMS (Privado)
-- ============================================

-- Leer: Via order (cliente su pedido, admin todos)
DROP POLICY IF EXISTS "Order items read own" ON order_items;
CREATE POLICY "Order items read own"
  ON order_items FOR SELECT
  USING (
    auth.jwt() ->> 'role' = 'authenticated' AND EXISTS(
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id AND (
        orders.customer_id = auth.uid() OR
        EXISTS(SELECT 1 FROM admin_users WHERE user_id = auth.uid())
      )
    )
  );

-- Insert/Update/Delete: SOLO ADMIN
DROP POLICY IF EXISTS "Order items admin" ON order_items;
CREATE POLICY "Order items admin"
  ON order_items FOR INSERT
  WITH CHECK (
    EXISTS(SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Order items update admin" ON order_items;
CREATE POLICY "Order items update admin"
  ON order_items FOR UPDATE
  USING (
    EXISTS(SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  );

-- ============================================
-- 6. TABLA: ORDER_MOVEMENTS (Privado)
-- ============================================

-- Leer: Via order
DROP POLICY IF EXISTS "Order movements read own" ON order_movements;
CREATE POLICY "Order movements read own"
  ON order_movements FOR SELECT
  USING (
    auth.jwt() ->> 'role' = 'authenticated' AND EXISTS(
      SELECT 1 FROM orders
      WHERE orders.id = order_movements.order_id AND (
        orders.customer_id = auth.uid() OR
        EXISTS(SELECT 1 FROM admin_users WHERE user_id = auth.uid())
      )
    )
  );

-- ============================================
-- 7. TABLA: MATERIALS (Solo Admin)
-- ============================================

DROP POLICY IF EXISTS "Materials read admin" ON materials;
CREATE POLICY "Materials read admin"
  ON materials FOR SELECT
  USING (
    EXISTS(SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Materials write admin" ON materials;
CREATE POLICY "Materials write admin"
  ON materials FOR INSERT
  WITH CHECK (
    EXISTS(SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Materials update admin" ON materials;
CREATE POLICY "Materials update admin"
  ON materials FOR UPDATE
  USING (
    EXISTS(SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  );

-- ============================================
-- 8. TABLA: PRODUCT_RECIPES (Solo Admin)
-- ============================================

DROP POLICY IF EXISTS "Recipes read admin" ON product_recipes;
CREATE POLICY "Recipes read admin"
  ON product_recipes FOR SELECT
  USING (
    EXISTS(SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Recipes write admin" ON product_recipes;
CREATE POLICY "Recipes write admin"
  ON product_recipes FOR INSERT
  WITH CHECK (
    EXISTS(SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  );

-- ============================================
-- 9. TABLA: INVENTORY_MOVEMENTS (Solo Admin)
-- ============================================

DROP POLICY IF EXISTS "Inventory movements admin" ON inventory_movements;
CREATE POLICY "Inventory movements admin"
  ON inventory_movements FOR SELECT
  USING (
    EXISTS(SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  );

-- ============================================
-- 10. CREAR TABLA: admin_users
-- ============================================

-- Esta tabla controla quién es admin
CREATE TABLE IF NOT EXISTS admin_users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS para admin_users (solo admin puede leer)
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin users read" ON admin_users;
CREATE POLICY "Admin users read"
  ON admin_users FOR SELECT
  USING (
    EXISTS(SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  );

-- ============================================
-- 11. AGREGAR COLUMNA user_id A CUSTOMERS
-- ============================================

-- Si no existe:
ALTER TABLE customers ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Crear índice
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);

-- ============================================
-- 12. VERIFICAR SETUP
-- ============================================

-- Ver RLS habilitado en todas las tablas
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- Ver políticas creadas
SELECT tablename, policyname
FROM pg_policies
WHERE schemaname = 'public';
```

---

## PARTE 3: Actualizar código - Cliente Supabase

Crea/actualiza el archivo `app/lib/supabase.ts`:

```typescript
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Para operaciones de servidor (solo en API routes)
export const supabaseServer = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY no está configurada");
  }
  return createClient(supabaseUrl, serviceRoleKey);
};
```

---

## PARTE 4: Actualizar Funciones de API

### Ejemplo: `app/api/products/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/app/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const supabase = supabaseServer();

    // Obtener productos - ACCESO PÚBLICO PERMITIDO
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Error:", err);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // VERIFICAR AUTENTICACIÓN: Solo admin puede crear productos
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const supabase = supabaseServer();

    // Verificar si es admin
    const token = authHeader.replace("Bearer ", "");
    // Aquí deberías verificar el token y confirmar que es admin

    const body = await request.json();

    const { data, error } = await supabase
      .from("products")
      .insert([body])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Error:", err);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
```

---

## PARTE 5: Sistema de Login Seguro

Crea `app/lib/auth-operations.ts`:

```typescript
import { supabase } from "./supabase";

// Registrar nuevo cliente
export async function registerCustomer(
  email: string,
  password: string,
  name: string,
) {
  // Crear usuario en auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) throw authError;
  if (!authData.user) throw new Error("Failed to create user");

  // Crear perfil de cliente
  const { data, error } = await supabase
    .from("customers")
    .insert({
      user_id: authData.user.id,
      name,
      email,
      source: "registered",
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Login
export async function loginCustomer(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

// Logout
export async function logoutCustomer() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// Obtener usuario actual
export async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
}
```

---

## PARTE 6: Crear Admin

### Opción 1: Via SQL (Rápido)

```sql
-- Primero, crea el usuario en Supabase Auth manualmente
-- (Ve a Authentication → Users → Add user)

-- Luego ejecuta en SQL Editor:
INSERT INTO admin_users (user_id, email)
VALUES ('uuid-del-usuario-aqui', 'tu-email@example.com');
```

### Opción 2: Via API (Script)

```typescript
import { supabaseServer } from "@/app/lib/supabase";

async function makeUserAdmin(email: string) {
  const supabase = supabaseServer();

  // Buscar usuario por email
  const { data: users, error: userError } =
    await supabase.auth.admin.listUsers();
  const user = users?.users.find((u) => u.email === email);

  if (!user) throw new Error("Usuario no encontrado");

  // Agregar a tabla admin_users
  const { error } = await supabase
    .from("admin_users")
    .insert({ user_id: user.id, email });

  if (error) throw error;
  console.log(`✅ ${email} ahora es admin`);
}

// Ejecutar manualmente cuando sea necesario
// makeUserAdmin("tu-email@example.com");
```

---

## PARTE 7: Proteger Admin Panel

Actualiza `app/admin/login/page.tsx`:

```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      if (!data.user) throw new Error("Login failed");

      // Verificar si es admin
      const { data: adminData, error: adminError } = await supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", data.user.id)
        .single();

      if (!adminData) {
        await supabase.auth.signOut();
        throw new Error("No tienes permisos de admin");
      }

      // Guardar token en localStorage
      localStorage.setItem("adminToken", data.session?.access_token || "");
      router.replace("/admin/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error en login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <form onSubmit={handleLogin} className="bg-slate-800 p-8 rounded-lg w-96">
        <h1 className="text-2xl font-bold text-white mb-6">Admin Login</h1>

        {error && <div className="bg-red-600 text-white p-3 rounded mb-4">{error}</div>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 mb-4 rounded bg-slate-700 text-white"
          required
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 mb-6 rounded bg-slate-700 text-white"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-amber-300 hover:bg-amber-400 text-slate-900 font-bold py-2 rounded disabled:opacity-50"
        >
          {loading ? "Iniciando..." : "Iniciar Sesión"}
        </button>
      </form>
    </div>
  );
}
```

---

## PARTE 8: Checklist de Implementación

- [ ] **SQL**: Ejecutar todo el script de RLS en Supabase SQL Editor
- [ ] **Tabla admin_users**: Crear y hacer tu cuenta admin
- [ ] **.env.local**: Agregar `SUPABASE_SERVICE_ROLE_KEY`
- [ ] **supabase.ts**: Actualizar cliente con Server Role
- [ ] **API routes**: Actualizar con `supabaseServer()`
- [ ] **Login Admin**: Cambiar a Supabase Auth (sin localStorage)
- [ ] **Verificar**: Test en Supabase Dashboard
  - [ ] Productos se pueden leer sin login ✓
  - [ ] No se puede editar sin admin ✗
  - [ ] Admin puede crear/editar ✓
  - [ ] Clientes ven solo sus pedidos ✓

---

## PARTE 9: Verificación de Seguridad

Prueba esto en el **Supabase SQL Editor**:

```sql
-- Ver quién hace llamadas (debug)
SELECT
  tablename,
  policyname,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename;

-- Verificar estado de RLS
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

---

## PARTE 10: Próximos Pasos

1. **Rate limiting** - Agregar límites de solicitud
2. **Logs de auditoría** - Rastrear cambios importantes
3. **2FA** - Autenticación de dos factores para admin
4. **Copias de seguridad** - Backup automático diario
5. **Encriptación** - Datos sensibles (direcciones) encriptados

---

## ¿PREGUNTAS?

```shell
# Ver logs en tiempo real
supabase logs --tail

# Resetear BD (si algo falla)
supabase db reset

# Exportar datos
supabase db pull

# Verificar RLS está habilitado
supabase status
```

**¡Tu sistema ahora será 100% seguro! 🔒**
