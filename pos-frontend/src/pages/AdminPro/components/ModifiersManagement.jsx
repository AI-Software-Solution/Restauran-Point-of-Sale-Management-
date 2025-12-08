import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiRefreshCw, FiChevronDown, FiChevronRight } from 'react-icons/fi';
import {
  getModifierGroups,
  createModifierGroup,
  updateModifierGroup,
  deleteModifierGroup,
  createModifier,
  updateModifier,
  deleteModifier
} from '../../../https';
import Button, { IconButton } from '../../../components/ui/Button';
import Modal, { ConfirmDialog } from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';

const ModifiersManagement = () => {
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, type: null, item: null });
  const [isSaving, setIsSaving] = useState(false);

  const [groupForm, setGroupForm] = useState({
    name: '',
    type: 'single',
    required: false,
    minSelect: 0,
    maxSelect: 10,
    sortOrder: 0
  });

  const [itemForm, setItemForm] = useState({
    name: '',
    price: 0,
    isDefault: false,
    sortOrder: 0
  });

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    setIsLoading(true);
    try {
      const response = await getModifierGroups();
      setGroups(response?.data || []);
    } catch (error) {
      console.error('Error fetching modifier groups:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleGroup = (groupId) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  // Group Modal
  const handleOpenGroupModal = (group = null) => {
    if (group) {
      setEditingGroup(group);
      setGroupForm({
        name: group.name,
        type: group.type,
        required: group.required,
        minSelect: group.minSelect,
        maxSelect: group.maxSelect,
        sortOrder: group.sortOrder || 0
      });
    } else {
      setEditingGroup(null);
      setGroupForm({
        name: '',
        type: 'single',
        required: false,
        minSelect: 0,
        maxSelect: 10,
        sortOrder: groups.length
      });
    }
    setIsGroupModalOpen(true);
  };

  const handleCloseGroupModal = () => {
    setIsGroupModalOpen(false);
    setEditingGroup(null);
    setGroupForm({ name: '', type: 'single', required: false, minSelect: 0, maxSelect: 10, sortOrder: 0 });
  };

  const handleSubmitGroup = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingGroup) {
        await updateModifierGroup(editingGroup.id, groupForm);
      } else {
        await createModifierGroup(groupForm);
      }
      handleCloseGroupModal();
      fetchGroups();
    } catch (error) {
      console.error('Error saving modifier group:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Item Modal
  const handleOpenItemModal = (groupId, item = null) => {
    setSelectedGroupId(groupId);
    if (item) {
      setEditingItem(item);
      setItemForm({
        name: item.name,
        price: item.price,
        isDefault: item.isDefault,
        sortOrder: item.sortOrder || 0
      });
    } else {
      setEditingItem(null);
      const group = groups.find(g => g.id === groupId);
      setItemForm({
        name: '',
        price: 0,
        isDefault: false,
        sortOrder: group?.modifiers?.length || 0
      });
    }
    setIsItemModalOpen(true);
  };

  const handleCloseItemModal = () => {
    setIsItemModalOpen(false);
    setEditingItem(null);
    setSelectedGroupId(null);
    setItemForm({ name: '', price: 0, isDefault: false, sortOrder: 0 });
  };

  const handleSubmitItem = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingItem) {
        await updateModifier(editingItem.id, itemForm);
      } else {
        await createModifier({ ...itemForm, groupId: selectedGroupId });
      }
      handleCloseItemModal();
      fetchGroups();
    } catch (error) {
      console.error('Error saving modifier:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Delete handlers
  const handleDelete = async () => {
    if (!deleteConfirm.item) return;
    try {
      if (deleteConfirm.type === 'group') {
        await deleteModifierGroup(deleteConfirm.item.id);
      } else {
        await deleteModifier(deleteConfirm.item.id);
      }
      setDeleteConfirm({ open: false, type: null, item: null });
      fetchGroups();
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  const formatPrice = (price) => {
    if (!price || price === 0) return 'Bepul';
    return '+' + Number(price).toLocaleString('uz-UZ') + ' UZS';
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
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Modifikatorlar Boshqaruvi</h2>
          <p className="text-text-secondary mt-1">Mahsulot variantlari (O'lcham, Qo'shimchalar, Soslar)</p>
        </div>
        <div className="flex gap-3">
          <IconButton
            icon={FiRefreshCw}
            variant="secondary"
            onClick={fetchGroups}
          />
          <Button
            variant="primary"
            icon={FiPlus}
            onClick={() => handleOpenGroupModal()}
          >
            Yangi Guruh
          </Button>
        </div>
      </div>

      {/* Groups List */}
      <div className="space-y-4">
        {groups.map((group) => (
          <div key={group.id} className="bg-surface rounded-xl border border-border overflow-hidden">
            {/* Group Header */}
            <div
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-surface-secondary/50 transition-colors"
              onClick={() => toggleGroup(group.id)}
            >
              <div className="flex items-center gap-3">
                {expandedGroups[group.id] ? (
                  <FiChevronDown className="text-text-secondary" size={20} />
                ) : (
                  <FiChevronRight className="text-text-secondary" size={20} />
                )}
                <div>
                  <h3 className="text-text-primary font-semibold">{group.name}</h3>
                  <div className="flex gap-3 text-sm text-text-secondary">
                    <span className={`px-2 py-0.5 rounded ${
                      group.type === 'single' ? 'bg-info/20 text-info' : 'bg-primary-500/20 text-primary-500'
                    }`}>
                      {group.type === 'single' ? 'Yagona tanlash' : 'Ko\'p tanlash'}
                    </span>
                    {group.required && (
                      <span className="px-2 py-0.5 rounded bg-danger/20 text-danger">Majburiy</span>
                    )}
                    <span>{group.modifiers?.length || 0} ta variant</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <IconButton
                  icon={FiPlus}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleOpenItemModal(group.id)}
                  className="text-success hover:bg-success/20"
                />
                <IconButton
                  icon={FiEdit2}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleOpenGroupModal(group)}
                />
                <IconButton
                  icon={FiTrash2}
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeleteConfirm({ open: true, type: 'group', item: group })}
                  className="hover:text-danger"
                />
              </div>
            </div>

            {/* Modifiers List */}
            {expandedGroups[group.id] && (
              <div className="border-t border-border">
                {group.modifiers?.length > 0 ? (
                  <div className="divide-y divide-border">
                    {group.modifiers.map((modifier) => (
                      <div
                        key={modifier.id}
                        className="flex items-center justify-between px-6 py-3 pl-12 hover:bg-surface-secondary/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <span className="text-text-primary">{modifier.name}</span>
                          <span className={`text-sm ${modifier.price > 0 ? 'text-primary-500' : 'text-text-muted'}`}>
                            {formatPrice(modifier.price)}
                          </span>
                          {modifier.isDefault && (
                            <span className="px-2 py-0.5 text-xs rounded bg-success/20 text-success">
                              Default
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <IconButton
                            icon={FiEdit2}
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenItemModal(group.id, modifier)}
                          />
                          <IconButton
                            icon={FiTrash2}
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteConfirm({ open: true, type: 'item', item: modifier })}
                            className="hover:text-danger"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-text-muted">
                    Hali variant qo'shilmagan.
                    <button
                      onClick={() => handleOpenItemModal(group.id)}
                      className="text-primary-500 hover:underline ml-2"
                    >
                      Variant qo'shish
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {groups.length === 0 && (
        <div className="text-center py-12 text-text-secondary bg-surface rounded-xl border border-border">
          Modifikator guruhlari topilmadi.
          <button
            onClick={() => handleOpenGroupModal()}
            className="text-primary-500 hover:underline ml-2"
          >
            Birinchi guruhni yarating
          </button>
        </div>
      )}

      {/* Group Modal */}
      <Modal
        isOpen={isGroupModalOpen}
        onClose={handleCloseGroupModal}
        title={editingGroup ? 'Guruhni Tahrirlash' : 'Yangi Modifikator Guruhi'}
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={handleCloseGroupModal} disabled={isSaving}>
              Bekor qilish
            </Button>
            <Button variant="primary" onClick={handleSubmitGroup} loading={isSaving}>
              {editingGroup ? 'Saqlash' : 'Yaratish'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmitGroup}>
          <div className="space-y-4">
            <Input
              label="Nomi"
              value={groupForm.name}
              onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
              placeholder="Masalan: O'lcham, Qo'shimchalar"
              required
            />

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Tanlash turi</label>
              <select
                value={groupForm.type}
                onChange={(e) => setGroupForm({ ...groupForm, type: e.target.value })}
                className="w-full bg-surface text-text-primary px-3 py-2 rounded-md border border-border focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-colors"
              >
                <option value="single">Yagona tanlash (faqat 1 ta)</option>
                <option value="multiple">Ko'p tanlash (bir nechta)</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="required"
                checked={groupForm.required}
                onChange={(e) => setGroupForm({ ...groupForm, required: e.target.checked })}
                className="w-4 h-4 accent-primary-500"
              />
              <label htmlFor="required" className="text-text-secondary">Majburiy tanlash</label>
            </div>

            {groupForm.type === 'multiple' && (
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Min tanlash"
                  type="number"
                  value={groupForm.minSelect}
                  onChange={(e) => setGroupForm({ ...groupForm, minSelect: parseInt(e.target.value) || 0 })}
                  min="0"
                />
                <Input
                  label="Max tanlash"
                  type="number"
                  value={groupForm.maxSelect}
                  onChange={(e) => setGroupForm({ ...groupForm, maxSelect: parseInt(e.target.value) || 10 })}
                  min="1"
                />
              </div>
            )}
          </div>
        </form>
      </Modal>

      {/* Item Modal */}
      <Modal
        isOpen={isItemModalOpen}
        onClose={handleCloseItemModal}
        title={editingItem ? 'Variantni Tahrirlash' : 'Yangi Variant'}
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={handleCloseItemModal} disabled={isSaving}>
              Bekor qilish
            </Button>
            <Button variant="primary" onClick={handleSubmitItem} loading={isSaving}>
              {editingItem ? 'Saqlash' : 'Qo\'shish'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmitItem}>
          <div className="space-y-4">
            <Input
              label="Nomi"
              value={itemForm.name}
              onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
              placeholder="Masalan: Kichik, O'rta, Katta"
              required
            />

            <Input
              label="Qo'shimcha narx (UZS)"
              type="number"
              value={itemForm.price}
              onChange={(e) => setItemForm({ ...itemForm, price: parseInt(e.target.value) || 0 })}
              placeholder="0 = bepul"
              min="0"
            />

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isDefault"
                checked={itemForm.isDefault}
                onChange={(e) => setItemForm({ ...itemForm, isDefault: e.target.checked })}
                className="w-4 h-4 accent-primary-500"
              />
              <label htmlFor="isDefault" className="text-text-secondary">Default tanlangan</label>
            </div>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm Modal */}
      <ConfirmDialog
        isOpen={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, type: null, item: null })}
        onConfirm={handleDelete}
        title={deleteConfirm.type === 'group' ? "Guruhni o'chirish" : "Variantni o'chirish"}
        message={
          deleteConfirm.type === 'group'
            ? `"${deleteConfirm.item?.name}" guruhi va undagi barcha variantlar o'chiriladi!`
            : `"${deleteConfirm.item?.name}" varianti o'chiriladi.`
        }
        confirmText="O'chirish"
        variant="danger"
      />
    </div>
  );
};

export default ModifiersManagement;
