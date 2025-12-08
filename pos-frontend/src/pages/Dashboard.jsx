import React, { useState, useEffect } from "react";
import { MdTableBar, MdCategory, MdTrendingUp, MdTrendingDown, MdAttachMoney, MdShoppingCart, MdPeople, MdRestaurant } from "react-icons/md";
import { BiSolidDish } from "react-icons/bi";
import { FiRefreshCw, FiPlus, FiMoreVertical, FiChevronRight } from "react-icons/fi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { motion, AnimatePresence } from "framer-motion";
import { addCategory, addTable, addDish, getCategories, getStatistic, getOrders, updateOrderStatus, deleteOrder, getTables, getProducts, deleteCategory, deleteDish, deleteTable } from "../https/index";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import Input from "../components/ui/Input";
import Badge from "../components/ui/Badge";
import Tabs from "../components/ui/Tabs";

// Stats Card Component
const StatCard = ({ title, value, change, changeType, icon: Icon, color }) => {
  const isPositive = changeType === 'positive';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-5"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-[var(--color-text-secondary)] mb-1">{title}</p>
          <p className="text-2xl font-bold text-[var(--color-text)]">{value}</p>
          {change !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${isPositive ? 'text-success' : 'text-danger'}`}>
              {isPositive ? <MdTrendingUp size={16} /> : <MdTrendingDown size={16} />}
              <span>{change}% oylik</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </motion.div>
  );
};

// Progress Card Component
const ProgressCard = ({ title, current, target, color, percentage }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-5"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-[var(--color-text)]">{title}</span>
        <span className={`text-sm font-semibold ${color}`}>{percentage}%</span>
      </div>
      <div className="h-2 bg-[var(--color-background)] rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, delay: 0.3 }}
          className={`h-full rounded-full ${color.replace('text-', 'bg-')}`}
        />
      </div>
      <p className="text-xs text-[var(--color-text-secondary)] mt-2">
        {new Intl.NumberFormat('uz-UZ').format(current)} / {new Intl.NumberFormat('uz-UZ').format(target)} so'm
      </p>
    </motion.div>
  );
};

// Top Product Item Component
const TopProductItem = ({ rank, name, quantity, revenue }) => {
  const rankColors = {
    1: 'bg-yellow-500',
    2: 'bg-gray-400',
    3: 'bg-amber-600'
  };

  return (
    <div className="flex items-center gap-4 py-3 border-b border-[var(--color-border)] last:border-0">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${rankColors[rank] || 'bg-[var(--color-primary)]'}`}>
        {rank}
      </div>
      <div className="flex-1">
        <p className="font-medium text-[var(--color-text)]">{name}</p>
        <p className="text-sm text-[var(--color-text-secondary)]">{quantity} ta sotilgan</p>
      </div>
      <p className="font-semibold text-[var(--color-text)]">
        {new Intl.NumberFormat('uz-UZ').format(revenue)} so'm
      </p>
    </div>
  );
};

// Order Status Badge
const OrderStatusBadge = ({ status }) => {
  const statusStyles = {
    'In Progress': { variant: 'warning', label: "Tayyorlanmoqda" },
    'Ready': { variant: 'success', label: "Tayyor" },
    'Completed': { variant: 'default', label: "Yakunlangan" }
  };

  const { variant, label } = statusStyles[status] || { variant: 'default', label: status };
  return <Badge variant={variant}>{label}</Badge>;
};

// Main Dashboard Component
const Dashboard = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isDishesModalOpen, setIsDishesModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteType, setDeleteType] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [controllerTab, setControllerTab] = useState("tables");

  // Form states
  const [tableForm, setTableForm] = useState({ tableNo: '', seats: '' });
  const [categoryForm, setCategoryForm] = useState({ name: '' });
  const [dishForm, setDishForm] = useState({ name: '', price: '', category: '' });

  useEffect(() => {
    document.title = "POS | Dashboard";
  }, []);

  // Queries
  const { data: statistics, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ["statistics"],
    queryFn: getStatistic,
    refetchInterval: 30000,
  });

  const { data: ordersData } = useQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
  });

  const { data: categoriesData, refetch: refetchCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const { data: tables = [] } = useQuery({
    queryKey: ["tables"],
    queryFn: getTables,
  });

  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
  });

  const categories = categoriesData?.categories || categoriesData || [];
  const orders = ordersData?.data?.data || [];

  // Mutations
  const addTableMutation = useMutation({
    mutationFn: addTable,
    onSuccess: () => {
      enqueueSnackbar("Stol muvaffaqiyatli qo'shildi!", { variant: "success" });
      setIsTableModalOpen(false);
      setTableForm({ tableNo: '', seats: '' });
      queryClient.invalidateQueries(["tables"]);
    },
    onError: (error) => {
      enqueueSnackbar(error.message || "Xatolik yuz berdi", { variant: "error" });
    },
  });

  const addCategoryMutation = useMutation({
    mutationFn: addCategory,
    onSuccess: () => {
      enqueueSnackbar("Kategoriya muvaffaqiyatli qo'shildi!", { variant: "success" });
      setIsCategoryModalOpen(false);
      setCategoryForm({ name: '' });
      refetchCategories();
    },
    onError: (error) => {
      enqueueSnackbar(error.message || "Xatolik yuz berdi", { variant: "error" });
    },
  });

  const addDishMutation = useMutation({
    mutationFn: addDish,
    onSuccess: () => {
      enqueueSnackbar("Taom muvaffaqiyatli qo'shildi!", { variant: "success" });
      setIsDishesModalOpen(false);
      setDishForm({ name: '', price: '', category: '' });
      queryClient.invalidateQueries(["products"]);
    },
    onError: (error) => {
      enqueueSnackbar(error.message || "Xatolik yuz berdi", { variant: "error" });
    },
  });

  const orderStatusUpdateMutation = useMutation({
    mutationFn: ({ orderId, orderStatus }) => updateOrderStatus({ orderId, orderStatus }),
    onSuccess: () => {
      enqueueSnackbar("Buyurtma holati yangilandi!", { variant: "success" });
      queryClient.invalidateQueries(["orders"]);
    },
  });

  const deleteOrderMutation = useMutation({
    mutationFn: deleteOrder,
    onSuccess: () => {
      queryClient.invalidateQueries(["orders"]);
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      enqueueSnackbar("Kategoriya o'chirildi!", { variant: "success" });
      queryClient.invalidateQueries(["categories"]);
    },
  });

  const deleteDishMutation = useMutation({
    mutationFn: deleteDish,
    onSuccess: () => {
      enqueueSnackbar("Taom o'chirildi!", { variant: "success" });
      queryClient.invalidateQueries(["products"]);
    },
  });

  const deleteTableMutation = useMutation({
    mutationFn: deleteTable,
    onSuccess: () => {
      enqueueSnackbar("Stol o'chirildi!", { variant: "success" });
      queryClient.invalidateQueries(["tables"]);
    },
  });

  // Handlers
  const handleStatusChange = (orderId, orderStatus) => {
    orderStatusUpdateMutation.mutate({ orderId, orderStatus });
    if (orderStatus === "Completed") {
      setTimeout(() => deleteOrderMutation.mutate(orderId), 2000);
    }
  };

  const handleOpenDeleteModal = (type, id) => {
    setDeleteType(type);
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = () => {
    if (deleteType === "category") deleteCategoryMutation.mutate(deleteId);
    else if (deleteType === "product") deleteDishMutation.mutate(deleteId);
    else if (deleteType === "table") deleteTableMutation.mutate(deleteId);
    setIsDeleteModalOpen(false);
  };

  const handleAddTable = () => {
    if (!tableForm.tableNo || !tableForm.seats) {
      enqueueSnackbar("Barcha maydonlarni to'ldiring", { variant: "warning" });
      return;
    }
    addTableMutation.mutate({ tableNo: tableForm.tableNo, seats: tableForm.seats });
  };

  const handleAddCategory = () => {
    if (!categoryForm.name) {
      enqueueSnackbar("Kategoriya nomini kiriting", { variant: "warning" });
      return;
    }
    addCategoryMutation.mutate({ name: categoryForm.name });
  };

  const handleAddDish = () => {
    if (!dishForm.name || !dishForm.price || !dishForm.category) {
      enqueueSnackbar("Barcha maydonlarni to'ldiring", { variant: "warning" });
      return;
    }
    addDishMutation.mutate({ name: dishForm.name, price: dishForm.price, category: dishForm.category });
  };

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleString('uz-UZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate percentages
  const monthlyTarget = 50000000;
  const monthlyPercentage = Math.min(100, Math.round((statistics?.monthlyRevenue || 0) / monthlyTarget * 100));
  const orderCompletionRate = statistics?.totalOrders > 0
    ? Math.round(((statistics.totalOrders - statistics.activeOrders) / statistics.totalOrders) * 100)
    : 0;
  const tableOccupancy = statistics?.totalTable > 0
    ? Math.min(100, Math.round((statistics?.activeOrders || 0) / statistics.totalTable * 100))
    : 0;

  const tabs = [
    { id: "overview", label: "Umumiy Ko'rinish" },
    { id: "orders", label: "Buyurtmalar" },
    { id: "manage", label: "Boshqaruv" },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      {/* Header */}
      <div className="bg-[var(--color-surface)] border-b border-[var(--color-border)] px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-text)]">Dashboard</h1>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1">
              Real vaqtda restoran statistikasi
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Actions */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsTableModalOpen(true)}
            >
              <FiPlus size={16} className="mr-1" />
              Stol
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCategoryModalOpen(true)}
            >
              <FiPlus size={16} className="mr-1" />
              Kategoriya
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsDishesModalOpen(true)}
            >
              <FiPlus size={16} className="mr-1" />
              Taom
            </Button>

            <div className="w-px h-8 bg-[var(--color-border)] mx-2" />

            {/* Refresh Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refetchStats()}
              className="!p-2"
            >
              <FiRefreshCw size={18} className={statsLoading ? 'animate-spin' : ''} />
            </Button>

            {/* Live Indicator */}
            <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
              <span>Jonli</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-background)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title="Bugungi Daromad"
                  value={`${new Intl.NumberFormat('uz-UZ').format(statistics?.dailyRevenue || 0)} so'm`}
                  change={12}
                  changeType="positive"
                  icon={MdAttachMoney}
                  color="bg-emerald-500"
                />
                <StatCard
                  title="Bugungi Buyurtmalar"
                  value={statistics?.activeOrders || 0}
                  change={8}
                  changeType="positive"
                  icon={MdShoppingCart}
                  color="bg-blue-500"
                />
                <StatCard
                  title="Jami Stollar"
                  value={statistics?.totalTable || 0}
                  icon={MdTableBar}
                  color="bg-purple-500"
                />
                <StatCard
                  title="Jami Taomlar"
                  value={statistics?.totalProducts || 0}
                  icon={MdRestaurant}
                  color="bg-orange-500"
                />
              </div>

              {/* Progress Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ProgressCard
                  title="Oylik Maqsad"
                  current={statistics?.monthlyRevenue || 0}
                  target={monthlyTarget}
                  color="text-emerald-500"
                  percentage={monthlyPercentage}
                />
                <ProgressCard
                  title="Bajarilgan Buyurtmalar"
                  current={(statistics?.totalOrders || 0) - (statistics?.activeOrders || 0)}
                  target={statistics?.totalOrders || 1}
                  color="text-blue-500"
                  percentage={orderCompletionRate}
                />
                <Card className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-[var(--color-text)]">Stollar Bandligi</span>
                    <span className="text-sm font-semibold text-purple-500">{tableOccupancy}%</span>
                  </div>
                  <div className="h-2 bg-[var(--color-background)] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${tableOccupancy}%` }}
                      transition={{ duration: 1, delay: 0.3 }}
                      className="h-full rounded-full bg-purple-500"
                    />
                  </div>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-2">
                    ~{statistics?.activeOrders || 0} ta band / {statistics?.totalTable || 0} ta jami
                  </p>
                </Card>
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Top Products */}
                <Card className="lg:col-span-2 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-[var(--color-text)]">
                      Top Mahsulotlar
                    </h3>
                    <Button variant="ghost" size="sm">
                      Barchasi <FiChevronRight size={16} />
                    </Button>
                  </div>

                  <div className="space-y-1">
                    {statistics?.topProducts?.slice(0, 5).map((product, index) => (
                      <TopProductItem
                        key={product._id}
                        rank={index + 1}
                        name={product.productName}
                        quantity={product.totalQuantity}
                        revenue={product.totalRevenue}
                      />
                    )) || (
                      <p className="text-center text-[var(--color-text-secondary)] py-8">
                        Ma'lumot mavjud emas
                      </p>
                    )}
                  </div>
                </Card>

                {/* Category Stats */}
                <Card className="p-5">
                  <h3 className="text-lg font-semibold text-[var(--color-text)] mb-4">
                    Kategoriyalar
                  </h3>

                  <div className="space-y-4">
                    {statistics?.categoryStats?.slice(0, 5).map((cat, index) => {
                      const maxQuantity = Math.max(...(statistics?.categoryStats?.map(c => c.totalQuantity) || [1]));
                      const percentage = Math.round((cat.totalQuantity / maxQuantity) * 100);
                      const colors = ['bg-purple-500', 'bg-blue-500', 'bg-emerald-500', 'bg-orange-500', 'bg-rose-500'];

                      return (
                        <div key={cat._id}>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-[var(--color-text)]">{cat._id}</span>
                            <span className="text-[var(--color-text-secondary)]">{cat.totalQuantity} ta</span>
                          </div>
                          <div className="h-2 bg-[var(--color-background)] rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${colors[index % colors.length]}`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    }) || (
                      <p className="text-center text-[var(--color-text-secondary)] py-4">
                        Ma'lumot mavjud emas
                      </p>
                    )}
                  </div>

                  {/* Total Revenue */}
                  <div className="mt-6 pt-4 border-t border-[var(--color-border)]">
                    <p className="text-sm text-[var(--color-text-secondary)]">Umumiy Daromad</p>
                    <p className="text-2xl font-bold text-[var(--color-text)]">
                      {new Intl.NumberFormat('uz-UZ').format(statistics?.totalRevenue || 0)}
                      <span className="text-sm text-[var(--color-text-secondary)] ml-1">so'm</span>
                    </p>
                  </div>
                </Card>
              </div>
            </motion.div>
          )}

          {/* Orders Tab */}
          {activeTab === "orders" && (
            <motion.div
              key="orders"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Card className="overflow-hidden">
                <div className="p-4 border-b border-[var(--color-border)]">
                  <h3 className="text-lg font-semibold text-[var(--color-text)]">
                    So'nggi Buyurtmalar
                  </h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[var(--color-background)]">
                      <tr>
                        <th className="text-left p-4 text-sm font-medium text-[var(--color-text-secondary)]">ID</th>
                        <th className="text-left p-4 text-sm font-medium text-[var(--color-text-secondary)]">Mijoz</th>
                        <th className="text-left p-4 text-sm font-medium text-[var(--color-text-secondary)]">Holat</th>
                        <th className="text-left p-4 text-sm font-medium text-[var(--color-text-secondary)]">Sana</th>
                        <th className="text-left p-4 text-sm font-medium text-[var(--color-text-secondary)]">Mahsulotlar</th>
                        <th className="text-left p-4 text-sm font-medium text-[var(--color-text-secondary)]">Stol</th>
                        <th className="text-left p-4 text-sm font-medium text-[var(--color-text-secondary)]">Summa</th>
                        <th className="text-left p-4 text-sm font-medium text-[var(--color-text-secondary)]">To'lov</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.length > 0 ? orders.map((order) => (
                        <tr key={order._id} className="border-b border-[var(--color-border)] hover:bg-[var(--color-background)]/50">
                          <td className="p-4 text-sm text-[var(--color-text)]">
                            #{Math.floor(new Date(order.orderDate).getTime()).toString().slice(-6)}
                          </td>
                          <td className="p-4">
                            <div>
                              <p className="text-sm font-medium text-[var(--color-text)]">
                                {order.customerDetails?.name || "Noma'lum"}
                              </p>
                              <p className="text-xs text-[var(--color-text-secondary)]">
                                {order.customerDetails?.phone || ""}
                              </p>
                            </div>
                          </td>
                          <td className="p-4">
                            <select
                              value={order.orderStatus}
                              onChange={(e) => handleStatusChange(order._id, e.target.value)}
                              className="bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg px-3 py-1.5 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                            >
                              <option value="In Progress">Tayyorlanmoqda</option>
                              <option value="Ready">Tayyor</option>
                              <option value="Completed">Yakunlangan</option>
                            </select>
                          </td>
                          <td className="p-4 text-sm text-[var(--color-text-secondary)]">
                            {formatDate(order.orderDate)}
                          </td>
                          <td className="p-4 text-sm text-[var(--color-text)]">
                            {order.items?.length || 0} ta
                          </td>
                          <td className="p-4 text-sm text-[var(--color-text)]">
                            Stol {order.table?.tableNo || "-"}
                          </td>
                          <td className="p-4 text-sm font-medium text-[var(--color-text)]">
                            {new Intl.NumberFormat('uz-UZ').format(order.bills?.totalWithTax || 0)} so'm
                          </td>
                          <td className="p-4">
                            <Badge variant={order.paymentMethod === 'Card' ? 'info' : 'default'}>
                              {order.paymentMethod === 'Card' ? 'Karta' : 'Naqd'}
                            </Badge>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={8} className="p-8 text-center text-[var(--color-text-secondary)]">
                            Buyurtmalar mavjud emas
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Manage Tab */}
          {activeTab === "manage" && (
            <motion.div
              key="manage"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Card>
                <div className="p-4 border-b border-[var(--color-border)]">
                  <h3 className="text-lg font-semibold text-[var(--color-text)]">
                    Ma'lumotlarni Boshqarish
                  </h3>
                </div>

                {/* Controller Tabs */}
                <div className="p-4 border-b border-[var(--color-border)]">
                  <div className="flex gap-2">
                    {[
                      { id: 'tables', label: 'Stollar' },
                      { id: 'categories', label: 'Kategoriyalar' },
                      { id: 'dishes', label: 'Taomlar' },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setControllerTab(tab.id)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          controllerTab === tab.id
                            ? 'bg-[var(--color-primary)] text-white'
                            : 'bg-[var(--color-background)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  {/* Tables List */}
                  {controllerTab === "tables" && (
                    <>
                      {tables.map((table) => (
                        <div
                          key={table._id}
                          className="flex items-center justify-between p-4 bg-[var(--color-background)] rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center">
                              <MdTableBar size={20} className="text-[var(--color-primary)]" />
                            </div>
                            <div>
                              <p className="font-medium text-[var(--color-text)]">Stol {table.tableNo}</p>
                              <p className="text-sm text-[var(--color-text-secondary)]">{table.seats} o'rindiq</p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDeleteModal("table", table._id)}
                            className="text-danger hover:text-danger hover:bg-danger/10"
                          >
                            O'chirish
                          </Button>
                        </div>
                      ))}
                      {tables.length === 0 && (
                        <p className="text-center text-[var(--color-text-secondary)] py-8">
                          Stollar mavjud emas
                        </p>
                      )}
                    </>
                  )}

                  {/* Categories List */}
                  {controllerTab === "categories" && (
                    <>
                      {(Array.isArray(categories) ? categories : []).map((category) => (
                        <div
                          key={category._id}
                          className="flex items-center justify-between p-4 bg-[var(--color-background)] rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                              <MdCategory size={20} className="text-blue-500" />
                            </div>
                            <p className="font-medium text-[var(--color-text)]">{category.name}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDeleteModal("category", category._id)}
                            className="text-danger hover:text-danger hover:bg-danger/10"
                          >
                            O'chirish
                          </Button>
                        </div>
                      ))}
                      {(!Array.isArray(categories) || categories.length === 0) && (
                        <p className="text-center text-[var(--color-text-secondary)] py-8">
                          Kategoriyalar mavjud emas
                        </p>
                      )}
                    </>
                  )}

                  {/* Dishes List */}
                  {controllerTab === "dishes" && (
                    <>
                      {(Array.isArray(products) ? products : []).map((product) => (
                        <div
                          key={product._id}
                          className="flex items-center justify-between p-4 bg-[var(--color-background)] rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                              <BiSolidDish size={20} className="text-orange-500" />
                            </div>
                            <div>
                              <p className="font-medium text-[var(--color-text)]">{product.name}</p>
                              <p className="text-sm text-[var(--color-text-secondary)]">
                                {new Intl.NumberFormat('uz-UZ').format(product.price)} so'm
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDeleteModal("product", product._id)}
                            className="text-danger hover:text-danger hover:bg-danger/10"
                          >
                            O'chirish
                          </Button>
                        </div>
                      ))}
                      {(!Array.isArray(products) || products.length === 0) && (
                        <p className="text-center text-[var(--color-text-secondary)] py-8">
                          Taomlar mavjud emas
                        </p>
                      )}
                    </>
                  )}
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Add Table Modal */}
      <Modal
        isOpen={isTableModalOpen}
        onClose={() => setIsTableModalOpen(false)}
        title="Stol Qo'shish"
      >
        <div className="space-y-4">
          <Input
            label="Stol Raqami"
            type="number"
            value={tableForm.tableNo}
            onChange={(e) => setTableForm({ ...tableForm, tableNo: e.target.value })}
            placeholder="1"
          />
          <Input
            label="O'rindiqlar Soni"
            type="number"
            value={tableForm.seats}
            onChange={(e) => setTableForm({ ...tableForm, seats: e.target.value })}
            placeholder="4"
          />
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setIsTableModalOpen(false)}>
              Bekor qilish
            </Button>
            <Button variant="primary" className="flex-1" onClick={handleAddTable} loading={addTableMutation.isPending}>
              Qo'shish
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Category Modal */}
      <Modal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title="Kategoriya Qo'shish"
      >
        <div className="space-y-4">
          <Input
            label="Kategoriya Nomi"
            value={categoryForm.name}
            onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
            placeholder="Salatlar"
          />
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setIsCategoryModalOpen(false)}>
              Bekor qilish
            </Button>
            <Button variant="primary" className="flex-1" onClick={handleAddCategory} loading={addCategoryMutation.isPending}>
              Qo'shish
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Dish Modal */}
      <Modal
        isOpen={isDishesModalOpen}
        onClose={() => setIsDishesModalOpen(false)}
        title="Taom Qo'shish"
      >
        <div className="space-y-4">
          <Input
            label="Taom Nomi"
            value={dishForm.name}
            onChange={(e) => setDishForm({ ...dishForm, name: e.target.value })}
            placeholder="Sezar Salat"
          />
          <Input
            label="Narxi"
            type="number"
            value={dishForm.price}
            onChange={(e) => setDishForm({ ...dishForm, price: e.target.value })}
            placeholder="45000"
          />
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
              Kategoriya
            </label>
            <select
              value={dishForm.category}
              onChange={(e) => setDishForm({ ...dishForm, category: e.target.value })}
              className="w-full px-3 py-2.5 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
            >
              <option value="">Tanlang...</option>
              {(Array.isArray(categories) ? categories : []).map((cat) => (
                <option key={cat._id || cat.id} value={cat._id || cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setIsDishesModalOpen(false)}>
              Bekor qilish
            </Button>
            <Button variant="primary" className="flex-1" onClick={handleAddDish} loading={addDishMutation.isPending}>
              Qo'shish
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="O'chirishni Tasdiqlash"
      >
        <div className="space-y-4">
          <p className="text-[var(--color-text-secondary)]">
            Haqiqatan ham bu {deleteType === 'table' ? 'stolni' : deleteType === 'category' ? 'kategoriyani' : 'taomni'} o'chirmoqchimisiz?
          </p>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setIsDeleteModalOpen(false)}>
              Bekor qilish
            </Button>
            <Button variant="danger" className="flex-1" onClick={handleDelete}>
              O'chirish
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Dashboard;
