## Nolden Luxury Web MVP

Sitio inicial corporativo para Nolden Luxury (joyería), construido con Next.js (App Router), con foco en:

- Presentación de propuesta de valor de la marca
- Colecciones y materiales principales (oro laminado 18K y plata 925)
- Beneficios de compra y bloque de contacto para pedidos/catálogo

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Estructura actual

- `app/page.tsx`: landing principal orientada a joyería con hero, colecciones, materiales y contacto.
- `app/layout.tsx`: layout global y metadata del sitio.
- `app/globals.css`: estilos base y variables de tema.

### Próximos pasos sugeridos

- Integrar formulario con backend/email/WhatsApp (API Route).
- Agregar catálogo real de productos con imágenes, precio y stock.
- Crear páginas internas (`/catalogo`, `/mayoreo`, `/cuidado-de-joyas`, `/contacto`).
- Añadir SEO avanzado (Open Graph, schema.org y sitemap).

## Scripts

- `npm run dev` → desarrollo.
- `npm run lint` → validación ESLint.
- `npm run build` → build de producción.

## Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS v4
