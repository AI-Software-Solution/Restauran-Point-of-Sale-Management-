import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiMap, FiRefreshCw } from 'react-icons/fi';
import { getTables, addTable, updateTable, deleteTable, getFloors } from '../../../https';
import Button, { IconButton } from '../../../components/ui/Button';
import Modal, { ConfirmDialog } from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';

const TablesManagement = ({ onFloorPlanClick }) => {
  const [tables, setTables] = useState([]);
  const [floors, setFloors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, table: null });
  const [filterFloor, setFilterFloor] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const [formData, setFormData] = useState({
    tableNo: '',
    seats: 4,
    status: 'Available',
    floorId: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [tablesData, floorsData] = await Promise.all([
        getTables(),
        getFloors()
      ]);
      // Handle both { data: [...] } and direct array responses
      setTables(tablesData?.data || tablesData || []);
      setFloors(floorsData?.data || floorsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (table = null) => {
    if (table) {
      setEditingTable(table);
      setFormData({
        tableNo: table.tableNo,
        seats: table.seats,
        status: table.status,
        floorId: table.floorId || ''
      });
    } else {
      setEditingTable(null);
      setFormData({
        tableNo: '',
        seats: 4,
        status: 'Available',
        floorId: floors[0]?.id || ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTable(null);
    setFormData({ tableNo: '', seats: 4, status: 'Available', floorId: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTable) {
        await updateTable({
          tableId: editingTable._id || editingTable.id,
          ...formData
        });
      } else {
        // Backend expects tableNo and seats
        await addTable({
          tableNo: formData.tableNo,
          seats: formData.seats
        });
      }
      handleCloseModal();
      fetchData();
    } catch (error) {
      console.error('Error saving table:', error);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm.table) return;
    try {
      await deleteTable(deleteConfirm.table._id || deleteConfirm.table.id);
      setDeleteConfirm({ open: false, table: null });
      fetchData();
    } catch (error) {
      console.error('Error deleting table:', error);
    }
  };

  const filteredTables = tables.filter(table => {
    const floorMatch = filterFloor === 'all' || table.floorId?.toString() === filterFloor;
    const statusMatch = filterStatus === 'all' || table.status === filterStatus;
    return floorMatch && statusMatch;
  });

  const getStatusColor = (status) => {
    const colors = {
      'Available': 'bg-success/20 text-success',
      'Booked': 'bg-warning/20 text-warning',
      'Occupied': 'bg-danger/20 text-danger',
      'Reserved': 'bg-info/20 text-info'
    };
    return colors[status] || 'bg-surface-secondary text-text-secondary';
  };

  const getFloorName = (floorId) => {
    const floor = floors.find(f => f.id === floorId);
    return floor?.name || 'Belgilanmagan';
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
        <h2 className="text-2xl font-bold text-text-primary">Stollar Boshqaruvi</h2>
        <div className="flex gap-3">
          <IconButton
            icon={FiRefreshCw}
            variant="secondary"
            onClick={fetchData}
          />
          {onFloorPlanClick && (
            <Button
              variant="secondary"
              icon={FiMap}
              onClick={onFloorPlanClick}
            >
              Floor Plan
            </Button>
          )}
          <Button
            variant="primary"
            icon={FiPlus}
            onClick={() => handleOpenModal()}
          >
            Yangi Stol
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <select
          value={filterFloor}
          onChange={(e) => setFilterFloor(e.target.value)}
          className="bg-surface text-text-primary px-4 py-2 rounded-lg border border-border focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-colors"
        >
          <option value="all">Barcha Floorlar</option>
          {floors.map(floor => (
            <option key={floor.id} value={floor.id}>{floor.name}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-surface text-text-primary px-4 py-2 rounded-lg border border-border focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-colors"
        >
          <option value="all">Barcha Statuslar</option>
          <option value="Available">Available</option>
          <option value="Booked">Booked</option>
          <option value="Occupied">Occupied</option>
          <option value="Reserved">Reserved</option>
        </select>
        <span className="text-text-secondary self-center">
          Jami: {filteredTables.length} ta stol
        </span>
      </div>

      {/* Table */}
      <div className="bg-surface rounded-xl overflow-hidden border border-border">
        <table className="w-full">
          <thead>
            <tr className="bg-surface-secondary">
              <th className="text-left text-text-secondary font-medium px-6 py-4">#</th>
              <th className="text-left text-text-secondary font-medium px-6 py-4">Stol</th>
              <th className="text-left text-text-secondary font-medium px-6 py-4">O'rindiqlar</th>
              <th className="text-left text-text-secondary font-medium px-6 py-4">Floor</th>
              <th className="text-left text-text-secondary font-medium px-6 py-4">Status</th>
              <th className="text-right text-text-secondary font-medium px-6 py-4">Amallar</th>
            </tr>
          </thead>
          <tbody>
            {filteredTables.map((table, index) => (
              <tr key={table._id || table.id} className="border-t border-border hover:bg-surface-secondary/50 transition-colors">
                <td className="px-6 py-4 text-text-secondary">{index + 1}</td>
                <td className="px-6 py-4 text-text-primary font-medium">Stol {table.tableNo}</td>
                <td className="px-6 py-4 text-text-secondary">{table.seats}</td>
                <td className="px-6 py-4 text-text-secondary">{getFloorName(table.floorId)}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(table.status)}`}>
                    {table.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <IconButton
                      icon={FiEdit2}
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenModal(table)}
                    />
                    <IconButton
                      icon={FiTrash2}
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteConfirm({ open: true, table })}
                      className="hover:text-danger"
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredTables.length === 0 && (
          <div className="text-center py-12 text-text-secondary">
            Stollar topilmadi
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingTable ? 'Stolni Tahrirlash' : 'Yangi Stol Qo\'shish'}
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={handleCloseModal}>
              Bekor qilish
            </Button>
            <Button variant="primary" onClick={handleSubmit}>
              {editingTable ? 'Saqlash' : 'Qo\'shish'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Input
              label="Stol Raqami"
              type="number"
              value={formData.tableNo}
              onChange={(e) => setFormData({ ...formData, tableNo: e.target.value })}
              required
            />
            <Input
              label="O'rindiqlar Soni"
              type="number"
              value={formData.seats}
              onChange={(e) => setFormData({ ...formData, seats: parseInt(e.target.value) })}
              min="1"
              required
            />
            {editingTable && (
              <>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">Floor</label>
                  <select
                    value={formData.floorId}
                    onChange={(e) => setFormData({ ...formData, floorId: e.target.value })}
                    className="w-full bg-surface text-text-primary px-3 py-2 rounded-md border border-border focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-colors"
                  >
                    <option value="">Tanlanmagan</option>
                    {floors.map(floor => (
                      <option key={floor.id} value={floor.id}>{floor.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-surface text-text-primary px-3 py-2 rounded-md border border-border focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-colors"
                  >
                    <option value="Available">Available</option>
                    <option value="Booked">Booked</option>
                    <option value="Occupied">Occupied</option>
                    <option value="Reserved">Reserved</option>
                  </select>
                </div>
              </>
            )}
          </div>
        </form>
      </Modal>

      {/* Delete Confirm Modal */}
      <ConfirmDialog
        isOpen={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, table: null })}
        onConfirm={handleDelete}
        title="Stolni o'chirish"
        message={`Stol ${deleteConfirm.table?.tableNo} ni o'chirishni xohlaysizmi?`}
        confirmText="O'chirish"
        variant="danger"
      />
    </div>
  );
};

export default TablesManagement;
