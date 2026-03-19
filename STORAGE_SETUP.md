# Configurar Upload de Imágenes en Supabase Storage

Para que el upload de imágenes funcione, necesitas crear un bucket en Supabase Storage.

## Paso 1: Crear el bucket

1. Ve a tu proyecto Supabase
2. **Storage → Buckets** (en el menú izquierdo)
3. Haz clic en **Create new bucket**
4. Nombre del bucket: `product-images`
5. Elige **Public** (para que las imágenes sean públicas)
6. Click en **Create bucket**

## Paso 2: Configurar permisos

El bucket es público, así que permite leer/escribir:

1. Ve al bucket **product-images**
2. Click en **Policies** (o Settings)
3. Busca las políticas RLS
4. Asegúrate de que permita:
   - **Lectura (SELECT)**: Públic a
   - **Escritura (INSERT)**: Para tu anon key

Si hay dudas, deja el bucket como **Public** y fácil.

## Paso 3: Probar

1. Reinicia: `npm run dev`
2. Ve a `/admin/productos`
3. Intenta subir una imagen
4. Debería aparecer un preview y guardarse en Supabase Storage

## Verificar

Ve a Supabase → Storage → product-images y verás tus imágenes subidas.

## URL pública de las imágenes

Las imágenes se guardan con URLs como:

```
https://[proyecto].supabase.co/storage/v1/object/public/product-images/[timestamp]-[nombre].jpg
```

Estas URLs son automaticamente públicas y aparecerán en el catálogo.

## Solucionar errores

Si ves error "No bucket named 'product-images'":

- Crea el bucket manualmente (pasos arriba)
- Reinicia Next.js

Si ves error 401 (Unauthorized):

- El bucket debe estar en modo **Public**
- Verifica que el anon key tiene permisos
