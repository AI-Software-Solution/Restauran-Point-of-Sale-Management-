import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { keepPreviousData, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import {
  HiOutlineSearch,
  HiOutlinePlus,
  HiOutlineViewGrid,
  HiOutlineViewList,
  HiOutlineRefresh,
  HiOutlineUsers,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
} from "react-icons/hi";
import { MdTableBar, MdTakeoutDining, MdRestaurantMenu } from "react-icons/md";
import { Button, Card, Badge, Modal, Input, TableStatusBadge } from "../components/ui";
import { getTables, addTable, updateTable, deleteTable } from "../https/index";
import { setCustomer } from "../redux/slices/customerSlice";

const Tables = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  // Local state
  const [viewMode, setViewMode] = useState("grid"); // grid | list
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [newTable, setNewTable] = useState({ tableNo: "", seats: 4 });

  useEffect(() => {
    document.title = "POS | Stollar";
  }, []);

  // Fetch tables
  const { data: resData, isLoading, isError, refetch } = useQuery({
    queryKey: ["tables"],
    queryFn: getTables,
    placeholderData: keepPreviousData,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const tables = resData?.tables || resData || [];

  // Filter tables
  const filteredTables = useMemo(() => {
    let result = tables;

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter(table =>
        table.status?.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(table =>
        table.tableNo?.toString().includes(query) ||
        table.currentOrder?.customerDetails?.name?.toLowerCase().includes(query)
      );
    }

    return result;
  }, [tables, statusFilter, searchQuery]);

  // Stats
  const stats = useMemo(() => {
    const total = tables.length;
    const available = tables.filter(t => t.status?.toLowerCase() === "available").length;
    const booked = tables.filter(t => t.status?.toLowerCase() === "booked").length;
    const reserved = tables.filter(t => t.status?.toLowerCase() === "reserved").length;
    return { total, available, booked, reserved };
  }, [tables]);

  // Add table mutation
  const addMutation = useMutation({
    mutationFn: addTable,
    onSuccess: () => {
      queryClient.invalidateQueries(["tables"]);
      setShowAddModal(false);
      setNewTable({ tableNo: "", seats: 4 });
      enqueueSnackbar("Stol muvaffaqiyatli qo'shildi", { variant: "success" });
    },
    onError: () => {
      enqueueSnackbar("Stol qo'shishda xatolik", { variant: "error" });
    },
  });

  // Update table mutation
  const updateMutation = useMutation({
    mutationFn: ({ tableId, ...data }) => updateTable({ tableId, ...data }),
    onSuccess: () => {
      queryClient.invalidateQueries(["tables"]);
      setShowEditModal(false);
      setSelectedTable(null);
      enqueueSnackbar("Stol muvaffaqiyatli yangilandi", { variant: "success" });
    },
    onError: () => {
      enqueueSnackbar("Stol yangilashda xatolik", { variant: "error" });
    },
  });

  // Delete table mutation
  const deleteMutation = useMutation({
    mutationFn: deleteTable,
    onSuccess: () => {
      queryClient.invalidateQueries(["tables"]);
      setShowDeleteModal(false);
      setSelectedTable(null);
      enqueueSnackbar("Stol o'chirildi", { variant: "success" });
    },
    onError: () => {
      enqueueSnackbar("Stol o'chirishda xatolik", { variant: "error" });
    },
  });

  // Handle table click
  const handleTableClick = (table) => {
    if (table.status?.toLowerCase() === "available") {
      // Set customer data and navigate to menu
      dispatch(setCustomer({
        table: { tableId: table.id || table._id, tableNo: table.tableNo },
        orderType: "dine-in",
        guests: 1,
      }));
      navigate(`/menu?table=${table.id || table._id}`);
    } else if (table.status?.toLowerCase() === "booked" && table.currentOrder) {
      // View existing order
      navigate(`/orders?order=${table.currentOrder._id || table.currentOrder.id}`);
    }
  };

  // Handle takeaway
  const handleTakeaway = () => {
    dispatch(setCustomer({
      table: null,
      orderType: "takeaway",
      guests: 1,
    }));
    navigate("/menu");
  };

  // Add table handler
  const handleAddTable = () => {
    if (!newTable.tableNo) {
      enqueueSnackbar("Stol raqamini kiriting", { variant: "warning" });
      return;
    }
    addMutation.mutate(newTable);
  };

  // Edit table handler
  const handleEditTable = () => {
    if (selectedTable) {
      updateMutation.mutate({
        tableId: selectedTable.id || selectedTable._id,
        tableNo: selectedTable.tableNo,
        seats: selectedTable.seats
      });
    }
  };

  // Delete table handler
  const handleDeleteTable = () => {
    if (selectedTable) {
      deleteMutation.mutate(selectedTable.id || selectedTable._id);
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "available":
        return "bg-success/10 border-success text-success";
      case "booked":
        return "bg-danger/10 border-danger text-danger";
      case "reserved":
        return "bg-warning/10 border-warning text-warning";
      default:
        return "bg-surface-secondary border-border text-text-secondary";
    }
  };

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col bg-background">
      {/* Header */}
      <div className="bg-surface border-b border-border px-4 py-3">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Title & Stats */}
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-xl font-semibold text-text-primary">Stollar</h1>
              <p className="text-sm text-text-secondary">
                {stats.available} ta bo'sh / {stats.total} ta stol
              </p>
            </div>

            {/* Quick Stats */}
            <div className="hidden md:flex items-center gap-2">
              <Badge variant="success" className="gap-1">
                <span className="w-2 h-2 rounded-full bg-success" />
                {stats.available} Bo'sh
              </Badge>
              <Badge variant="danger" className="gap-1">
                <span className="w-2 h-2 rounded-full bg-danger" />
                {stats.booked} Band
              </Badge>
              {stats.reserved > 0 && (
                <Badge variant="warning" className="gap-1">
                  <span className="w-2 h-2 rounded-full bg-warning" />
                  {stats.reserved} Bron
                </Badge>
              )}
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
                className="pl-9 pr-3 py-2 w-48 bg-surface-secondary border-0 rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Takeaway Button */}
            <Button
              variant="warning"
              size="sm"
              icon={<MdTakeoutDining className="w-4 h-4" />}
              onClick={handleTakeaway}
            >
              <span className="hidden sm:inline">Olib ketish</span>
            </Button>

            {/* Add Table */}
            <Button
              variant="primary"
              size="sm"
              icon={<HiOutlinePlus className="w-4 h-4" />}
              onClick={() => setShowAddModal(true)}
            >
              <span className="hidden sm:inline">Stol qo'shish</span>
            </Button>

            {/* Refresh */}
            <Button
              variant="ghost"
              size="sm"
              icon={<HiOutlineRefresh className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />}
              onClick={() => refetch()}
            />

            {/* View Mode Toggle */}
            <div className="flex items-center bg-surface-secondary rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded ${viewMode === "grid" ? 'bg-surface text-text-primary shadow-sm' : 'text-text-secondary'}`}
              >
                <HiOutlineViewGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded ${viewMode === "list" ? 'bg-surface text-text-primary shadow-sm' : 'text-text-secondary'}`}
              >
                <HiOutlineViewList className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mt-3 overflow-x-auto">
          {[
            { key: "all", label: "Hammasi" },
            { key: "available", label: "Bo'sh" },
            { key: "booked", label: "Band" },
            { key: "reserved", label: "Bron" },
          ].map((filter) => (
            <button
              key={filter.key}
              onClick={() => setStatusFilter(filter.key)}
              className={`
                px-4 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors
                ${statusFilter === filter.key
                  ? 'bg-primary text-white'
                  : 'bg-surface-secondary text-text-secondary hover:text-text-primary'
                }
              `}
            >
              {filter.label}
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
        ) : filteredTables.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <MdTableBar className="w-16 h-16 mx-auto mb-4 text-text-muted opacity-50" />
              <p className="text-text-primary font-medium">Stollar topilmadi</p>
              <p className="text-text-secondary text-sm">
                {statusFilter !== "all" ? "Bu filtr bo'yicha stol yo'q" : "Yangi stol qo'shing"}
              </p>
            </div>
          </div>
        ) : viewMode === "grid" ? (
          /* Grid View */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {filteredTables.map((table) => {
              const tableId = table.id || table._id;
              const status = table.status?.toLowerCase() || "available";
              const isAvailable = status === "available";
              const isBooked = status === "booked";

              return (
                <div
                  key={tableId}
                  onClick={() => handleTableClick(table)}
                  className={`
                    relative bg-surface border-2 rounded-xl p-4 cursor-pointer
                    transition-all duration-200 hover:shadow-lg group
                    ${getStatusColor(table.status)}
                  `}
                >
                  {/* Table Icon */}
                  <div className="flex justify-center mb-3">
                    <div className={`
                      w-16 h-16 rounded-lg flex items-center justify-center
                      ${isAvailable ? 'bg-success/20' : isBooked ? 'bg-danger/20' : 'bg-warning/20'}
                    `}>
                      <MdTableBar className={`
                        w-8 h-8
                        ${isAvailable ? 'text-success' : isBooked ? 'text-danger' : 'text-warning'}
                      `} />
                    </div>
                  </div>

                  {/* Table Info */}
                  <div className="text-center">
                    <h3 className="font-semibold text-text-primary">
                      Stol {table.tableNo}
                    </h3>
                    <div className="flex items-center justify-center gap-1 mt-1 text-text-secondary text-sm">
                      <HiOutlineUsers className="w-4 h-4" />
                      <span>{table.seats} o'rin</span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="absolute top-2 right-2">
                    <TableStatusBadge status={table.status} />
                  </div>

                  {/* Customer Info (if booked) */}
                  {isBooked && table.currentOrder?.customerDetails && (
                    <div className="mt-3 pt-3 border-t border-border/50 text-center">
                      <p className="text-xs text-text-secondary truncate">
                        {table.currentOrder.customerDetails.name || "Mehmon"}
                      </p>
                    </div>
                  )}

                  {/* Hover Actions */}
                  <div className="absolute inset-0 bg-black/60 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    {isAvailable && (
                      <Button size="sm" variant="success">
                        <MdRestaurantMenu className="w-4 h-4 mr-1" />
                        Tanlash
                      </Button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTable(table);
                        setShowEditModal(true);
                      }}
                      className="p-2 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-colors"
                    >
                      <HiOutlinePencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTable(table);
                        setShowDeleteModal(true);
                      }}
                      className="p-2 rounded-lg bg-white/20 text-white hover:bg-danger transition-colors"
                    >
                      <HiOutlineTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* List View */
          <div className="bg-surface rounded-lg border border-border overflow-hidden">
            <table className="w-full">
              <thead className="bg-surface-secondary">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-text-secondary">Stol</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-text-secondary">O'rinlar</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-text-secondary">Holat</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-text-secondary">Mijoz</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-text-secondary">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredTables.map((table) => {
                  const tableId = table.id || table._id;
                  return (
                    <tr
                      key={tableId}
                      onClick={() => handleTableClick(table)}
                      className="hover:bg-surface-secondary/50 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <MdTableBar className="w-6 h-6 text-primary" />
                          <span className="font-medium text-text-primary">Stol {table.tableNo}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-text-secondary">
                          <HiOutlineUsers className="w-4 h-4" />
                          <span>{table.seats}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <TableStatusBadge status={table.status} />
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-text-secondary text-sm">
                          {table.currentOrder?.customerDetails?.name || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTable(table);
                              setShowEditModal(true);
                            }}
                            className="p-1.5 rounded text-text-secondary hover:text-primary hover:bg-primary/10 transition-colors"
                          >
                            <HiOutlinePencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTable(table);
                              setShowDeleteModal(true);
                            }}
                            className="p-1.5 rounded text-text-secondary hover:text-danger hover:bg-danger/10 transition-colors"
                          >
                            <HiOutlineTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Table Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Yangi stol qo'shish"
        size="sm"
      >
        <div className="space-y-4">
          <Input
            label="Stol raqami"
            type="number"
            value={newTable.tableNo}
            onChange={(e) => setNewTable({ ...newTable, tableNo: e.target.value })}
            placeholder="1"
          />
          <Input
            label="O'rinlar soni"
            type="number"
            min="1"
            max="20"
            value={newTable.seats}
            onChange={(e) => setNewTable({ ...newTable, seats: parseInt(e.target.value, 10) || 4 })}
          />
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowAddModal(false)} fullWidth>
              Bekor qilish
            </Button>
            <Button
              variant="primary"
              onClick={handleAddTable}
              disabled={addMutation.isPending}
              fullWidth
            >
              {addMutation.isPending ? "Qo'shilmoqda..." : "Qo'shish"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Table Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title={`Stol ${selectedTable?.tableNo} ni tahrirlash`}
        size="sm"
      >
        <div className="space-y-4">
          <Input
            label="Stol raqami"
            type="number"
            value={selectedTable?.tableNo || ""}
            onChange={(e) => setSelectedTable({ ...selectedTable, tableNo: e.target.value })}
          />
          <Input
            label="O'rinlar soni"
            type="number"
            min="1"
            max="20"
            value={selectedTable?.seats || 4}
            onChange={(e) => setSelectedTable({ ...selectedTable, seats: parseInt(e.target.value, 10) || 4 })}
          />
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowEditModal(false)} fullWidth>
              Bekor qilish
            </Button>
            <Button
              variant="primary"
              onClick={handleEditTable}
              disabled={updateMutation.isPending}
              fullWidth
            >
              {updateMutation.isPending ? "Saqlanmoqda..." : "Saqlash"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Stolni o'chirish"
        size="sm"
      >
        <div className="space-y-4">
          <div className="text-center py-4">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-danger/10 flex items-center justify-center">
              <HiOutlineTrash className="w-8 h-8 text-danger" />
            </div>
            <p className="text-text-primary">
              <span className="font-semibold">Stol {selectedTable?.tableNo}</span> ni o'chirishni xohlaysizmi?
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
              onClick={handleDeleteTable}
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

export default Tables;
