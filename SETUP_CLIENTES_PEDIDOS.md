# Setup de Clientes y Mejoras en Pedidos

Ejecuta estas instrucciones SQL en tu Supabase SQL Editor.

## 1. Crear tabla `customers` (Clientes)

```sql
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  zip_code VARCHAR(20),
  notes TEXT,
  source VARCHAR(50) DEFAULT 'manual', -- 'manual' o 'registered'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_customers_name ON customers(name);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_created_at ON customers(created_at);

-- RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso (públicas para este demo)
CREATE POLICY "Enable read for all" ON customers FOR SELECT USING (true);
CREATE POLICY "Enable insert for all" ON customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all" ON customers FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all" ON customers FOR DELETE USING (true);
```

## 2. Agregar columna customer_id a tabla `orders`

```sql
-- Agregar columna customer_id a orders
ALTER TABLE orders ADD COLUMN customer_id UUID REFERENCES customers(id) ON DELETE SET NULL;

-- Agregar índice
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
```

## 3. Crear tabla `order_movements` si no existe

```sql
CREATE TABLE IF NOT EXISTS order_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_order_movements_order_id ON order_movements(order_id);

-- RLS
ALTER TABLE order_movements ENABLE ROW LEVEL SECURITY;
```

## 4. Crear tabla `order_items` si no existe

```sql
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10, 2) NOT NULL,
  subtotal NUMERIC(10, 2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- RLS
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
```

## Verificar setup

```sql
-- Ver estructura de clientes
DESC customers;

-- Ver órdenes con customers
SELECT o.id, o.order_number, o.customer_name, c.name, c.email
FROM orders o
LEFT JOIN customers c ON o.customer_id = c.id;
```
