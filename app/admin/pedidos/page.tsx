"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/app/admin/components/AdminLayout";
import type {
  Order,
  OrderSummary,
  OrderForm,
  OrderItemForm,
} from "@/app/lib/orders-types";
import type { ProductWithInventory } from "@/app/lib/admin-types";
import {
  fetchOrders,
  fetchOrderById,
  createOrder,
  updateOrderStatus,
  addOrderItem,
  removeOrderItem,
} from "@/app/lib/orders-operations";
import { fetchProducts } from "@/app/lib/product-operations";

export default function PedidosPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<ProductWithInventory[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OrderSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showNewOrderForm, setShowNewOrderForm] = useState(false);
  const [showAddItemForm, setShowAddItemForm] = useState(false);

  const [newOrderData, setNewOrderData] = useState<OrderForm>({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    notes: "",
  });

  const [newItemData, setNewItemData] = useState<OrderItemForm>({
    product_id: "",
    quantity: 1,
    unit_price: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [ordersData, productsData] = await Promise.all([
        fetchOrders(),
        fetchProducts(),
      ]);

      setOrders(ordersData);
      setProducts(productsData);
    } catch (err) {
      console.error("Error loading data:", err);
      setError(
        err instanceof Error ? err.message : "Error loading data",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newOrderData.customer_name) {
      setError("El nombre del cliente es requerido");
      return;
    }

    try {
      setError(null);
      const createdOrder = await createOrder(newOrderData);
      setOrders([createdOrder, ...orders]);
      setSuccessMessage("Pedido creado exitosamente");
      setShowNewOrderForm(false);
      setNewOrderData({
        customer_name: "",
        customer_email: "",
        customer_phone: "",
        notes: "",
      });

      setTimeout(() => setSuccessMessage(null), 3000);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error creating order");
    }
  };

  const handleSelectOrder = async (orderId: string) => {
    try {
      const orderDetails = await fetchOrderById(orderId);
      setSelectedOrder(orderDetails);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading order");
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedOrder || !newItemData.product_id) {
      setError("Product is required");
      return;
    }

    try {
      setError(null);
      await addOrderItem(selectedOrder.id, newItemData);
      setSuccessMessage("Item agregado a la orden");
      setNewItemData({ product_id: "", quantity: 1, unit_price: 0 });
      setShowAddItemForm(false);

      // Recargar orden
      const updatedOrder = await fetchOrderById(selectedOrder.id);
      setSelectedOrder(updatedOrder);

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error adding item");
    }
  };

  const handleConfirmOrder = async () => {
    if (!selectedOrder) return;

    try {
      setError(null);
      await updateOrderStatus(selectedOrder.id, "confirmed");
      setSuccessMessage("Pedido confirmado - Productos descontados automáticamente");

      // Recargar
      await loadData();
      const updatedOrder = await fetchOrderById(selectedOrder.id);
      setSelectedOrder(updatedOrder);

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error confirming order");
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      setError(null);
      await removeOrderItem(itemId);
      setSuccessMessage("Item removido");

      if (selectedOrder) {
        const updatedOrder = await fetchOrderById(selectedOrder.id);
        setSelectedOrder(updatedOrder);
      }

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error removing item");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-900 text-yellow-300";
      case "confirmed":
        return "bg-blue-900 text-blue-300";
      case "shipped":
        return "bg-purple-900 text-purple-300";
      case "delivered":
        return "bg-emerald-900 text-emerald-300";
      case "cancelled":
        return "bg-red-900 text-red-300";
      default:
        return "bg-slate-700 text-slate-300";
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-96">
          <p className="text-slate-300">Cargando pedidos...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-amber-300">Pedidos</h1>
          <button
            onClick={() => setShowNewOrderForm(!showNewOrderForm)}
            className="bg-amber-300 text-slate-900 px-4 py-2.5 rounded-lg font-semibold hover:bg-amber-400 transition"
          >
            {showNewOrderForm ? "Cancelar" : "+ Nuevo Pedido"}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/30 border border-red-600 text-red-300 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="bg-emerald-900/30 border border-emerald-600 text-emerald-300 px-4 py-3 rounded">
            {successMessage}
          </div>
        )}

        {/* New Order Form */}
        {showNewOrderForm && (
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
            <h2 className="text-lg font-semibold text-amber-300 mb-4">
              Crear Nuevo Pedido
            </h2>
            <form onSubmit={handleCreateOrder} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Nombre del Cliente *
                </label>
                <input
                  type="text"
                  value={newOrderData.customer_name}
                  onChange={(e) =>
                    setNewOrderData({
                      ...newOrderData,
                      customer_name: e.target.value,
                    })
                  }
                  placeholder="Nombre..."
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={newOrderData.customer_email || ""}
                  onChange={(e) =>
                    setNewOrderData({
                      ...newOrderData,
                      customer_email: e.target.value,
                    })
                  }
                  placeholder="Email..."
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={newOrderData.customer_phone || ""}
                  onChange={(e) =>
                    setNewOrderData({
                      ...newOrderData,
                      customer_phone: e.target.value,
                    })
                  }
                  placeholder="Teléfono..."
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Notas
                </label>
                <input
                  type="text"
                  value={newOrderData.notes || ""}
                  onChange={(e) =>
                    setNewOrderData({
                      ...newOrderData,
                      notes: e.target.value,
                    })
                  }
                  placeholder="Notas opcionales..."
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="md:col-span-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 text-white px-4 py-2.5 rounded font-semibold hover:bg-emerald-700 transition"
                >
                  Crear Pedido
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewOrderForm(false)}
                  className="flex-1 bg-slate-700 text-white px-4 py-2.5 rounded font-semibold hover:bg-slate-600 transition"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Orders List and Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Orders List */}
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
            <h2 className="text-lg font-semibold text-amber-300 mb-4">
              Pedidos ({orders.length})
            </h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {orders.map((order) => (
                <button
                  key={order.id}
                  onClick={() => handleSelectOrder(order.id)}
                  className={`w-full text-left p-3 rounded transition ${
                    selectedOrder?.id === order.id
                      ? "bg-amber-600 border-amber-400"
                      : "bg-slate-700 hover:bg-slate-600 border border-slate-600"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-white">
                        {order.order_number}
                      </p>
                      <p className="text-sm text-slate-300">
                        {order.customer_name}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Order Details */}
          {selectedOrder && (
            <div className="lg:col-span-2 space-y-6">
              {/* Order Info */}
              <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-amber-300">
                      {selectedOrder.order_number}
                    </h3>
                    <p className="text-slate-300">{selectedOrder.customer_name}</p>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded font-semibold ${getStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  {selectedOrder.customer_email && (
                    <p className="text-slate-400">
                      Email: <span className="text-slate-300">{selectedOrder.customer_email}</span>
                    </p>
                  )}
                  {selectedOrder.customer_phone && (
                    <p className="text-slate-400">
                      Teléfono: <span className="text-slate-300">{selectedOrder.customer_phone}</span>
                    </p>
                  )}
                  <p className="text-slate-400">
                    Total: <span className="text-amber-300 font-bold">${selectedOrder.total_amount?.toFixed(2) || "0.00"}</span>
                  </p>
                  {selectedOrder.notes && (
                    <p className="text-slate-400">
                      Notas: <span className="text-slate-300">{selectedOrder.notes}</span>
                    </p>
                  )}
                </div>

                {selectedOrder.status === "pending" && (
                  <button
                    onClick={handleConfirmOrder}
                    className="mt-4 w-full bg-emerald-600 text-white px-4 py-2 rounded font-semibold hover:bg-emerald-700 transition"
                  >
                    Confirmar Pedido (Descontar Inventario)
                  </button>
                )}
              </div>

              {/* Order Items */}
              <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-amber-300">
                    Items ({selectedOrder.items.length})
                  </h3>
                  {selectedOrder.status === "pending" && (
                    <button
                      onClick={() => setShowAddItemForm(!showAddItemForm)}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition"
                    >
                      {showAddItemForm ? "Cerrar" : "Agregar Item"}
                    </button>
                  )}
                </div>

                {showAddItemForm && selectedOrder.status === "pending" && (
                  <form onSubmit={handleAddItem} className="mb-4 p-4 bg-slate-700 rounded">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                      <select
                        value={newItemData.product_id}
                        onChange={(e) =>
                          setNewItemData({
                            ...newItemData,
                            product_id: e.target.value,
                          })
                        }
                        className="bg-slate-600 border border-slate-500 rounded px-2 py-1 text-white text-sm"
                      >
                        <option value="">Selecciona Producto...</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>

                      <input
                        type="number"
                        value={newItemData.quantity || ""}
                        onChange={(e) =>
                          setNewItemData({
                            ...newItemData,
                            quantity: e.target.value === "" ? 0 : parseInt(e.target.value, 10) || 1,
                          })
                        }
                        className="bg-slate-600 border border-slate-500 rounded px-2 py-1 text-white text-sm"
                        placeholder="Cantidad"
                        min="1"
                      />

                      <input
                        type="number"
                        value={newItemData.unit_price || ""}
                        onChange={(e) =>
                          setNewItemData({
                            ...newItemData,
                            unit_price: e.target.value === "" ? 0 : parseFloat(e.target.value) || 0,
                          })
                        }
                        className="bg-slate-600 border border-slate-500 rounded px-2 py-1 text-white text-sm"
                        placeholder="Precio"
                        step="0.01"
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="flex-1 bg-emerald-600 text-white px-2 py-1 rounded text-sm hover:bg-emerald-700 transition"
                      >
                        Agregar
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddItemForm(false)}
                        className="flex-1 bg-slate-600 text-white px-2 py-1 rounded text-sm hover:bg-slate-500 transition"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                )}

                <div className="space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center p-3 bg-slate-700 rounded"
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-white">
                          {item.product_name}
                        </p>
                        <p className="text-sm text-slate-400">
                          {item.quantity} x ${item.unit_price.toFixed(2)} = $
                          {item.subtotal.toFixed(2)}
                        </p>
                      </div>
                      {selectedOrder.status === "pending" && (
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="bg-red-600 text-white px-2 py-1 rounded text-sm hover:bg-red-700 transition"
                        >
                          Eliminar
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Movements History */}
              {selectedOrder.movements.length > 0 && (
                <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                  <h3 className="text-lg font-semibold text-amber-300 mb-4">
                    Historial
                  </h3>
                  <div className="space-y-2">
                    {selectedOrder.movements.map((movement) => (
                      <div key={movement.id} className="p-2 bg-slate-700 rounded text-sm">
                        <p className="text-slate-300">
                          <span className="font-semibold text-amber-300">
                            {movement.status}
                          </span>{" "}
                          - {movement.reason}
                        </p>
                        <p className="text-xs text-slate-500">
                          {new Date(movement.created_at).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
