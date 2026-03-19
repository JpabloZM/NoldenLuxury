import { CarritoItem } from "./admin-types";

const CARRITO_KEY = "arnolux_carrito";

export function obtenerCarrito(): CarritoItem[] {
  if (typeof window === "undefined") return [];
  const carrito = localStorage.getItem(CARRITO_KEY);
  return carrito ? JSON.parse(carrito) : [];
}

export function guardarCarrito(items: CarritoItem[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CARRITO_KEY, JSON.stringify(items));
}

export function agregarAlCarrito(item: CarritoItem): CarritoItem[] {
  const carrito = obtenerCarrito();
  const itemExistente = carrito.find(
    (i) => i.productId === item.productId && i.material === item.material
  );

  if (itemExistente) {
    itemExistente.quantity += item.quantity;
  } else {
    carrito.push(item);
  }

  guardarCarrito(carrito);
  return carrito;
}

export function removerDelCarrito(productId: string, material: string): CarritoItem[] {
  const carrito = obtenerCarrito();
  const filtered = carrito.filter(
    (i) => !(i.productId === productId && i.material === material)
  );
  guardarCarrito(filtered);
  return filtered;
}

export function actualizarCantidad(
  productId: string,
  material: string,
  cantidad: number
): CarritoItem[] {
  const carrito = obtenerCarrito();
  const item = carrito.find(
    (i) => i.productId === productId && i.material === material
  );

  if (item) {
    if (cantidad <= 0) {
      return removerDelCarrito(productId, material);
    }
    item.quantity = cantidad;
    guardasCarrito(carrito);
  }

  return carrito;
}

export function vaciarCarrito(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CARRITO_KEY);
}

export function calcularTotal(): number {
  const carrito = obtenerCarrito();
  return carrito.reduce((total, item) => total + item.price * item.quantity, 0);
}

export function contarItems(): number {
  const carrito = obtenerCarrito();
  return carrito.reduce((total, item) => total + item.quantity, 0);
}

// Fix typo
function guardasCarrito(items: CarritoItem[]): void {
  guardarCarrito(items);
}
