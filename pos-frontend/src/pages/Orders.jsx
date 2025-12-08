import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { keepPreviousData, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import {
  HiOutlineSearch,
  HiOutlineRefresh,
  HiOutlineEye,
  HiOutlineTrash,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
  HiOutlineFilter,
  HiOutlineCalendar,
  HiOutlineUser,
  HiOutlineCurrencyDollar,
  HiOutlinePrinter,
  HiOutlineX,
} from "react-icons/hi";
import { MdTableBar, MdTakeoutDining, MdDeliveryDining, MdKitchen } from "react-icons/md";
import { Button, Card, Badge, Modal, OrderStatusBadge } from "../components/ui";
import { getOrders, updateOrderStatus, deleteOrder } from "../https/index";

// Order status configuration
const ORDER_STATUSES = {
  "In Progress": { label: "Tayyorlanmoqda", color: "warning", icon: MdKitchen },
  "Ready": { label: "Tayyor", color: "success", icon: HiOutlineCheckCircle },
  "Completed": { label: "Yakunlangan", color: "secondary", icon: HiOutlineCheckCircle },
  "Cancelled": { label: "Bekor qilingan", color: "danger", icon: HiOutlineX },
};

const Orders = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();

  // Local state
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    document.title = "POS | Buyurtmalar";
  }, []);

  // Check if there's an order ID in URL
  useEffect(() => {
    const orderId = searchParams.get('order');
    if (orderId) {
      // Find and open order details
    }
  }, [searchParams]);

  // Fetch orders
  const { data: resData, isLoading, isError, refetch } = useQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
    placeholderData: keepPreviousData,
    refetchInterval: 15000, // Refresh every 15 seconds
  });

  const orders = Array.isArray(resData) ? resData : (resData?.data || []);

  // Update order status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, orderStatus }) => updateOrderStatus({ orderId, orderStatus }),
    onSuccess: () => {
      queryClient.invalidateQueries(["orders"]);
      enqueueSnackbar("Buyurtma holati yangilandi", { variant: "success" });
    },
    onError: () => {
      enqueueSnackbar("Xatolik yuz berdi", { variant: "error" });
    },
  });

  // Delete order mutation
  const deleteMutation = useMutation({
    mutationFn: deleteOrder,
    onSuccess: () => {
      queryClient.invalidateQueries(["orders"]);
      setShowDeleteModal(false);
      setSelectedOrder(null);
      enqueueSnackbar("Buyurtma o'chirildi", { variant: "success" });
    },
    onError: () => {
      enqueueSnackbar("Xatolik yuz berdi", { variant: "error" });
    },
  });

  // Filter orders
  const filteredOrders = useMemo(() => {
    let result = orders;

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter(order => {
        const status = order.orderStatus?.toLowerCase() || order.status?.toLowerCase();
        return status?.includes(statusFilter.toLowerCase());
      });
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(order =>
        String(order._id || order.id || '').toLowerCase().includes(query) ||
        order.customerDetails?.name?.toLowerCase().includes(query) ||
        order.table?.tableNo?.toString().includes(query)
      );
    }

    // Sort by newest first
    return result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [orders, statusFilter, searchQuery]);

  // Stats
  const stats = useMemo(() => {
    const total = orders.length;
    const inProgress = orders.filter(o =>
      o.orderStatus?.toLowerCase().includes("progress") || o.status?.toLowerCase().includes("progress")
    ).length;
    const ready = orders.filter(o =>
      o.orderStatus?.toLowerCase() === "ready" || o.status?.toLowerCase() === "ready"
    ).length;
    const completed = orders.filter(o =>
      o.orderStatus?.toLowerCase() === "completed" || o.status?.toLowerCase() === "completed"
    ).length;
    return { total, inProgress, ready, completed };
  }, [orders]);

  // Handle status change
  const handleStatusChange = (orderId, newStatus) => {
    updateStatusMutation.mutate({ orderId, orderStatus: newStatus });
  };

  // Handle delete
  const handleDelete = () => {
    if (selectedOrder) {
      deleteMutation.mutate(selectedOrder._id || selectedOrder.id);
    }
  };

  // View order details
  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleString('uz-UZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return Number(amount || 0).toLocaleString() + " UZS";
  };

  // Get order type icon
  const getOrderTypeIcon = (order) => {
    const type = order.customerDetails?.orderType || "dine-in";
    if (type === "takeaway") return <MdTakeoutDining className="w-4 h-4" />;
    if (type === "delivery") return <MdDeliveryDining className="w-4 h-4" />;
    return <MdTableBar className="w-4 h-4" />;
  };

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col bg-background">
      {/* Header */}
      <div className="bg-surface border-b border-border px-4 py-3">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Title & Stats */}
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-xl font-semibold text-text-primary">Buyurtmalar</h1>
              <p className="text-sm text-text-secondary">
                Jami {stats.total} ta buyurtma
              </p>
            </div>

            {/* Quick Stats */}
            <div className="hidden md:flex items-center gap-2">
              <Badge variant="warning" className="gap-1">
                <MdKitchen className="w-3 h-3" />
                {stats.inProgress} Tayyorlanmoqda
              </Badge>
              <Badge variant="success" className="gap-1">
                <HiOutlineCheckCircle className="w-3 h-3" />
                {stats.ready} Tayyor
              </Badge>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative hidden sm:block">
              <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder="Qidirish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-2 w-56 bg-surface-secondary border-0 rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Refresh */}
            <Button
              variant="ghost"
              size="sm"
              icon={<HiOutlineRefresh className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />}
              onClick={() => refetch()}
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mt-3 overflow-x-auto">
          {[
            { key: "all", label: "Hammasi", count: stats.total },
            { key: "progress", label: "Tayyorlanmoqda", count: stats.inProgress },
            { key: "ready", label: "Tayyor", count: stats.ready },
            { key: "completed", label: "Yakunlangan", count: stats.completed },
          ].map((filter) => (
            <button
              key={filter.key}
              onClick={() => setStatusFilter(filter.key)}
              className={`
                px-4 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2
                ${statusFilter === filter.key
                  ? 'bg-primary text-white'
                  : 'bg-surface-secondary text-text-secondary hover:text-text-primary'
                }
              `}
            >
              {filter.label}
              <span className={`
                px-1.5 py-0.5 rounded text-xs
                ${statusFilter === filter.key ? 'bg-white/20' : 'bg-border'}
              `}>
                {filter.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <HiOutlineRefresh className="w-8 h-8 mx-auto mb-2 animate-spin text-primary" />
              <p className="text-text-secondary">Yuklanmoqda...</p>
            </div>
          </div>
        ) : isError ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <HiOutlineExclamationCircle className="w-12 h-12 mx-auto mb-2 text-danger" />
              <p className="text-text-primary font-medium">Xatolik yuz berdi</p>
              <p className="text-text-secondary text-sm">Ma'lumotlarni yuklashda muammo</p>
              <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-3">
                Qayta urinish
              </Button>
            </div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <HiOutlineClock className="w-16 h-16 mx-auto mb-4 text-text-muted opacity-50" />
              <p className="text-text-primary font-medium">Buyurtmalar topilmadi</p>
              <p className="text-text-secondary text-sm">
                {statusFilter !== "all" ? "Bu filtr bo'yicha buyurtma yo'q" : "Hozircha buyurtmalar yo'q"}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOrders.map((order) => {
              const orderId = order._id || order.id;
              const status = order.orderStatus || order.status || "In Progress";
              const statusConfig = ORDER_STATUSES[status] || ORDER_STATUSES["In Progress"];

              return (
                <Card key={orderId} className="overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Card Header */}
                  <div className="flex items-center justify-between p-4 border-b border-border bg-surface-secondary/50">
                    <div className="flex items-center gap-3">
                      <div className={`
                        w-10 h-10 rounded-lg flex items-center justify-center
                        ${statusConfig.color === 'warning' ? 'bg-warning/20 text-warning' :
                          statusConfig.color === 'success' ? 'bg-success/20 text-success' :
                          statusConfig.color === 'danger' ? 'bg-danger/20 text-danger' :
                          'bg-surface-secondary text-text-secondary'}
                      `}>
                        {React.createElement(statusConfig.icon, { className: "w-5 h-5" })}
                      </div>
                      <div>
                        <p className="font-semibold text-text-primary">
                          #{orderId.slice(-6).toUpperCase()}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-text-secondary">
                          {getOrderTypeIcon(order)}
                          <span>
                            {order.table?.tableNo ? `Stol ${order.table.tableNo}` :
                              order.customerDetails?.orderType === 'takeaway' ? 'Olib ketish' : 'Buyurtma'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <OrderStatusBadge status={status} />
                  </div>

                  {/* Card Body */}
                  <div className="p-4">
                    {/* Customer Info */}
                    <div className="flex items-center gap-2 mb-3">
                      <HiOutlineUser className="w-4 h-4 text-text-muted" />
                      <span className="text-sm text-text-primary">
                        {order.customerDetails?.name || "Mehmon"}
                      </span>
                    </div>

                    {/* Items */}
                    <div className="space-y-1 mb-3">
                      {order.items?.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <span className="text-text-secondary truncate flex-1">
                            {item.quantity}x {item.name}
                          </span>
                          <span className="text-text-primary font-medium ml-2">
                            {formatCurrency(item.price)}
                          </span>
                        </div>
                      ))}
                      {order.items?.length > 3 && (
                        <p className="text-xs text-text-muted">
                          +{order.items.length - 3} ta mahsulot
                        </p>
                      )}
                    </div>

                    {/* Total & Time */}
                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <div className="flex items-center gap-1 text-xs text-text-secondary">
                        <HiOutlineClock className="w-3 h-3" />
                        {formatDate(order.createdAt)}
                      </div>
                      <p className="font-bold text-primary">
                        {formatCurrency(order.bills?.totalWithTax || order.bills?.total)}
                      </p>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="flex items-center gap-2 px-4 py-3 bg-surface-secondary/30 border-t border-border">
                    <Button
                      variant="outline"
                      size="xs"
                      icon={<HiOutlineEye className="w-4 h-4" />}
                      onClick={() => viewOrderDetails(order)}
                      className="flex-1"
                    >
                      Ko'rish
                    </Button>

                    {status === "In Progress" && (
                      <Button
                        variant="success"
                        size="xs"
                        icon={<HiOutlineCheckCircle className="w-4 h-4" />}
                        onClick={() => handleStatusChange(orderId, "Ready")}
                        className="flex-1"
                      >
                        Tayyor
                      </Button>
                    )}

                    {status === "Ready" && (
                      <Button
                        variant="primary"
                        size="xs"
                        icon={<HiOutlineCheckCircle className="w-4 h-4" />}
                        onClick={() => handleStatusChange(orderId, "Completed")}
                        className="flex-1"
                      >
                        Yakunlash
                      </Button>
                    )}

                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowDeleteModal(true);
                      }}
                      className="p-2 rounded text-text-secondary hover:text-danger hover:bg-danger/10 transition-colors"
                    >
                      <HiOutlineTrash className="w-4 h-4" />
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title={`Buyurtma #${(selectedOrder?._id || selectedOrder?.id || "").slice(-6).toUpperCase()}`}
        size="md"
      >
        {selectedOrder && (
          <div className="space-y-4">
            {/* Status & Type */}
            <div className="flex items-center justify-between">
              <OrderStatusBadge status={selectedOrder.orderStatus || selectedOrder.status} />
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                {getOrderTypeIcon(selectedOrder)}
                <span>
                  {selectedOrder.table?.tableNo ? `Stol ${selectedOrder.table.tableNo}` :
                    selectedOrder.customerDetails?.orderType === 'takeaway' ? 'Olib ketish' : 'Buyurtma'}
                </span>
              </div>
            </div>

            {/* Customer Info */}
            <div className="p-3 bg-surface-secondary rounded-lg">
              <p className="font-medium text-text-primary">
                {selectedOrder.customerDetails?.name || "Mehmon"}
              </p>
              {selectedOrder.customerDetails?.phone && (
                <p className="text-sm text-text-secondary">
                  Tel: {selectedOrder.customerDetails.phone}
                </p>
              )}
              <p className="text-xs text-text-muted mt-1">
                {formatDate(selectedOrder.createdAt)}
              </p>
            </div>

            {/* Items */}
            <div>
              <h4 className="font-medium text-text-primary mb-2">Mahsulotlar</h4>
              <div className="space-y-2">
                {selectedOrder.items?.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div>
                      <p className="text-text-primary">{item.name}</p>
                      <p className="text-xs text-text-secondary">
                        {item.quantity} x {formatCurrency(item.pricePerQuantity || item.price / item.quantity)}
                      </p>
                    </div>
                    <p className="font-medium text-text-primary">
                      {formatCurrency(item.price)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="p-3 bg-surface-secondary rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Jami</span>
                <span className="text-text-primary">{formatCurrency(selectedOrder.bills?.total)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Soliq</span>
                <span className="text-text-primary">{formatCurrency(selectedOrder.bills?.tax)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-border">
                <span className="font-semibold text-text-primary">Umumiy</span>
                <span className="font-bold text-primary text-lg">
                  {formatCurrency(selectedOrder.bills?.totalWithTax)}
                </span>
              </div>
            </div>

            {/* Payment Method */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-secondary">To'lov usuli</span>
              <Badge variant="secondary">
                {selectedOrder.paymentMethod || "Naqd"}
              </Badge>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4 border-t border-border">
              <Button
                variant="outline"
                icon={<HiOutlinePrinter className="w-4 h-4" />}
                fullWidth
              >
                Chop etish
              </Button>
              <Button
                variant="primary"
                onClick={() => setShowDetailModal(false)}
                fullWidth
              >
                Yopish
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Buyurtmani o'chirish"
        size="sm"
      >
        <div className="space-y-4">
          <div className="text-center py-4">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-danger/10 flex items-center justify-center">
              <HiOutlineTrash className="w-8 h-8 text-danger" />
            </div>
            <p className="text-text-primary">
              Buyurtma <span className="font-semibold">#{(selectedOrder?._id || "").slice(-6).toUpperCase()}</span> ni o'chirishni xohlaysizmi?
            </p>
            <p className="text-sm text-text-secondary mt-1">
              Bu amalni qaytarib bo'lmaydi
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)} fullWidth>
              Bekor qilish
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              fullWidth
            >
              {deleteMutation.isPending ? "O'chirilmoqda..." : "O'chirish"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Orders;
