# Setup de Recetas de Productos y Órdenes

Ejecuta estas instrucciones SQL en tu Supabase SQL Editor.

## 1. Crear tabla `product_recipes` (Recetas)

```sql
CREATE TABLE product_recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  material_id UUID NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
  quantity_needed NUMERIC NOT NULL CHECK (quantity_needed > 0),
  unit VARCHAR(50) DEFAULT 'g',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, material_id)
);

-- Índices para mejor rendimiento
CREATE INDEX idx_product_recipes_product_id ON product_recipes(product_id);
CREATE INDEX idx_product_recipes_material_id ON product_recipes(material_id);

-- RLS
ALTER TABLE product_recipes ENABLE ROW LEVEL SECURITY;
```

## 2. Crear tabla `orders` (Pedidos)

```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(100) UNIQUE NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255),
  customer_phone VARCHAR(20),
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  total_amount NUMERIC(10, 2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);

-- RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
```

## 3. Crear tabla `order_items` (Items de Pedidos)

```sql
CREATE TABLE order_items (
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

## 4. Crear tabla `order_movements` (Historial automático)

```sql
CREATE TABLE order_movements (
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

**Una vez executadas estas instrucciones SQL, el sistema estará listo para el backend.**
