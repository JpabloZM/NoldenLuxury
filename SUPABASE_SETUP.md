# Configuración de Base de Datos con Supabase

## 1. Crear Cuenta y Proyecto

1. Ve a [supabase.com](https://supabase.com)
2. Haz clic en "Start your project"
3. Regístrate con GitHub o email
4. Crea una organización
5. Crea un nuevo proyecto:
   - **Name**: arnolux
   - **Database Password**: Guárdalo en lugar seguro
   - **Region**: Elige la más cercana a tus usuarios (ej: us-east-1)

## 2. Obtener las Credenciales

Después de crear el proyecto:

1. Ve a **Settings → API** en el dashboard de Supabase
2. Copia:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** (key) → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Pega en el archivo `.env.local` que ya creé

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc... (la llave pública)
```

## 3. Crear la Tabla de Productos

1. En el dashboard de Supabase, ve a **SQL Editor**
2. Crea una nueva query y ejecuta esto:

```sql
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,
  material VARCHAR(50) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  image VARCHAR(500),
  inventory INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índice para búsquedas más rápidas
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_inventory ON products(inventory);
```

## 4. Configurar Row Level Security (RLS)

⚠️ **IMPORTANTE**: RLS debe estar **HABILITADO** en producción.

Para desarrollo local, puedes deshabilitarlo temporalmente SOLO si:

- No tienes datos sensibles
- Tu BD no está expuesta a internet
- No la usas en una API pública

**RECOMENDACIÓN**: Ve a `SECURITY_RLS_SETUP.md` para hacer esto correctamente desde el inicio.

Para habilitar RLS de forma robusta:

1. Ejecuta el SQL en `SECURITY_RLS_SETUP.md`
2. Verifica que las políticas estén creadas
3. Prueba acceso desde `Supabase SQL Editor`

## 5. Insertar Productos Iniciales (Opcional)

En **SQL Editor**, ejecuta:

```sql
INSERT INTO products (name, category, material, price, image, inventory) VALUES
('Cadena Fígaro', 'Dijes', 'Oro Laminado 18K', 85.00, '/placeholder.svg', 10),
('Anillo Sello Cuadrado', 'Anillos', 'Plata 925', 60.00, '/placeholder.svg', 15),
('Aretes Argolla Clásica', 'Arete', 'Oro Laminado 18K', 55.00, '/placeholder.svg', 8);
```

## 6. Actualizar el Admin de Productos

El archivo `app/admin/productos/page.tsx` ya está listo para cambiar a Supabase.

Necesitas reemplazar el código que usa localStorage con el que usa `product-operations.ts`

## 7. Actualizar el Catálogo del Cliente

El archivo `app/components/Catalog.tsx` deve leer de Supabase en vez de `lib/products.ts`

## 8. Storage para Imágenes (Si necesitas subir fotos)

Para permitir que suban imágenes:

1. En Supabase: **Storage**
2. Crea un nuevo bucket llamado **product-images**
3. Haz público el bucket (Settings)
4. Tendrás URL como: `https://xxxxx.supabase.co/storage/v1/object/public/product-images/...`

## 9. Variables de Entorno

Tu archivo `.env.local` debería verse así:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ Nunca commits `.env.local` a git - ya está en `.gitignore`

## 10. Verificar que Funciona

```bash
npm run dev
```

En la consola del navegador, deberías ver:

- Sin errores de conexión
- La lista de productos se carga

## Próximos Pasos

1. ✅ Instalar Supabase
2. ✅ Crear tabla de productos
3. ⏳ Actualizar Admin de Productos para usar Supabase
4. ⏳ Actualizar Catálogo para usar Supabase
5. ⏳ Implementar autenticación de admin con Supabase (más seguro)
6. ⏳ Agregar upload de imágenes
7. ⏳ Implementar pedidos en BD

## Comandos Útiles

```bash
# Ver logs de Supabase
supabase logs

# Resetear BD (¡cuidado!)
supabase db reset

# Exportar datos
supabase db pull
```
