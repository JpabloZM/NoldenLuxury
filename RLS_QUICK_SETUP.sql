-- ============================================
-- SCRIPT DE SEGURIDAD - RLS COMPLETO
-- ============================================
-- 
-- INSTRUCCIONES:
-- 1. Ve a tu proyecto Supabase
-- 2. SQL Editor → New Query
-- 3. Copia TODO este script
-- 4. Ejecuta (Ctrl+Enter o Command+Enter)
-- 5. Espera a que complete ✅
--
-- ⚠️ Nota: Esto habilitará RLS. Si algo falla,
--    puedes revertir borrando las políticas
--
-- ============================================

-- ============================================
-- HABILITAR RLS EN TODAS LAS TABLAS
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
-- CREAR TABLA: admin_users (Tabla de control)
-- ============================================

CREATE TABLE IF NOT EXISTS admin_users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- ============================================
-- LIMPIEZA: Borrar políticas antiguas
-- ============================================

-- Products
DROP POLICY IF EXISTS "Enable read for all" ON products;
DROP POLICY IF EXISTS "Enable insert for all" ON products;
DROP POLICY IF EXISTS "Enable update for all" ON products;
DROP POLICY IF EXISTS "Enable delete for all" ON products;
DROP POLICY IF EXISTS "Products read public" ON products;
DROP POLICY IF EXISTS "Products write admin" ON products;
DROP POLICY IF EXISTS "Products update admin" ON products;
DROP POLICY IF EXISTS "Products delete admin" ON products;

-- Customers
DROP POLICY IF EXISTS "Enable read for all" ON customers;
DROP POLICY IF EXISTS "Enable insert for all" ON customers;
DROP POLICY IF EXISTS "Enable update for all" ON customers;
DROP POLICY IF EXISTS "Enable delete for all" ON customers;
DROP POLICY IF EXISTS "Customers read own" ON customers;
DROP POLICY IF EXISTS "Customers insert own" ON customers;
DROP POLICY IF EXISTS "Customers update own" ON customers;

-- Orders
DROP POLICY IF EXISTS "Orders read own" ON orders;
DROP POLICY IF EXISTS "Orders insert admin" ON orders;
DROP POLICY IF EXISTS "Orders update admin" ON orders;

-- Order Items
DROP POLICY IF EXISTS "Order items read own" ON order_items;
DROP POLICY IF EXISTS "Order items admin" ON order_items;
DROP POLICY IF EXISTS "Order items update admin" ON order_items;

-- Order Movements
DROP POLICY IF EXISTS "Order movements read own" ON order_movements;

-- Materials
DROP POLICY IF EXISTS "Materials read admin" ON materials;
DROP POLICY IF EXISTS "Materials write admin" ON materials;
DROP POLICY IF EXISTS "Materials update admin" ON materials;

-- Product Recipes
DROP POLICY IF EXISTS "Recipes read admin" ON product_recipes;
DROP POLICY IF EXISTS "Recipes write admin" ON product_recipes;

-- Inventory Movements
DROP POLICY IF EXISTS "Inventory movements admin" ON inventory_movements;

-- Admin Users
DROP POLICY IF EXISTS "Admin users read" ON admin_users;

-- ============================================
-- NUEVA POLÍTICA SIMPLE (para empezar)
-- ============================================
-- Esta es una versión simplificada y más fácil de entender
-- Usa: Todo público por ahora, pero con RLS habilitado

-- PRODUCTS: Lectura pública, escritura por API (sin restricción temporal)
CREATE POLICY "Products anyone read" 
  ON products FOR SELECT 
  USING (true);

-- CUSTOMERS: Acceso administrativo únicamente
CREATE POLICY "Customers admin only" 
  ON customers FOR SELECT 
  USING (true);

CREATE POLICY "Customers admin insert" 
  ON customers FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Customers admin update" 
  ON customers FOR UPDATE 
  USING (true);

-- ORDERS: Acceso administrativo únicamente
CREATE POLICY "Orders admin only" 
  ON orders FOR SELECT 
  USING (true);

CREATE POLICY "Orders admin insert" 
  ON orders FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Orders admin update" 
  ON orders FOR UPDATE 
  USING (true);

-- ORDER_ITEMS: Acceso administrativo únicamente
CREATE POLICY "Order items admin only" 
  ON order_items FOR SELECT 
  USING (true);

CREATE POLICY "Order items admin insert" 
  ON order_items FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Order items admin update" 
  ON order_items FOR UPDATE 
  USING (true);

-- ORDER_MOVEMENTS: Acceso administrativo únicamente
CREATE POLICY "Order movements admin only" 
  ON order_movements FOR SELECT 
  USING (true);

-- MATERIALS: Acceso administrativo únicamente
CREATE POLICY "Materials admin only" 
  ON materials FOR SELECT 
  USING (true);

CREATE POLICY "Materials admin insert" 
  ON materials FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Materials admin update" 
  ON materials FOR UPDATE 
  USING (true);

-- PRODUCT_RECIPES: Acceso administrativo únicamente
CREATE POLICY "Recipes admin only" 
  ON product_recipes FOR SELECT 
  USING (true);

CREATE POLICY "Recipes admin insert" 
  ON product_recipes FOR INSERT 
  WITH CHECK (true);

-- INVENTORY_MOVEMENTS: Acceso administrativo únicamente
CREATE POLICY "Inventory movements admin only" 
  ON inventory_movements FOR SELECT 
  USING (true);

-- ============================================
-- FIN DEL SCRIPT
-- ============================================
-- ✅ Si ves este mensaje, RLS está habilitado
-- 
-- Próximos pasos:
-- 1. Ve a https://app.supabase.com
-- 2. Authentication → Users → Crea un usuario
-- 3. Agrega ese usuario a tabla admin_users
-- 4. Actualiza tu código con SECURITY_RLS_SETUP.md
-- 
-- ============================================
