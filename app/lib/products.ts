export type Product = {
  id: string;
  name: string;
  category: string;
  material: "Oro Laminado 18K" | "Plata 925";
  price: number;
  image: string; // Placeholder for image path
};

export const products: Product[] = [
  {
    id: "gld-01",
    name: "Cadena Fígaro",
    category: "Dijes",
    material: "Oro Laminado 18K",
    price: 85,
    image: "/placeholder.svg",
  },
  {
    id: "slv-01",
    name: "Anillo Sello Cuadrado",
    category: "Anillos",
    material: "Plata 925",
    price: 60,
    image: "/placeholder.svg",
  },
  {
    id: "gld-02",
    name: "Aretes Argolla Clásica",
    category: "Arete",
    material: "Oro Laminado 18K",
    price: 55,
    image: "/placeholder.svg",
  },
  {
    id: "gld-03",
    name: "Dije San Benito",
    category: "Dijes",
    material: "Oro Laminado 18K",
    price: 45,
    image: "/placeholder.svg",
  },
  {
    id: "slv-02",
    name: "Pulsera Esclava",
    category: "Pulseras",
    material: "Plata 925",
    price: 95,
    image: "/placeholder.svg",
  },
  {
    id: "slv-03",
    name: "Ear Cuff Liso",
    category: "Arete",
    material: "Plata 925",
    price: 35,
    image: "/placeholder.svg",
  },
];
