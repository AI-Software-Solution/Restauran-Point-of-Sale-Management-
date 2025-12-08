import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiRefreshCw, FiEye, FiEyeOff, FiFilter } from 'react-icons/fi';
import { getProducts, getCategories, addDish, updateProduct, deleteDish, uploadProductImage, getModifierGroups } from '../../../https';
import ImageUpload from '../../../components/shared/ImageUpload';
import Button, { IconButton } from '../../../components/ui/Button';
import Modal, { ConfirmDialog } from '../../../components/ui/Modal';
import Input, { Textarea } from '../../../components/ui/Input';

const ProductsManagement = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [modifierGroups, setModifierGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, product: null });
  const [filterCategory, setFilterCategory] = useState('all');
  const [showInactive, setShowInactive] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    category: '',
    sortOrder: 0,
    isActive: true,
    modifierGroupIds: []
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [productsData, categoriesData, modifiersData] = await Promise.all([
        getProducts(),
        getCategories(),
        getModifierGroups()
      ]);
      // Handle both { data: [...] } and direct array responses
      setProducts(productsData?.data || productsData || []);
      setCategories(categoriesData?.data || categoriesData || []);
      setModifierGroups(modifiersData?.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description || '',
        price: product.price,
        image: product.image || '',
        category: product.category || product.categoryId,
        sortOrder: product.sortOrder || 0,
        isActive: product.isActive !== false,
        modifierGroupIds: product.modifierGroups?.map(g => g.id) || []
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        image: '',
        category: categories[0]?._id || categories[0]?.id || '',
        sortOrder: 0,
        isActive: true,
        modifierGroupIds: []
      });
    }
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setImageFile(null);
    setFormData({
      name: '', description: '', price: '', image: '', category: '', sortOrder: 0, isActive: true, modifierGroupIds: []
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      let productId;

      if (editingProduct) {
        await updateProduct(editingProduct._id || editingProduct.id, formData);
        productId = editingProduct._id || editingProduct.id;
      } else {
        const result = await addDish(formData);
        productId = result._id || result.id;
      }

      // Upload image if selected
      if (imageFile && productId) {
        await uploadProductImage(productId, imageFile);
      }

      handleCloseModal();
      fetchData();
    } catch (error) {
      console.error('Error saving product:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm.product) return;
    try {
      await deleteDish(deleteConfirm.product._id || deleteConfirm.product.id);
      setDeleteConfirm({ open: false, product: null });
      fetchData();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleToggleActive = async (product) => {
    try {
      await updateProduct(product._id || product.id, {
        isActive: !product.isActive
      });
      fetchData();
    } catch (error) {
      console.error('Error toggling product status:', error);
    }
  };

  const handleModifierToggle = (groupId) => {
    setFormData(prev => {
      const ids = prev.modifierGroupIds.includes(groupId)
        ? prev.modifierGroupIds.filter(id => id !== groupId)
        : [...prev.modifierGroupIds, groupId];
      return { ...prev, modifierGroupIds: ids };
    });
  };

  const filteredProducts = products.filter(p => {
    const categoryMatch = filterCategory === 'all' || p.category?.toString() === filterCategory || p.categoryId?.toString() === filterCategory;
    const activeMatch = showInactive || p.isActive !== false;
    return categoryMatch && activeMatch;
  });

  const getCategoryName = (categoryId) => {
    const cat = categories.find(c => (c._id || c.id)?.toString() === categoryId?.toString());
    return cat?.name || 'Noma\'lum';
  };

  const formatPrice = (price) => {
    return Number(price).toLocaleString('uz-UZ') + ' UZS';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-text-primary">Mahsulotlar Boshqaruvi</h2>
        <div className="flex gap-3">
          <Button
            variant={showInactive ? 'secondary' : 'ghost'}
            icon={showInactive ? FiEye : FiEyeOff}
            onClick={() => setShowInactive(!showInactive)}
          >
            Nofaollar
          </Button>
          <IconButton
            icon={FiRefreshCw}
            variant="secondary"
            onClick={fetchData}
          />
          <Button
            variant="primary"
            icon={FiPlus}
            onClick={() => handleOpenModal()}
          >
            Yangi Mahsulot
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex items-center gap-2">
          <FiFilter className="text-text-secondary" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-surface text-text-primary px-4 py-2 rounded-lg border border-border focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-colors"
          >
            <option value="all">Barcha Kategoriyalar</option>
            {categories.map(cat => (
              <option key={cat._id || cat.id} value={cat._id || cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <span className="text-text-secondary self-center">
          Jami: {filteredProducts.length} ta mahsulot
        </span>
      </div>

      {/* Products Table */}
      <div className="bg-surface rounded-xl overflow-hidden border border-border">
        <table className="w-full">
          <thead>
            <tr className="bg-surface-secondary">
              <th className="text-left text-text-secondary font-medium px-6 py-4">#</th>
              <th className="text-left text-text-secondary font-medium px-6 py-4">Rasm</th>
              <th className="text-left text-text-secondary font-medium px-6 py-4">Nomi</th>
              <th className="text-left text-text-secondary font-medium px-6 py-4">Kategoriya</th>
              <th className="text-left text-text-secondary font-medium px-6 py-4">Narx</th>
              <th className="text-left text-text-secondary font-medium px-6 py-4">Status</th>
              <th className="text-right text-text-secondary font-medium px-6 py-4">Amallar</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product, index) => (
              <tr
                key={product._id || product.id}
                className={`border-t border-border hover:bg-surface-secondary/50 transition-colors ${
                  product.isActive === false ? 'opacity-50' : ''
                }`}
              >
                <td className="px-6 py-4 text-text-secondary">{index + 1}</td>
                <td className="px-6 py-4">
                  <div className="w-12 h-12 bg-surface-secondary rounded-lg overflow-hidden">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-text-muted">🍔</div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <span className="text-text-primary font-medium">{product.name}</span>
                    {product.description && (
                      <p className="text-text-muted text-sm truncate max-w-[200px]">{product.description}</p>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-text-secondary">{getCategoryName(product.category || product.categoryId)}</td>
                <td className="px-6 py-4 text-primary-500 font-medium">{formatPrice(product.price)}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    product.isActive !== false
                      ? 'bg-success/20 text-success'
                      : 'bg-danger/20 text-danger'
                  }`}>
                    {product.isActive !== false ? 'Faol' : 'Nofaol'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <IconButton
                      icon={FiEdit2}
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenModal(product)}
                    />
                    <IconButton
                      icon={product.isActive !== false ? FiEyeOff : FiEye}
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleActive(product)}
                      className={product.isActive !== false ? 'text-warning' : 'text-success'}
                    />
                    <IconButton
                      icon={FiTrash2}
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteConfirm({ open: true, product })}
                      className="hover:text-danger"
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12 text-text-secondary">
            Mahsulotlar topilmadi
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingProduct ? 'Mahsulotni Tahrirlash' : 'Yangi Mahsulot'}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={handleCloseModal} disabled={isSaving}>
              Bekor qilish
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              loading={isSaving}
            >
              {editingProduct ? 'Saqlash' : 'Qo\'shish'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Image Upload */}
              <div className="flex justify-center">
                <ImageUpload
                  currentImage={formData.image}
                  onImageChange={(file) => setImageFile(file)}
                  size="medium"
                />
              </div>

              <Input
                label="Nomi"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />

              <Input
                label="Narx (UZS)"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                min="0"
                required
              />

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">
                  Kategoriya <span className="text-danger">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-surface text-text-primary px-3 py-2 rounded-md border border-border focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-colors"
                  required
                >
                  <option value="">Tanlang</option>
                  {categories.map(cat => (
                    <option key={cat._id || cat.id} value={cat._id || cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <Textarea
                label="Tavsif"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Tartib"
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value, 10) || 0 })}
                  min="0"
                />
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">Status</label>
                  <select
                    value={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                    className="w-full bg-surface text-text-primary px-3 py-2 rounded-md border border-border focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-colors"
                  >
                    <option value="true">Faol</option>
                    <option value="false">Nofaol</option>
                  </select>
                </div>
              </div>

              {/* Modifiers */}
              {modifierGroups.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">Modifikatorlar</label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {modifierGroups.map(group => (
                      <label
                        key={group.id}
                        className="flex items-center gap-2 p-2 bg-surface-secondary rounded-lg cursor-pointer hover:bg-surface-secondary/80 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={formData.modifierGroupIds.includes(group.id)}
                          onChange={() => handleModifierToggle(group.id)}
                          className="w-4 h-4 accent-primary-500"
                        />
                        <span className="text-text-primary">{group.name}</span>
                        <span className="text-text-muted text-sm">
                          ({group.type === 'single' ? 'Yagona' : 'Ko\'p'})
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm Modal */}
      <ConfirmDialog
        isOpen={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, product: null })}
        onConfirm={handleDelete}
        title="Mahsulotni o'chirish"
        message={`"${deleteConfirm.product?.name}" mahsulotini o'chirishni xohlaysizmi?`}
        confirmText="O'chirish"
        variant="danger"
      />
    </div>
  );
};

export default ProductsManagement;
