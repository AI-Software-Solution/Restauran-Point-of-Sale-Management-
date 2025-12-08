import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { enqueueSnackbar } from 'notistack';
import {
  FiPackage, FiTruck, FiAlertTriangle, FiPlus, FiEdit2, FiTrash2,
  FiArrowUp, FiArrowDown, FiRefreshCw, FiSearch, FiFilter, FiZap
} from 'react-icons/fi';
import {
  getIngredients, getSuppliers, getInventoryStats, getInventoryAlerts,
  createIngredient, updateIngredient, deleteIngredient,
  createSupplier, updateSupplier, deleteSupplier,
  addStock, removeStock, recordWaste, resolveAlert, findIngredientByBarcode
} from '../../https';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';

const UNITS = ['kg', 'g', 'l', 'ml', 'dona', 'pachka', 'quti'];
const CATEGORIES = ['Go\'sht', 'Sabzavot', 'Meva', 'Sut mahsulotlari', 'Don', 'Ziravorlar', 'Ichimlik', 'Boshqa'];

const Inventory = () => {
  const [activeTab, setActiveTab] = useState('ingredients');
  const [showModal, setShowModal] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [showLowStock, setShowLowStock] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [barcodeSearching, setBarcodeSearching] = useState(false);
  const [formData, setFormData] = useState({});

  const queryClient = useQueryClient();

  useEffect(() => {
    document.title = "POS | Ombor Boshqaruvi";
  }, []);

  // Queries
  const { data: ingredientsData, isLoading: ingredientsLoading } = useQuery({
    queryKey: ['ingredients', { category: filterCategory, lowStock: showLowStock, search: searchTerm }],
    queryFn: () => getIngredients({ category: filterCategory, lowStock: showLowStock, search: searchTerm })
  });

  const { data: suppliersData } = useQuery({
    queryKey: ['suppliers'],
    queryFn: getSuppliers
  });

  const { data: statsData } = useQuery({
    queryKey: ['inventoryStats'],
    queryFn: getInventoryStats
  });

  const { data: alertsData } = useQuery({
    queryKey: ['inventoryAlerts'],
    queryFn: () => getInventoryAlerts(false)
  });

  const ingredients = ingredientsData?.data || [];
  const suppliers = suppliersData?.data || [];
  const stats = statsData?.data || {};
  const alerts = alertsData?.data || [];

  // Mutations
  const createIngredientMutation = useMutation({
    mutationFn: createIngredient,
    onSuccess: () => {
      queryClient.invalidateQueries(['ingredients']);
      queryClient.invalidateQueries(['inventoryStats']);
      enqueueSnackbar('Ingredient qo\'shildi', { variant: 'success' });
      closeModal();
    },
    onError: (error) => enqueueSnackbar(error.message, { variant: 'error' })
  });

  const updateIngredientMutation = useMutation({
    mutationFn: ({ id, data }) => updateIngredient(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['ingredients']);
      enqueueSnackbar('Ingredient yangilandi', { variant: 'success' });
      closeModal();
    },
    onError: (error) => enqueueSnackbar(error.message, { variant: 'error' })
  });

  const addStockMutation = useMutation({
    mutationFn: addStock,
    onSuccess: () => {
      queryClient.invalidateQueries(['ingredients']);
      queryClient.invalidateQueries(['inventoryStats']);
      queryClient.invalidateQueries(['inventoryAlerts']);
      enqueueSnackbar('Zaxira qo\'shildi', { variant: 'success' });
      closeModal();
    },
    onError: (error) => enqueueSnackbar(error.message, { variant: 'error' })
  });

  const removeStockMutation = useMutation({
    mutationFn: removeStock,
    onSuccess: () => {
      queryClient.invalidateQueries(['ingredients']);
      queryClient.invalidateQueries(['inventoryStats']);
      enqueueSnackbar('Zaxiradan chiqarildi', { variant: 'success' });
      closeModal();
    },
    onError: (error) => enqueueSnackbar(error.message, { variant: 'error' })
  });

  const createSupplierMutation = useMutation({
    mutationFn: createSupplier,
    onSuccess: () => {
      queryClient.invalidateQueries(['suppliers']);
      enqueueSnackbar('Yetkazib beruvchi qo\'shildi', { variant: 'success' });
      closeModal();
    },
    onError: (error) => enqueueSnackbar(error.message, { variant: 'error' })
  });

  const updateSupplierMutation = useMutation({
    mutationFn: ({ id, data }) => updateSupplier(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['suppliers']);
      enqueueSnackbar('Yetkazib beruvchi yangilandi', { variant: 'success' });
      closeModal();
    },
    onError: (error) => enqueueSnackbar(error.message, { variant: 'error' })
  });

  const deleteSupplierMutation = useMutation({
    mutationFn: deleteSupplier,
    onSuccess: () => {
      queryClient.invalidateQueries(['suppliers']);
      enqueueSnackbar('Yetkazib beruvchi o\'chirildi', { variant: 'success' });
    },
    onError: (error) => enqueueSnackbar(error.message, { variant: 'error' })
  });

  const resolveAlertMutation = useMutation({
    mutationFn: resolveAlert,
    onSuccess: () => {
      queryClient.invalidateQueries(['inventoryAlerts']);
      enqueueSnackbar('Ogohlantirish hal qilindi', { variant: 'success' });
    }
  });

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('uz-UZ').format(value || 0) + ' so\'m';
  };

  const closeModal = () => {
    setShowModal(null);
    setSelectedItem(null);
    setFormData({});
  };

  const openModal = (type, item = null) => {
    setSelectedItem(item);
    setShowModal(type);
    if (type === 'editIngredient' && item) {
      setFormData({
        name: item.name,
        sku: item.sku || '',
        barcode: item.barcode || '',
        unit: item.unit,
        minStock: item.minStock,
        costPerUnit: item.costPerUnit,
        supplierId: item.supplierId,
        categoryName: item.categoryName
      });
    } else if (type === 'editSupplier' && item) {
      setFormData({
        name: item.name,
        contactPerson: item.contactPerson || '',
        phone: item.phone || '',
        email: item.email || ''
      });
    } else {
      setFormData({});
    }
  };

  const handleSubmit = () => {
    if (showModal === 'addIngredient') {
      createIngredientMutation.mutate(formData);
    } else if (showModal === 'editIngredient') {
      updateIngredientMutation.mutate({ id: selectedItem.id, data: formData });
    } else if (showModal === 'addStock') {
      addStockMutation.mutate({ ingredientId: selectedItem.id, ...formData });
    } else if (showModal === 'removeStock') {
      removeStockMutation.mutate({ ingredientId: selectedItem.id, ...formData });
    } else if (showModal === 'addSupplier') {
      createSupplierMutation.mutate(formData);
    } else if (showModal === 'editSupplier') {
      updateSupplierMutation.mutate({ id: selectedItem.id, data: formData });
    }
  };

  const handleBarcodeSearch = async (e) => {
    if (e.key === 'Enter' && barcodeInput.trim()) {
      setBarcodeSearching(true);
      try {
        const result = await findIngredientByBarcode(barcodeInput.trim());
        if (result.success && result.data) {
          openModal('addStock', result.data);
          setBarcodeInput('');
          enqueueSnackbar(`${result.data.name} topildi!`, { variant: 'success' });
        }
      } catch (error) {
        enqueueSnackbar('Ingredient topilmadi', { variant: 'error' });
      } finally {
        setBarcodeSearching(false);
      }
    }
  };

  const tabs = [
    { id: 'ingredients', label: 'Ingredientlar', icon: FiPackage },
    { id: 'suppliers', label: 'Yetkazib beruvchilar', icon: FiTruck },
    { id: 'alerts', label: 'Ogohlantirishlar', icon: FiAlertTriangle, badge: alerts.length }
  ];

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      {/* Header */}
      <div className="bg-[var(--color-surface)] border-b border-[var(--color-border)] px-6 py-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-text)]">Ombor Boshqaruvi</h1>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1">
              Ingredientlar va zaxiralarni boshqaring
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {/* Barcode Scanner */}
            <div className="relative">
              <FiZap className={`absolute left-3 top-1/2 -translate-y-1/2 ${barcodeSearching ? 'text-emerald-500 animate-pulse' : 'text-[var(--color-text-secondary)]'}`} />
              <input
                type="text"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                onKeyDown={handleBarcodeSearch}
                placeholder="Barcode skanerlang..."
                className="bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg pl-10 pr-4 py-2 text-[var(--color-text)] placeholder-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] w-48"
              />
            </div>
            <Button variant="outline" onClick={() => openModal('addSupplier')}>
              <FiTruck size={16} className="mr-2" />
              Yetkazib beruvchi
            </Button>
            <Button variant="primary" onClick={() => openModal('addIngredient')}>
              <FiPlus size={16} className="mr-2" />
              Ingredient
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-background)]'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
              {tab.badge > 0 && (
                <span className="bg-rose-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <FiPackage className="text-blue-500" size={20} />
              </div>
              <div>
                <p className="text-xs text-[var(--color-text-secondary)]">Jami Ingredientlar</p>
                <p className="text-xl font-bold text-[var(--color-text)]">{stats.totalIngredients || 0}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <FiAlertTriangle className="text-amber-500" size={20} />
              </div>
              <div>
                <p className="text-xs text-[var(--color-text-secondary)]">Kam Qolgan</p>
                <p className="text-xl font-bold text-[var(--color-text)]">{stats.lowStockCount || 0}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-rose-500/10 flex items-center justify-center">
                <FiPackage className="text-rose-500" size={20} />
              </div>
              <div>
                <p className="text-xs text-[var(--color-text-secondary)]">Tugagan</p>
                <p className="text-xl font-bold text-[var(--color-text)]">{stats.outOfStockCount || 0}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <FiPackage className="text-emerald-500" size={20} />
              </div>
              <div>
                <p className="text-xs text-[var(--color-text-secondary)]">Umumiy Qiymat</p>
                <p className="text-lg font-bold text-[var(--color-text)]">{formatCurrency(stats.totalValue)}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Ingredients Tab */}
        {activeTab === 'ingredients' && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]" />
                <input
                  type="text"
                  placeholder="Qidirish..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg pl-10 pr-4 py-2 text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
              </div>

              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg px-4 py-2 text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              >
                <option value="">Barcha kategoriyalar</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              <Button
                variant={showLowStock ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setShowLowStock(!showLowStock)}
              >
                <FiFilter size={16} className="mr-2" />
                Kam qolganlar
              </Button>
            </div>

            {/* Table */}
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[var(--color-background)]">
                    <tr>
                      <th className="text-left p-4 text-sm font-medium text-[var(--color-text-secondary)]">Nomi</th>
                      <th className="text-left p-4 text-sm font-medium text-[var(--color-text-secondary)]">Kategoriya</th>
                      <th className="text-right p-4 text-sm font-medium text-[var(--color-text-secondary)]">Zaxira</th>
                      <th className="text-right p-4 text-sm font-medium text-[var(--color-text-secondary)]">Min</th>
                      <th className="text-right p-4 text-sm font-medium text-[var(--color-text-secondary)]">Narx</th>
                      <th className="text-center p-4 text-sm font-medium text-[var(--color-text-secondary)]">Holat</th>
                      <th className="text-center p-4 text-sm font-medium text-[var(--color-text-secondary)]">Amallar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ingredientsLoading ? (
                      <tr>
                        <td colSpan="7" className="text-center py-8 text-[var(--color-text-secondary)]">
                          Yuklanmoqda...
                        </td>
                      </tr>
                    ) : ingredients.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center py-8 text-[var(--color-text-secondary)]">
                          Ingredientlar topilmadi
                        </td>
                      </tr>
                    ) : (
                      ingredients.map((item) => {
                        const stock = parseFloat(item.currentStock) || 0;
                        const minStock = parseFloat(item.minStock) || 0;
                        const isLow = stock <= minStock && stock > 0;
                        const isOut = stock === 0;

                        return (
                          <tr key={item.id} className="border-t border-[var(--color-border)] hover:bg-[var(--color-background)]/50">
                            <td className="p-4">
                              <span className="font-medium text-[var(--color-text)]">{item.name}</span>
                            </td>
                            <td className="p-4 text-[var(--color-text-secondary)]">{item.categoryName || '-'}</td>
                            <td className={`p-4 text-right font-medium ${isOut ? 'text-rose-500' : isLow ? 'text-amber-500' : 'text-[var(--color-text)]'}`}>
                              {stock} {item.unit}
                            </td>
                            <td className="p-4 text-right text-[var(--color-text-secondary)]">{minStock} {item.unit}</td>
                            <td className="p-4 text-right text-[var(--color-text-secondary)]">{formatCurrency(item.costPerUnit)}/{item.unit}</td>
                            <td className="p-4 text-center">
                              <Badge variant={isOut ? 'danger' : isLow ? 'warning' : 'success'}>
                                {isOut ? 'Tugagan' : isLow ? 'Kam' : 'Yetarli'}
                              </Badge>
                            </td>
                            <td className="p-4">
                              <div className="flex justify-center gap-2">
                                <Button variant="ghost" size="sm" onClick={() => openModal('addStock', item)} className="text-emerald-500">
                                  <FiArrowUp size={16} />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => openModal('removeStock', item)} className="text-blue-500">
                                  <FiArrowDown size={16} />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => openModal('editIngredient', item)} className="text-amber-500">
                                  <FiEdit2 size={16} />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* Suppliers Tab */}
        {activeTab === 'suppliers' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {suppliers.map((supplier) => (
              <Card key={supplier.id} className="p-4">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-[var(--color-text)]">{supplier.name}</h3>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => openModal('editSupplier', supplier)} className="text-amber-500">
                      <FiEdit2 size={16} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => deleteSupplierMutation.mutate(supplier.id)} className="text-rose-500">
                      <FiTrash2 size={16} />
                    </Button>
                  </div>
                </div>
                {supplier.contactPerson && (
                  <p className="text-[var(--color-text-secondary)] text-sm mt-1">{supplier.contactPerson}</p>
                )}
                {supplier.phone && (
                  <p className="text-[var(--color-text-secondary)] text-sm">{supplier.phone}</p>
                )}
                {supplier.email && (
                  <p className="text-[var(--color-text-secondary)] text-sm">{supplier.email}</p>
                )}
                <div className="mt-3 pt-3 border-t border-[var(--color-border)]">
                  <span className="text-xs text-[var(--color-text-secondary)]">
                    {supplier.ingredients?.length || 0} ta ingredient
                  </span>
                </div>
              </Card>
            ))}
            {suppliers.length === 0 && (
              <div className="col-span-full text-center py-8 text-[var(--color-text-secondary)]">
                Yetkazib beruvchilar topilmadi
              </div>
            )}
          </div>
        )}

        {/* Alerts Tab */}
        {activeTab === 'alerts' && (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <Card
                key={alert.id}
                className={`p-4 ${
                  alert.alertType === 'out_of_stock'
                    ? 'border-rose-500/30'
                    : 'border-amber-500/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      alert.alertType === 'out_of_stock' ? 'bg-rose-500/10' : 'bg-amber-500/10'
                    }`}>
                      <FiAlertTriangle className={alert.alertType === 'out_of_stock' ? 'text-rose-500' : 'text-amber-500'} size={20} />
                    </div>
                    <div>
                      <p className="font-medium text-[var(--color-text)]">{alert.ingredient?.name}</p>
                      <p className="text-sm text-[var(--color-text-secondary)]">{alert.message}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => resolveAlertMutation.mutate(alert.id)}>
                    Hal qilindi
                  </Button>
                </div>
              </Card>
            ))}
            {alerts.length === 0 && (
              <div className="text-center py-8 text-[var(--color-text-secondary)]">
                Faol ogohlantirishlar yo'q
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <Modal
        isOpen={!!showModal}
        onClose={closeModal}
        title={
          showModal === 'addIngredient' ? 'Yangi Ingredient' :
          showModal === 'editIngredient' ? 'Ingredientni Tahrirlash' :
          showModal === 'addStock' ? 'Zaxira Qo\'shish (Kirim)' :
          showModal === 'removeStock' ? 'Zaxiradan Chiqarish' :
          showModal === 'addSupplier' ? 'Yangi Yetkazib Beruvchi' :
          showModal === 'editSupplier' ? 'Yetkazib Beruvchini Tahrirlash' : ''
        }
      >
        <div className="space-y-4">
          {(showModal === 'addIngredient' || showModal === 'editIngredient') && (
            <>
              <Input label="Nomi" value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
              <div className="grid grid-cols-2 gap-4">
                <Input label="SKU" value={formData.sku || ''} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} placeholder="SKU001" />
                <Input label="Barcode" value={formData.barcode || ''} onChange={(e) => setFormData({ ...formData, barcode: e.target.value })} placeholder="4901234567890" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">O'lchov</label>
                  <select value={formData.unit || 'kg'} onChange={(e) => setFormData({ ...formData, unit: e.target.value })} className="w-full px-3 py-2.5 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-text)]">
                    {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">Kategoriya</label>
                  <select value={formData.categoryName || ''} onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })} className="w-full px-3 py-2.5 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-text)]">
                    <option value="">Tanlang</option>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Min zaxira" type="number" step="0.001" value={formData.minStock || ''} onChange={(e) => setFormData({ ...formData, minStock: e.target.value })} />
                <Input label="Narx (so'm)" type="number" value={formData.costPerUnit || ''} onChange={(e) => setFormData({ ...formData, costPerUnit: e.target.value })} />
              </div>
              {showModal === 'addIngredient' && (
                <Input label="Boshlang'ich zaxira" type="number" step="0.001" value={formData.currentStock || ''} onChange={(e) => setFormData({ ...formData, currentStock: e.target.value })} />
              )}
              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">Yetkazib beruvchi</label>
                <select value={formData.supplierId || ''} onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })} className="w-full px-3 py-2.5 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-text)]">
                  <option value="">Tanlang</option>
                  {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </>
          )}

          {(showModal === 'addStock' || showModal === 'removeStock') && selectedItem && (
            <>
              <div className="bg-[var(--color-background)] rounded-lg p-3">
                <p className="font-medium text-[var(--color-text)]">{selectedItem?.name}</p>
                <p className="text-sm text-[var(--color-text-secondary)]">Joriy zaxira: {selectedItem?.currentStock} {selectedItem?.unit}</p>
              </div>
              <Input label={`Miqdor (${selectedItem?.unit})`} type="number" step="0.001" required value={formData.quantity || ''} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} />
              {showModal === 'addStock' && (
                <Input label={`Narx (so'm/${selectedItem?.unit})`} type="number" value={formData.unitCost || selectedItem?.costPerUnit || ''} onChange={(e) => setFormData({ ...formData, unitCost: e.target.value })} />
              )}
              <Input label="Izoh" value={formData.note || ''} onChange={(e) => setFormData({ ...formData, note: e.target.value })} />
            </>
          )}

          {(showModal === 'addSupplier' || showModal === 'editSupplier') && (
            <>
              <Input label="Nomi" value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
              <Input label="Mas'ul shaxs" value={formData.contactPerson || ''} onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })} />
              <Input label="Telefon" value={formData.phone || ''} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
              <Input label="Email" type="email" value={formData.email || ''} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            </>
          )}

          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={closeModal}>Bekor qilish</Button>
            <Button variant="primary" className="flex-1" onClick={handleSubmit}>Saqlash</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Inventory;
