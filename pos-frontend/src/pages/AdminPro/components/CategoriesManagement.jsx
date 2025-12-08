import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiRefreshCw, FiEye, FiEyeOff } from 'react-icons/fi';
import { getCategories, addCategory, updateCategory, deleteCategory, uploadCategoryImage } from '../../../https';
import ImageUpload from '../../../components/shared/ImageUpload';
import Button, { IconButton } from '../../../components/ui/Button';
import Modal, { ConfirmDialog } from '../../../components/ui/Modal';
import Input, { Textarea } from '../../../components/ui/Input';

const CategoriesManagement = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, category: null });
  const [showInactive, setShowInactive] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    sortOrder: 0,
    isActive: true
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const data = await getCategories();
      setCategories(data?.data || data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description || '',
        image: category.image || '',
        sortOrder: category.sortOrder || 0,
        isActive: category.isActive !== false
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        description: '',
        image: '',
        sortOrder: categories.length,
        isActive: true
      });
    }
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setImageFile(null);
    setFormData({ name: '', description: '', image: '', sortOrder: 0, isActive: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      let categoryId;

      if (editingCategory) {
        await updateCategory(editingCategory._id || editingCategory.id, formData);
        categoryId = editingCategory._id || editingCategory.id;
      } else {
        const result = await addCategory(formData);
        categoryId = result._id || result.id;
      }

      if (imageFile && categoryId) {
        await uploadCategoryImage(categoryId, imageFile);
      }

      handleCloseModal();
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm.category) return;
    try {
      await deleteCategory(deleteConfirm.category._id || deleteConfirm.category.id);
      setDeleteConfirm({ open: false, category: null });
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const handleToggleActive = async (category) => {
    try {
      await updateCategory(category._id || category.id, {
        isActive: !category.isActive
      });
      fetchCategories();
    } catch (error) {
      console.error('Error toggling category status:', error);
    }
  };

  const filteredCategories = showInactive
    ? categories
    : categories.filter(c => c.isActive !== false);

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
        <h2 className="text-2xl font-bold text-text-primary">Kategoriyalar Boshqaruvi</h2>
        <div className="flex gap-3">
          <Button
            variant={showInactive ? 'secondary' : 'ghost'}
            icon={showInactive ? FiEye : FiEyeOff}
            onClick={() => setShowInactive(!showInactive)}
          >
            Nofaollar
          </Button>
          <Button
            variant="secondary"
            icon={FiRefreshCw}
            onClick={fetchCategories}
          >
            Yangilash
          </Button>
          <Button
            variant="primary"
            icon={FiPlus}
            onClick={() => handleOpenModal()}
          >
            Yangi Kategoriya
          </Button>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredCategories.map((category) => (
          <div
            key={category._id || category.id}
            className={`bg-surface rounded-xl p-4 border ${
              category.isActive !== false ? 'border-border' : 'border-danger/50 opacity-60'
            }`}
          >
            {/* Image */}
            <div className="w-full h-32 bg-surface-secondary rounded-lg mb-4 overflow-hidden">
              {category.image ? (
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-text-muted text-4xl">
                  📁
                </div>
              )}
            </div>

            {/* Info */}
            <h3 className="text-text-primary font-semibold text-lg mb-1">{category.name}</h3>
            {category.description && (
              <p className="text-text-secondary text-sm mb-3 line-clamp-2">{category.description}</p>
            )}

            {/* Meta */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-muted">Tartib: {category.sortOrder || 0}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                category.isActive !== false
                  ? 'bg-success/20 text-success'
                  : 'bg-danger/20 text-danger'
              }`}>
                {category.isActive !== false ? 'Faol' : 'Nofaol'}
              </span>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-4 pt-4 border-t border-border">
              <Button
                variant="secondary"
                size="sm"
                icon={FiEdit2}
                onClick={() => handleOpenModal(category)}
                className="flex-1"
              >
                Tahrirlash
              </Button>
              <IconButton
                icon={category.isActive !== false ? FiEyeOff : FiEye}
                variant="ghost"
                size="sm"
                onClick={() => handleToggleActive(category)}
                className={category.isActive !== false ? 'text-warning' : 'text-success'}
              />
              <IconButton
                icon={FiTrash2}
                variant="ghost"
                size="sm"
                onClick={() => setDeleteConfirm({ open: true, category })}
                className="text-danger"
              />
            </div>
          </div>
        ))}
      </div>

      {filteredCategories.length === 0 && (
        <div className="text-center py-12 text-text-secondary">
          Kategoriyalar topilmadi
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingCategory ? 'Kategoriyani Tahrirlash' : 'Yangi Kategoriya'}
        size="md"
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
              {editingCategory ? 'Saqlash' : 'Qo\'shish'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
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
          </div>
        </form>
      </Modal>

      {/* Delete Confirm Modal */}
      <ConfirmDialog
        isOpen={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, category: null })}
        onConfirm={handleDelete}
        title="Kategoriyani o'chirish"
        message={`"${deleteConfirm.category?.name}" kategoriyasini o'chirishni xohlaysizmi? Bu kategoriyaga tegishli barcha mahsulotlar ham o'chiriladi!`}
        confirmText="O'chirish"
        variant="danger"
      />
    </div>
  );
};

export default CategoriesManagement;
