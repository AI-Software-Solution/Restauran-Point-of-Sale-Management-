import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { enqueueSnackbar } from 'notistack';
import {
  FiUsers, FiSettings, FiActivity, FiFileText, FiDownload,
  FiTrendingUp, FiDollarSign, FiShoppingBag, FiPackage, FiBox,
  FiEdit2, FiTrash2, FiSearch, FiFilter,
  FiRefreshCw, FiPlus, FiGrid, FiSliders, FiMap,
  FiMoreVertical, FiEye, FiEyeOff, FiCheck, FiX
} from 'react-icons/fi';
import { MdTableBar, MdCategory, MdRestaurant } from 'react-icons/md';
import {
  getAdminStats,
  getActivityLogs,
  getSystemSettings,
  updateSystemSetting,
  bulkUpdateSettings,
  initializeSettings,
  getAdminUsers,
  createUser,
  updateAdminUser,
  deleteAdminUser,
  getSalesReport,
  getProductReport,
} from '../../https';
import { exportToCSV, exportToExcel } from '../../utils/exportUtils';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';

// Import sub-components
import TablesManagement from './components/TablesManagement';
import CategoriesManagement from './components/CategoriesManagement';
import ProductsManagement from './components/ProductsManagement';
import ModifiersManagement from './components/ModifiersManagement';

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-64">
    <div className="w-10 h-10 border-4 border-[var(--color-primary)]/30 border-t-[var(--color-primary)] rounded-full animate-spin" />
  </div>
);

// Stat Card Component
const StatCard = ({ label, value, icon: Icon, color, change }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-5"
  >
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-sm text-[var(--color-text-secondary)] mb-1">{label}</p>
        <p className="text-2xl font-bold text-[var(--color-text)]">{value}</p>
        {change && (
          <p className={`text-sm mt-2 ${change >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
            {change >= 0 ? '+' : ''}{change}% haftalik
          </p>
        )}
      </div>
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
        <Icon size={24} className="text-white" />
      </div>
    </div>
  </motion.div>
);

const AdminPro = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    document.title = "POS | Admin Panel";
  }, []);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: FiTrendingUp },
    { id: 'tables', label: 'Stollar', icon: FiMap },
    { id: 'categories', label: 'Kategoriyalar', icon: FiGrid },
    { id: 'products', label: 'Mahsulotlar', icon: FiShoppingBag },
    { id: 'modifiers', label: 'Modifikatorlar', icon: FiSliders },
    { id: 'users', label: 'Foydalanuvchilar', icon: FiUsers },
    { id: 'settings', label: 'Sozlamalar', icon: FiSettings },
    { id: 'activity', label: 'Faoliyat', icon: FiActivity },
    { id: 'reports', label: 'Hisobotlar', icon: FiFileText },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      {/* Header */}
      <div className="bg-[var(--color-surface)] border-b border-[var(--color-border)] px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-text)]">Admin Panel</h1>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1">
              Sistema boshqaruvi va hisobotlar
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-4 overflow-x-auto pb-2 scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-background)]'
              }`}
            >
              <tab.icon size={16} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'dashboard' && <DashboardTab />}
            {activeTab === 'tables' && <TablesManagement />}
            {activeTab === 'categories' && <CategoriesManagement />}
            {activeTab === 'products' && <ProductsManagement />}
            {activeTab === 'modifiers' && <ModifiersManagement />}
            {activeTab === 'users' && <UsersTab />}
            {activeTab === 'settings' && <SettingsTab />}
            {activeTab === 'activity' && <ActivityTab />}
            {activeTab === 'reports' && <ReportsTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

// ==================== DASHBOARD TAB ====================
const DashboardTab = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['adminStats'],
    queryFn: getAdminStats,
  });

  if (isLoading) return <LoadingSpinner />;

  const statCards = [
    { label: "Jami Foydalanuvchilar", value: stats?.totalUsers || 0, icon: FiUsers, color: "bg-blue-500" },
    { label: "Bugungi Buyurtmalar", value: stats?.todayOrders || 0, icon: FiShoppingBag, color: "bg-emerald-500" },
    { label: "Bugungi Daromad", value: `${(stats?.todayRevenue || 0).toLocaleString()} so'm`, icon: FiDollarSign, color: "bg-amber-500" },
    { label: "Mahsulotlar", value: stats?.totalProducts || 0, icon: FiPackage, color: "bg-purple-500" },
  ];

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => (
          <StatCard key={idx} {...stat} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Orders */}
        <Card className="p-5">
          <h3 className="text-lg font-semibold text-[var(--color-text)] mb-4">Haftalik Buyurtmalar</h3>
          <div className="space-y-3">
            {stats?.weeklyOrders?.map((day, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <span className="text-sm text-[var(--color-text-secondary)] w-20">{day.date}</span>
                <div className="flex-1 h-3 bg-[var(--color-background)] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((day.count / (stats?.maxDailyOrders || 1)) * 100, 100)}%` }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    className="h-full bg-[var(--color-primary)] rounded-full"
                  />
                </div>
                <span className="text-sm font-medium text-[var(--color-text)] w-8 text-right">{day.count}</span>
              </div>
            )) || (
              <p className="text-center text-[var(--color-text-secondary)] py-4">Ma'lumot yo'q</p>
            )}
          </div>
        </Card>

        {/* Top Products */}
        <Card className="p-5">
          <h3 className="text-lg font-semibold text-[var(--color-text)] mb-4">Top Mahsulotlar</h3>
          <div className="space-y-3">
            {stats?.topProducts?.map((product, idx) => {
              const rankColors = { 0: 'bg-yellow-500', 1: 'bg-gray-400', 2: 'bg-amber-600' };
              return (
                <div key={idx} className="flex items-center gap-3 py-2 border-b border-[var(--color-border)] last:border-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${rankColors[idx] || 'bg-[var(--color-primary)]'}`}>
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-[var(--color-text)]">{product.name}</p>
                  </div>
                  <Badge variant="default">{product.totalSold} ta</Badge>
                </div>
              );
            }) || (
              <p className="text-center text-[var(--color-text-secondary)] py-4">Ma'lumot yo'q</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

// ==================== USERS TAB ====================
const UsersTab = () => {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', role: 'waiter', password: '' });
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: getAdminUsers,
  });

  const createUserMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      enqueueSnackbar("Foydalanuvchi qo'shildi!", { variant: "success" });
      queryClient.invalidateQueries(['adminUsers']);
      setShowAddModal(false);
      resetForm();
    },
    onError: (error) => {
      enqueueSnackbar(error.message || "Xatolik yuz berdi", { variant: "error" });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }) => updateAdminUser(id, data),
    onSuccess: () => {
      enqueueSnackbar("Foydalanuvchi yangilandi!", { variant: "success" });
      queryClient.invalidateQueries(['adminUsers']);
      setEditingUser(null);
      resetForm();
    },
    onError: (error) => {
      enqueueSnackbar(error.message || "Xatolik yuz berdi", { variant: "error" });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: deleteAdminUser,
    onSuccess: () => {
      enqueueSnackbar("Foydalanuvchi o'chirildi!", { variant: "success" });
      queryClient.invalidateQueries(['adminUsers']);
    },
    onError: (error) => {
      enqueueSnackbar(error.message || "Xatolik yuz berdi", { variant: "error" });
    },
  });

  const resetForm = () => {
    setFormData({ name: '', email: '', phone: '', role: 'waiter', password: '' });
  };

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      password: ''
    });
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.email) {
      enqueueSnackbar("Ism va email majburiy", { variant: "warning" });
      return;
    }

    if (editingUser) {
      const updateData = { ...formData };
      if (!updateData.password) delete updateData.password;
      updateUserMutation.mutate({ id: editingUser._id || editingUser.id, data: updateData });
    } else {
      if (!formData.password) {
        enqueueSnackbar("Parol majburiy", { variant: "warning" });
        return;
      }
      createUserMutation.mutate(formData);
    }
  };

  const filteredUsers = (users || []).filter(user => {
    const matchSearch = user.name?.toLowerCase().includes(search.toLowerCase()) ||
                       user.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole = !roleFilter || user.role === roleFilter;
    return matchSearch && matchRole;
  });

  const getRoleBadge = (role) => {
    const variants = {
      admin: 'danger',
      manager: 'warning',
      cashier: 'info',
      waiter: 'success',
      kitchen: 'default'
    };
    const labels = {
      admin: 'Admin',
      manager: 'Menejer',
      cashier: 'Kassir',
      waiter: 'Ofitsiant',
      kitchen: 'Oshpaz'
    };
    return <Badge variant={variants[role] || 'default'}>{labels[role] || role}</Badge>;
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-1 gap-3">
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]" />
            <input
              type="text"
              placeholder="Qidirish..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          >
            <option value="">Barcha rollar</option>
            <option value="admin">Admin</option>
            <option value="manager">Menejer</option>
            <option value="cashier">Kassir</option>
            <option value="waiter">Ofitsiant</option>
            <option value="kitchen">Oshpaz</option>
          </select>
        </div>
        <Button variant="primary" onClick={() => setShowAddModal(true)}>
          <FiPlus size={16} className="mr-2" />
          Yangi Foydalanuvchi
        </Button>
      </div>

      {/* Users Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[var(--color-background)]">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-[var(--color-text-secondary)]">Ism</th>
                <th className="text-left p-4 text-sm font-medium text-[var(--color-text-secondary)]">Email</th>
                <th className="text-left p-4 text-sm font-medium text-[var(--color-text-secondary)]">Telefon</th>
                <th className="text-left p-4 text-sm font-medium text-[var(--color-text-secondary)]">Rol</th>
                <th className="text-right p-4 text-sm font-medium text-[var(--color-text-secondary)]">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id || user.id} className="border-t border-[var(--color-border)] hover:bg-[var(--color-background)]/50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center">
                        <span className="text-[var(--color-primary)] font-semibold">
                          {user.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="font-medium text-[var(--color-text)]">{user.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-[var(--color-text-secondary)]">{user.email}</td>
                  <td className="p-4 text-[var(--color-text-secondary)]">{user.phone || '-'}</td>
                  <td className="p-4">{getRoleBadge(user.role)}</td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(user)}>
                        <FiEdit2 size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteUserMutation.mutate(user._id || user.id)}
                        className="text-rose-500 hover:text-rose-600"
                      >
                        <FiTrash2 size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-[var(--color-text-secondary)]">
                    Foydalanuvchilar topilmadi
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showAddModal || !!editingUser}
        onClose={() => { setShowAddModal(false); setEditingUser(null); resetForm(); }}
        title={editingUser ? "Foydalanuvchini Tahrirlash" : "Yangi Foydalanuvchi"}
      >
        <div className="space-y-4">
          <Input
            label="Ism"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="To'liq ism"
          />
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="email@example.com"
          />
          <Input
            label="Telefon"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+998 90 123 45 67"
          />
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">Rol</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3 py-2.5 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            >
              <option value="waiter">Ofitsiant</option>
              <option value="cashier">Kassir</option>
              <option value="kitchen">Oshpaz</option>
              <option value="manager">Menejer</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <Input
            label={editingUser ? "Yangi Parol (ixtiyoriy)" : "Parol"}
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="••••••••"
          />
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => { setShowAddModal(false); setEditingUser(null); resetForm(); }}>
              Bekor qilish
            </Button>
            <Button variant="primary" className="flex-1" onClick={handleSubmit} loading={createUserMutation.isPending || updateUserMutation.isPending}>
              {editingUser ? 'Saqlash' : "Qo'shish"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// ==================== SETTINGS TAB ====================
const SettingsTab = () => {
  const [settings, setSettings] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const queryClient = useQueryClient();

  const { data: systemSettings, isLoading } = useQuery({
    queryKey: ['systemSettings'],
    queryFn: getSystemSettings,
  });

  useEffect(() => {
    if (systemSettings) {
      const settingsMap = {};
      systemSettings.forEach(s => {
        settingsMap[s.key] = s.value;
      });
      setSettings(settingsMap);
    }
  }, [systemSettings]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await bulkUpdateSettings(settings);
      enqueueSnackbar("Sozlamalar saqlandi!", { variant: "success" });
      queryClient.invalidateQueries(['systemSettings']);
    } catch (error) {
      enqueueSnackbar("Xatolik yuz berdi", { variant: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleInitialize = async () => {
    try {
      await initializeSettings();
      enqueueSnackbar("Sozlamalar yaratildi!", { variant: "success" });
      queryClient.invalidateQueries(['systemSettings']);
    } catch (error) {
      enqueueSnackbar("Xatolik yuz berdi", { variant: "error" });
    }
  };

  if (isLoading) return <LoadingSpinner />;

  const settingsGroups = [
    {
      title: "Restoran",
      settings: [
        { key: 'restaurant_name', label: 'Restoran Nomi', type: 'text' },
        { key: 'restaurant_address', label: 'Manzil', type: 'text' },
        { key: 'restaurant_phone', label: 'Telefon', type: 'text' },
      ]
    },
    {
      title: "Moliya",
      settings: [
        { key: 'currency', label: 'Valyuta', type: 'select', options: ['UZS', 'USD', 'EUR'] },
        { key: 'tax_rate', label: 'Soliq stavkasi (%)', type: 'number' },
        { key: 'service_charge', label: 'Xizmat haqqi (%)', type: 'number' },
      ]
    },
    {
      title: "Chek",
      settings: [
        { key: 'receipt_header', label: 'Chek sarlavhasi', type: 'textarea' },
        { key: 'receipt_footer', label: 'Chek pastki qismi', type: 'textarea' },
      ]
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-[var(--color-text)]">Sistema Sozlamalari</h2>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleInitialize}>
            Boshlang'ich sozlamalar
          </Button>
          <Button variant="primary" onClick={handleSave} loading={isSaving}>
            Saqlash
          </Button>
        </div>
      </div>

      {settingsGroups.map((group) => (
        <Card key={group.title} className="p-5">
          <h3 className="text-lg font-semibold text-[var(--color-text)] mb-4">{group.title}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {group.settings.map((setting) => (
              <div key={setting.key}>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
                  {setting.label}
                </label>
                {setting.type === 'select' ? (
                  <select
                    value={settings[setting.key] || ''}
                    onChange={(e) => setSettings({ ...settings, [setting.key]: e.target.value })}
                    className="w-full px-3 py-2.5 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  >
                    {setting.options?.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : setting.type === 'textarea' ? (
                  <textarea
                    value={settings[setting.key] || ''}
                    onChange={(e) => setSettings({ ...settings, [setting.key]: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2.5 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] resize-none"
                  />
                ) : (
                  <input
                    type={setting.type}
                    value={settings[setting.key] || ''}
                    onChange={(e) => setSettings({ ...settings, [setting.key]: e.target.value })}
                    className="w-full px-3 py-2.5 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  />
                )}
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
};

// ==================== ACTIVITY TAB ====================
const ActivityTab = () => {
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['activityLogs'],
    queryFn: getActivityLogs,
  });

  if (isLoading) return <LoadingSpinner />;

  const getActionBadge = (action) => {
    const variants = {
      create: 'success',
      update: 'info',
      delete: 'danger',
      login: 'default',
      logout: 'default'
    };
    return <Badge variant={variants[action] || 'default'}>{action}</Badge>;
  };

  return (
    <Card className="overflow-hidden">
      <div className="p-4 border-b border-[var(--color-border)]">
        <h3 className="text-lg font-semibold text-[var(--color-text)]">Faoliyat Tarixi</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[var(--color-background)]">
            <tr>
              <th className="text-left p-4 text-sm font-medium text-[var(--color-text-secondary)]">Vaqt</th>
              <th className="text-left p-4 text-sm font-medium text-[var(--color-text-secondary)]">Foydalanuvchi</th>
              <th className="text-left p-4 text-sm font-medium text-[var(--color-text-secondary)]">Amal</th>
              <th className="text-left p-4 text-sm font-medium text-[var(--color-text-secondary)]">Tavsif</th>
            </tr>
          </thead>
          <tbody>
            {(logs || []).map((log, idx) => (
              <tr key={idx} className="border-t border-[var(--color-border)] hover:bg-[var(--color-background)]/50">
                <td className="p-4 text-sm text-[var(--color-text-secondary)]">
                  {new Date(log.timestamp).toLocaleString('uz-UZ')}
                </td>
                <td className="p-4 text-sm text-[var(--color-text)]">{log.user?.name || 'Sistema'}</td>
                <td className="p-4">{getActionBadge(log.action)}</td>
                <td className="p-4 text-sm text-[var(--color-text-secondary)]">{log.description}</td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-[var(--color-text-secondary)]">
                  Faoliyat tarixi bo'sh
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

// ==================== REPORTS TAB ====================
const ReportsTab = () => {
  const [reportType, setReportType] = useState('sales');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchReport = async () => {
    setIsLoading(true);
    try {
      let data;
      if (reportType === 'sales') {
        data = await getSalesReport(dateRange);
      } else {
        data = await getProductReport(dateRange);
      }
      setReportData(data);
    } catch (error) {
      enqueueSnackbar("Hisobotni olishda xatolik", { variant: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = (format) => {
    if (!reportData) return;

    if (format === 'csv') {
      exportToCSV(reportData, `${reportType}_report`);
    } else {
      exportToExcel(reportData, `${reportType}_report`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="p-5">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">Hisobot Turi</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="px-4 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            >
              <option value="sales">Sotuvlar</option>
              <option value="products">Mahsulotlar</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">Boshlanish</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="px-4 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">Tugash</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="px-4 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </div>
          <Button variant="primary" onClick={fetchReport} loading={isLoading}>
            Hisobot olish
          </Button>
          {reportData && (
            <>
              <Button variant="outline" onClick={() => handleExport('csv')}>
                <FiDownload size={16} className="mr-2" />
                CSV
              </Button>
              <Button variant="outline" onClick={() => handleExport('excel')}>
                <FiDownload size={16} className="mr-2" />
                Excel
              </Button>
            </>
          )}
        </div>
      </Card>

      {/* Report Results */}
      {reportData && (
        <Card className="overflow-hidden">
          <div className="p-4 border-b border-[var(--color-border)]">
            <h3 className="text-lg font-semibold text-[var(--color-text)]">
              {reportType === 'sales' ? 'Sotuvlar Hisoboti' : 'Mahsulotlar Hisoboti'}
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--color-background)]">
                <tr>
                  {reportType === 'sales' ? (
                    <>
                      <th className="text-left p-4 text-sm font-medium text-[var(--color-text-secondary)]">Sana</th>
                      <th className="text-left p-4 text-sm font-medium text-[var(--color-text-secondary)]">Buyurtmalar</th>
                      <th className="text-left p-4 text-sm font-medium text-[var(--color-text-secondary)]">Daromad</th>
                    </>
                  ) : (
                    <>
                      <th className="text-left p-4 text-sm font-medium text-[var(--color-text-secondary)]">Mahsulot</th>
                      <th className="text-left p-4 text-sm font-medium text-[var(--color-text-secondary)]">Sotilgan</th>
                      <th className="text-left p-4 text-sm font-medium text-[var(--color-text-secondary)]">Daromad</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {(Array.isArray(reportData) ? reportData : []).map((item, idx) => (
                  <tr key={idx} className="border-t border-[var(--color-border)]">
                    {reportType === 'sales' ? (
                      <>
                        <td className="p-4 text-[var(--color-text)]">{item.date}</td>
                        <td className="p-4 text-[var(--color-text)]">{item.orders}</td>
                        <td className="p-4 text-[var(--color-text)] font-medium">
                          {new Intl.NumberFormat('uz-UZ').format(item.revenue)} so'm
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="p-4 text-[var(--color-text)]">{item.name}</td>
                        <td className="p-4 text-[var(--color-text)]">{item.sold}</td>
                        <td className="p-4 text-[var(--color-text)] font-medium">
                          {new Intl.NumberFormat('uz-UZ').format(item.revenue)} so'm
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default AdminPro;
