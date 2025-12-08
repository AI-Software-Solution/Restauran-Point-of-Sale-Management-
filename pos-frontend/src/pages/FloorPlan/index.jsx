import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import {
  getFloors,
  getFloorStats,
  createFloor,
  updateFloor,
  deleteFloor,
  getUnassignedTables,
  bulkUpdateTablePositions,
  transferOrder,
  mergeTables,
} from "../../https";
import {
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineSave,
  HiOutlineViewGrid,
  HiOutlineUsers,
  HiOutlineCog,
  HiOutlineRefresh,
  HiOutlineSwitchHorizontal,
  HiOutlineLink,
  HiOutlineArrowRight,
} from "react-icons/hi";
import { MdTableRestaurant, MdDragIndicator, MdLayers, MdCallMerge } from "react-icons/md";
import { BiRectangle, BiCircle } from "react-icons/bi";
import { FiCheck, FiX } from "react-icons/fi";
import { Button, Card, StatsCard, Badge, Modal, Input, Textarea } from "../../components/ui";

const FloorPlan = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const canvasRef = useRef(null);
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [draggedTable, setDraggedTable] = useState(null);
  const [tablePositions, setTablePositions] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);

  // Modals
  const [floorModal, setFloorModal] = useState({ open: false, floor: null });
  const [transferModal, setTransferModal] = useState({ open: false, sourceTable: null });
  const [mergeModal, setMergeModal] = useState({ open: false, tables: [] });
  const [transferMode, setTransferMode] = useState(false); // For selecting target table
  const [mergeSelectMode, setMergeSelectMode] = useState(false); // For selecting tables to merge

  // Form state
  const [floorForm, setFloorForm] = useState({
    name: "",
    description: "",
    width: 800,
    height: 600,
  });

  // Queries
  const { data: floorsData, isLoading: floorsLoading } = useQuery({
    queryKey: ["floors"],
    queryFn: getFloors,
  });

  const { data: statsData } = useQuery({
    queryKey: ["floorStats"],
    queryFn: getFloorStats,
  });

  const { data: unassignedData } = useQuery({
    queryKey: ["unassignedTables"],
    queryFn: getUnassignedTables,
  });

  const floors = floorsData || [];
  const stats = statsData || { floors: [], overall: {} };
  const unassignedTables = unassignedData || [];

  // Select first floor by default
  useEffect(() => {
    if (floors.length > 0 && !selectedFloor) {
      setSelectedFloor(floors[0]);
    }
  }, [floors, selectedFloor]);

  // Initialize table positions when floor changes
  useEffect(() => {
    if (selectedFloor?.tables) {
      const positions = {};
      selectedFloor.tables.forEach((table) => {
        positions[table.id] = {
          posX: table.posX || 50,
          posY: table.posY || 50,
          width: table.width || 80,
          height: table.height || 80,
          shape: table.shape || "rectangle",
          rotation: table.rotation || 0,
        };
      });
      setTablePositions(positions);
      setHasChanges(false);
    }
  }, [selectedFloor]);

  // Mutations
  const createFloorMutation = useMutation({
    mutationFn: createFloor,
    onSuccess: () => {
      queryClient.invalidateQueries(["floors"]);
      setFloorModal({ open: false, floor: null });
      setFloorForm({ name: "", description: "", width: 800, height: 600 });
    },
  });

  const updateFloorMutation = useMutation({
    mutationFn: ({ id, data }) => updateFloor(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["floors"]);
      setFloorModal({ open: false, floor: null });
    },
  });

  const deleteFloorMutation = useMutation({
    mutationFn: deleteFloor,
    onSuccess: () => {
      queryClient.invalidateQueries(["floors"]);
      setSelectedFloor(null);
    },
  });

  const savePositionsMutation = useMutation({
    mutationFn: bulkUpdateTablePositions,
    onSuccess: () => {
      queryClient.invalidateQueries(["floors"]);
      setHasChanges(false);
    },
  });

  // Transfer Order Mutation
  const transferOrderMutation = useMutation({
    mutationFn: ({ tableId, data }) => transferOrder(tableId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["floors"]);
      queryClient.invalidateQueries(["floorStats"]);
      setTransferModal({ open: false, sourceTable: null });
      setTransferMode(false);
      setSelectedTable(null);
      enqueueSnackbar("Buyurtma muvaffaqiyatli ko'chirildi!", { variant: "success" });
    },
    onError: (error) => {
      enqueueSnackbar("Buyurtmani ko'chirishda xatolik!", { variant: "error" });
    },
  });

  // Merge Tables Mutation
  const mergeTablesMutation = useMutation({
    mutationFn: mergeTables,
    onSuccess: () => {
      queryClient.invalidateQueries(["floors"]);
      queryClient.invalidateQueries(["floorStats"]);
      setMergeModal({ open: false, tables: [] });
      setMergeSelectMode(false);
      enqueueSnackbar("Stollar muvaffaqiyatli birlashtirildi!", { variant: "success" });
    },
    onError: (error) => {
      enqueueSnackbar("Stollarni birlashtirishda xatolik!", { variant: "error" });
    },
  });

  // Drag handlers
  const handleDragStart = (e, table) => {
    if (!editMode) return;
    setDraggedTable(table);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (!draggedTable || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left - 40, selectedFloor.width - 80));
    const y = Math.max(0, Math.min(e.clientY - rect.top - 40, selectedFloor.height - 80));

    setTablePositions((prev) => ({
      ...prev,
      [draggedTable.id]: {
        ...prev[draggedTable.id],
        posX: Math.round(x),
        posY: Math.round(y),
      },
    }));
    setHasChanges(true);
    setDraggedTable(null);
  };

  const handleSavePositions = () => {
    if (!selectedFloor) return;
    const tables = selectedFloor.tables.map((table) => ({
      id: table.id,
      floorId: selectedFloor.id,
      ...tablePositions[table.id],
    }));
    savePositionsMutation.mutate(tables);
  };

  const handleFloorSubmit = (e) => {
    e.preventDefault();
    if (floorModal.floor) {
      updateFloorMutation.mutate({ id: floorModal.floor.id, data: floorForm });
    } else {
      createFloorMutation.mutate(floorForm);
    }
  };

  const openEditFloor = (floor) => {
    setFloorForm({
      name: floor.name,
      description: floor.description || "",
      width: floor.width,
      height: floor.height,
    });
    setFloorModal({ open: true, floor });
  };

  const handleTableClick = (table) => {
    // Handle transfer mode - select target table
    if (transferMode && transferModal.sourceTable) {
      if (table.id === transferModal.sourceTable.id) {
        enqueueSnackbar("Bir xil stolga ko'chirib bo'lmaydi!", { variant: "warning" });
        return;
      }
      // Confirm transfer
      handleTransferConfirm(table);
      return;
    }

    // Handle merge select mode - add/remove table from merge list
    if (mergeSelectMode) {
      setMergeModal(prev => {
        const exists = prev.tables.find(t => t.id === table.id);
        if (exists) {
          return { ...prev, tables: prev.tables.filter(t => t.id !== table.id) };
        } else {
          // Only tables with orders can be merged
          if (!table.currentOrder) {
            enqueueSnackbar("Faqat buyurtmasi bor stollarni birlashtirish mumkin!", { variant: "warning" });
            return prev;
          }
          return { ...prev, tables: [...prev.tables, table] };
        }
      });
      return;
    }

    if (editMode) {
      setSelectedTable(table);
    } else {
      setSelectedTable(table);
    }
  };

  // Start transfer process
  const handleStartTransfer = () => {
    if (!selectedTable?.currentOrder) {
      enqueueSnackbar("Bu stolda buyurtma yo'q!", { variant: "warning" });
      return;
    }
    setTransferModal({ open: true, sourceTable: selectedTable });
    setTransferMode(true);
  };

  // Confirm transfer to target table
  const handleTransferConfirm = (targetTable) => {
    if (!transferModal.sourceTable) return;

    transferOrderMutation.mutate({
      tableId: transferModal.sourceTable.id,
      data: {
        toTableId: targetTable.id,
        orderId: transferModal.sourceTable.currentOrder?.id || transferModal.sourceTable.currentOrder?._id
      }
    });
  };

  // Cancel transfer
  const handleCancelTransfer = () => {
    setTransferModal({ open: false, sourceTable: null });
    setTransferMode(false);
  };

  // Start merge mode
  const handleStartMerge = () => {
    if (!selectedTable?.currentOrder) {
      enqueueSnackbar("Bu stolda buyurtma yo'q!", { variant: "warning" });
      return;
    }
    setMergeModal({ open: true, tables: [selectedTable] });
    setMergeSelectMode(true);
  };

  // Confirm merge
  const handleMergeConfirm = () => {
    if (mergeModal.tables.length < 2) {
      enqueueSnackbar("Kamida 2 ta stol tanlang!", { variant: "warning" });
      return;
    }

    const primaryTable = mergeModal.tables[0];
    const secondaryTableIds = mergeModal.tables.slice(1).map(t => t.id);

    mergeTablesMutation.mutate({
      primaryTableId: primaryTable.id,
      secondaryTableIds: secondaryTableIds,
      primaryOrderId: primaryTable.currentOrder?.id || primaryTable.currentOrder?._id
    });
  };

  // Cancel merge
  const handleCancelMerge = () => {
    setMergeModal({ open: false, tables: [] });
    setMergeSelectMode(false);
  };

  const getTableStatusColor = (status) => {
    switch (status) {
      case "Available":
        return "bg-success";
      case "Occupied":
        return "bg-danger";
      case "Reserved":
        return "bg-warning";
      case "Cleaning":
        return "bg-info";
      default:
        return "bg-gray-500";
    }
  };

  const getTableBorderColor = (status) => {
    switch (status) {
      case "Available":
        return "border-success/50";
      case "Occupied":
        return "border-danger/50";
      case "Reserved":
        return "border-warning/50";
      case "Cleaning":
        return "border-info/50";
      default:
        return "border-gray-500/50";
    }
  };

  if (floorsLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-text-secondary text-sm">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 animate-fade-in">
      {/* Transfer Mode Banner */}
      {transferMode && (
        <div className="mb-4 p-4 rounded-lg bg-info/10 border border-info/30 flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-3">
            <HiOutlineSwitchHorizontal className="text-info text-xl" />
            <div>
              <p className="font-semibold text-text-primary">
                Ko'chirish rejimi: Stol #{transferModal.sourceTable?.tableNo}
              </p>
              <p className="text-sm text-text-secondary">
                Buyurtmani ko'chirish uchun boshqa stolni bosing
              </p>
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={handleCancelTransfer}>
            <FiX className="mr-1" /> Bekor qilish
          </Button>
        </div>
      )}

      {/* Merge Mode Banner */}
      {mergeSelectMode && (
        <div className="mb-4 p-4 rounded-lg bg-warning/10 border border-warning/30 animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <MdCallMerge className="text-warning text-xl" />
              <div>
                <p className="font-semibold text-text-primary">
                  Birlashtirish rejimi
                </p>
                <p className="text-sm text-text-secondary">
                  Birlashtirilishi kerak bo'lgan stollarni tanlang (kamida 2 ta)
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleCancelMerge}
              >
                <FiX className="mr-1" /> Bekor qilish
              </Button>
              <Button
                variant="warning"
                size="sm"
                onClick={handleMergeConfirm}
                disabled={mergeModal.tables.length < 2}
                loading={mergeTablesMutation.isPending}
              >
                <FiCheck className="mr-1" /> Birlashtirish ({mergeModal.tables.length})
              </Button>
            </div>
          </div>
          {/* Selected tables for merge */}
          {mergeModal.tables.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {mergeModal.tables.map((table, index) => (
                <div
                  key={table.id}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 ${
                    index === 0
                      ? 'bg-primary-500 text-white'
                      : 'bg-surface-secondary text-text-primary border border-border'
                  }`}
                >
                  <MdTableRestaurant size={14} />
                  Stol #{table.tableNo}
                  {index === 0 && <span className="text-xs opacity-75">(asosiy)</span>}
                  <button
                    onClick={() => setMergeModal(prev => ({
                      ...prev,
                      tables: prev.tables.filter(t => t.id !== table.id)
                    }))}
                    className="hover:bg-white/20 rounded-full p-0.5"
                  >
                    <FiX size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <MdLayers className="text-primary-500" />
            Floor Plan
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Stollarni vizual tartibda joylashtiring
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {editMode && hasChanges && (
            <Button
              variant="success"
              icon={HiOutlineSave}
              onClick={handleSavePositions}
              loading={savePositionsMutation.isPending}
            >
              Saqlash
            </Button>
          )}
          <Button
            variant={editMode ? "primary" : "secondary"}
            icon={HiOutlinePencil}
            onClick={() => setEditMode(!editMode)}
          >
            {editMode ? "Tahrirlash ON" : "Tahrirlash"}
          </Button>
          <Button
            variant="primary"
            icon={HiOutlinePlus}
            onClick={() => {
              setFloorForm({ name: "", description: "", width: 800, height: 600 });
              setFloorModal({ open: true, floor: null });
            }}
          >
            Yangi Qavat
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Qavatlar"
          value={stats.overall?.totalFloors || 0}
          icon={MdLayers}
        />
        <StatsCard
          title="Bo'sh Stollar"
          value={stats.overall?.totalAvailable || 0}
          icon={MdTableRestaurant}
          changeType="positive"
        />
        <StatsCard
          title="Band Stollar"
          value={stats.overall?.totalOccupied || 0}
          icon={MdTableRestaurant}
          changeType="negative"
        />
        <StatsCard
          title="Jami O'rinlar"
          value={stats.overall?.totalSeats || 0}
          icon={HiOutlineUsers}
        />
      </div>

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
        {/* Left Panel - Floor Tabs & Legend */}
        <div className="w-full lg:w-56 flex-shrink-0 space-y-4">
          {/* Floor Tabs */}
          <Card padding="sm">
            <h3 className="text-text-secondary text-xs font-semibold uppercase tracking-wider mb-3 px-1">
              Qavatlar
            </h3>
            <div className="space-y-1">
              {floors.map((floor) => (
                <div
                  key={floor.id}
                  onClick={() => setSelectedFloor(floor)}
                  className={`
                    p-3 rounded-lg cursor-pointer transition-all
                    ${selectedFloor?.id === floor.id
                      ? "bg-primary-500 text-white"
                      : "hover:bg-surface-secondary text-text-primary"
                    }
                  `}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-sm">{floor.name}</span>
                    {editMode && (
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditFloor(floor);
                          }}
                          className="p-1 hover:bg-black/10 rounded"
                        >
                          <HiOutlinePencil size={14} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm("Bu qavatni o'chirmoqchimisiz?")) {
                              deleteFloorMutation.mutate(floor.id);
                            }
                          }}
                          className="p-1 hover:bg-black/10 rounded text-danger"
                        >
                          <HiOutlineTrash size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                  <p className={`text-xs mt-1 ${selectedFloor?.id === floor.id ? 'text-white/70' : 'text-text-muted'}`}>
                    {floor.tables?.length || 0} ta stol
                  </p>
                </div>
              ))}

              {floors.length === 0 && (
                <div className="text-text-muted text-sm text-center py-4">
                  Hali qavat yo'q
                </div>
              )}
            </div>
          </Card>

          {/* Unassigned Tables (Edit Mode) */}
          {editMode && unassignedTables.length > 0 && (
            <Card padding="sm">
              <h3 className="text-text-secondary text-xs font-semibold uppercase tracking-wider mb-3 px-1">
                Joylashtirilmagan
              </h3>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {unassignedTables.map((table) => (
                  <div
                    key={table.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, table)}
                    className="p-2 bg-surface-secondary rounded-lg cursor-move flex items-center gap-2"
                  >
                    <MdDragIndicator className="text-text-muted" />
                    <span className="text-sm text-text-primary">Stol #{table.tableNo}</span>
                    <span className="text-xs text-text-muted">({table.seats} o'rin)</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Legend */}
          <Card padding="sm">
            <h3 className="text-text-secondary text-xs font-semibold uppercase tracking-wider mb-3 px-1">
              Holat
            </h3>
            <div className="space-y-2">
              {[
                { color: "bg-success", label: "Bo'sh" },
                { color: "bg-danger", label: "Band" },
                { color: "bg-warning", label: "Bron" },
                { color: "bg-info", label: "Tozalanmoqda" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded ${item.color}`} />
                  <span className="text-sm text-text-secondary">{item.label}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Main Canvas */}
        <Card className="flex-1 overflow-hidden" padding="md">
          {selectedFloor ? (
            <>
              <div className="flex justify-between items-center mb-4 pb-3 border-b border-border">
                <div>
                  <h2 className="font-semibold text-text-primary">{selectedFloor.name}</h2>
                  <p className="text-xs text-text-muted mt-0.5">
                    {selectedFloor.width} x {selectedFloor.height} px
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={editMode ? "warning" : "default"}>
                    {editMode ? "Tahrirlash rejimi" : "Ko'rish rejimi"}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={HiOutlineRefresh}
                    onClick={() => queryClient.invalidateQueries(["floors"])}
                  />
                </div>
              </div>

              <div className="overflow-auto">
                <div
                  ref={canvasRef}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className="relative border-2 border-dashed border-border rounded-lg mx-auto"
                  style={{
                    width: selectedFloor.width,
                    height: selectedFloor.height,
                    backgroundColor: "var(--color-surface-secondary)",
                    backgroundImage: editMode
                      ? "linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)"
                      : "none",
                    backgroundSize: "20px 20px",
                  }}
                >
                  {selectedFloor.tables?.map((table) => {
                    const pos = tablePositions[table.id] || {
                      posX: 50,
                      posY: 50,
                      width: 80,
                      height: 80,
                    };
                    const isCircle = pos.shape === "circle";
                    const isSelected = selectedTable?.id === table.id;

                    // Transfer/Merge mode indicators
                    const isTransferSource = transferMode && transferModal.sourceTable?.id === table.id;
                    const isTransferTarget = transferMode && !isTransferSource && table.status === "Available";
                    const isMergeSelected = mergeSelectMode && mergeModal.tables.find(t => t.id === table.id);
                    const canBeMerged = mergeSelectMode && table.currentOrder && !isMergeSelected;

                    return (
                      <div
                        key={table.id}
                        draggable={editMode && !transferMode && !mergeSelectMode}
                        onDragStart={(e) => handleDragStart(e, table)}
                        onClick={() => handleTableClick(table)}
                        className={`
                          absolute flex flex-col items-center justify-center
                          ${editMode && !transferMode && !mergeSelectMode ? "cursor-move" : "cursor-pointer"}
                          ${isTransferSource
                            ? "bg-info animate-pulse"
                            : isTransferTarget
                              ? "bg-success ring-2 ring-info ring-offset-2 hover:ring-4"
                              : isMergeSelected
                                ? "bg-warning animate-pulse"
                                : canBeMerged
                                  ? "bg-danger ring-2 ring-warning ring-offset-2 hover:ring-4"
                                  : getTableStatusColor(table.status)
                          }
                          border-2 ${isTransferSource || isMergeSelected
                            ? "border-white"
                            : getTableBorderColor(table.status)
                          }
                          shadow-lg transition-all duration-200
                          ${!transferMode && !mergeSelectMode ? "hover:scale-105 hover:shadow-xl" : ""}
                          ${isSelected && !transferMode && !mergeSelectMode ? "ring-2 ring-primary-500 ring-offset-2" : ""}
                          ${transferMode && !isTransferSource && !isTransferTarget ? "opacity-50" : ""}
                          ${mergeSelectMode && !isMergeSelected && !canBeMerged ? "opacity-50" : ""}
                        `}
                        style={{
                          left: pos.posX,
                          top: pos.posY,
                          width: pos.width,
                          height: pos.height,
                          borderRadius: isCircle ? "50%" : "8px",
                          transform: `rotate(${pos.rotation || 0}deg)`,
                        }}
                      >
                        {/* Transfer Source Icon */}
                        {isTransferSource && (
                          <div className="absolute -top-3 -left-3 bg-info text-white p-1 rounded-full shadow-lg">
                            <HiOutlineSwitchHorizontal size={14} />
                          </div>
                        )}

                        {/* Transfer Target Icon */}
                        {isTransferTarget && (
                          <div className="absolute -top-3 -left-3 bg-success text-white p-1 rounded-full shadow-lg">
                            <HiOutlineArrowRight size={14} />
                          </div>
                        )}

                        {/* Merge Selected Icon */}
                        {isMergeSelected && (
                          <div className="absolute -top-3 -left-3 bg-warning text-white p-1 rounded-full shadow-lg flex items-center justify-center text-xs font-bold" style={{width: 20, height: 20}}>
                            {mergeModal.tables.findIndex(t => t.id === table.id) + 1}
                          </div>
                        )}

                        <span className="text-white font-bold text-base">#{table.tableNo}</span>
                        <span className="text-white/80 text-xs">{table.seats} o'rin</span>
                        {table.currentOrder && !transferMode && !mergeSelectMode && (
                          <span className="absolute -top-2 -right-2 bg-white text-text-primary text-xs px-1.5 py-0.5 rounded-full font-bold shadow">
                            {table.currentOrder.items?.length || 0}
                          </span>
                        )}
                      </div>
                    );
                  })}

                  {selectedFloor.tables?.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center text-text-muted">
                      <div className="text-center">
                        <HiOutlineViewGrid size={48} className="mx-auto mb-2 opacity-50" />
                        <p>{editMode ? "Stollarni shu yerga tashlang" : "Bu qavatda stol yo'q"}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-96 text-text-muted">
              <div className="text-center">
                <MdLayers size={48} className="mx-auto mb-4 opacity-50" />
                <p>Qavat tanlang yoki yangi qavat yarating</p>
              </div>
            </div>
          )}
        </Card>

        {/* Right Panel - Table Info / Edit */}
        {(selectedTable || (editMode && selectedTable)) && (
          <Card className="w-full lg:w-64 flex-shrink-0" padding="md">
            {editMode ? (
              // Edit Mode Panel
              <>
                <h3 className="font-semibold text-text-primary mb-4">
                  Stol #{selectedTable.tableNo} sozlamalari
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-text-secondary text-sm block mb-2">Shakl</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setTablePositions((prev) => ({
                            ...prev,
                            [selectedTable.id]: { ...prev[selectedTable.id], shape: "rectangle" },
                          }));
                          setHasChanges(true);
                        }}
                        className={`flex-1 p-3 rounded-lg flex items-center justify-center transition-colors ${
                          tablePositions[selectedTable.id]?.shape === "rectangle"
                            ? "bg-primary-500 text-white"
                            : "bg-surface-secondary text-text-primary hover:bg-border"
                        }`}
                      >
                        <BiRectangle size={24} />
                      </button>
                      <button
                        onClick={() => {
                          setTablePositions((prev) => ({
                            ...prev,
                            [selectedTable.id]: { ...prev[selectedTable.id], shape: "circle" },
                          }));
                          setHasChanges(true);
                        }}
                        className={`flex-1 p-3 rounded-lg flex items-center justify-center transition-colors ${
                          tablePositions[selectedTable.id]?.shape === "circle"
                            ? "bg-primary-500 text-white"
                            : "bg-surface-secondary text-text-primary hover:bg-border"
                        }`}
                      >
                        <BiCircle size={24} />
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-text-secondary text-sm block mb-2">
                      Kenglik: {tablePositions[selectedTable.id]?.width || 80}px
                    </label>
                    <input
                      type="range"
                      min="50"
                      max="150"
                      value={tablePositions[selectedTable.id]?.width || 80}
                      onChange={(e) => {
                        setTablePositions((prev) => ({
                          ...prev,
                          [selectedTable.id]: { ...prev[selectedTable.id], width: parseInt(e.target.value) },
                        }));
                        setHasChanges(true);
                      }}
                      className="w-full accent-primary-500"
                    />
                  </div>
                  <div>
                    <label className="text-text-secondary text-sm block mb-2">
                      Balandlik: {tablePositions[selectedTable.id]?.height || 80}px
                    </label>
                    <input
                      type="range"
                      min="50"
                      max="150"
                      value={tablePositions[selectedTable.id]?.height || 80}
                      onChange={(e) => {
                        setTablePositions((prev) => ({
                          ...prev,
                          [selectedTable.id]: { ...prev[selectedTable.id], height: parseInt(e.target.value) },
                        }));
                        setHasChanges(true);
                      }}
                      className="w-full accent-primary-500"
                    />
                  </div>
                </div>
                <Button
                  variant="secondary"
                  fullWidth
                  className="mt-4"
                  onClick={() => setSelectedTable(null)}
                >
                  Yopish
                </Button>
              </>
            ) : (
              // View Mode Panel
              <>
                <h3 className="font-semibold text-text-primary mb-4">
                  Stol #{selectedTable.tableNo}
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-text-secondary">Holat</span>
                    <Badge
                      variant={
                        selectedTable.status === "Available" ? "success" :
                        selectedTable.status === "Occupied" ? "danger" :
                        selectedTable.status === "Reserved" ? "warning" : "info"
                      }
                    >
                      {selectedTable.status === "Available" ? "Bo'sh" :
                       selectedTable.status === "Occupied" ? "Band" :
                       selectedTable.status === "Reserved" ? "Bron" : "Tozalanmoqda"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">O'rinlar</span>
                    <span className="text-text-primary font-medium">{selectedTable.seats}</span>
                  </div>
                  {selectedTable.currentOrder && (
                    <div className="border-t border-border pt-3 mt-3">
                      <h4 className="text-text-secondary text-xs uppercase tracking-wider mb-2">Joriy Buyurtma</h4>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-text-secondary">ID</span>
                          <span className="text-text-primary">#{selectedTable.currentOrder.id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-secondary">Status</span>
                          <span className="text-text-primary">{selectedTable.currentOrder.orderStatus}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-secondary">Jami</span>
                          <span className="text-primary-500 font-bold">
                            {(selectedTable.currentOrder.bills?.totalWithTax || 0).toLocaleString()} so'm
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={() => navigate(`/menu?table=${selectedTable.id}`)}
                  >
                    {selectedTable.currentOrder ? "Davom ettirish" : "Buyurtma"}
                  </Button>
                </div>

                {/* Transfer & Merge buttons - only show if table has order */}
                {selectedTable.currentOrder && !transferMode && !mergeSelectMode && (
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleStartTransfer}
                      disabled={transferOrderMutation.isPending}
                      className="text-info border-info/30 hover:bg-info/10"
                    >
                      <HiOutlineSwitchHorizontal className="mr-1" size={16} />
                      Ko'chirish
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleStartMerge}
                      disabled={mergeTablesMutation.isPending}
                      className="text-warning border-warning/30 hover:bg-warning/10"
                    >
                      <MdCallMerge className="mr-1" size={16} />
                      Birlashtirish
                    </Button>
                  </div>
                )}

                <Button
                  variant="ghost"
                  fullWidth
                  className="mt-2"
                  onClick={() => setSelectedTable(null)}
                >
                  Yopish
                </Button>
              </>
            )}
          </Card>
        )}
      </div>

      {/* Floor Modal */}
      <Modal
        isOpen={floorModal.open}
        onClose={() => setFloorModal({ open: false, floor: null })}
        title={floorModal.floor ? "Qavatni tahrirlash" : "Yangi qavat"}
        size="md"
      >
        <form onSubmit={handleFloorSubmit}>
          <div className="space-y-4">
            <Input
              label="Qavat nomi"
              value={floorForm.name}
              onChange={(e) => setFloorForm({ ...floorForm, name: e.target.value })}
              placeholder="Masalan: Asosiy zal"
              required
            />
            <Textarea
              label="Tavsif"
              value={floorForm.description}
              onChange={(e) => setFloorForm({ ...floorForm, description: e.target.value })}
              placeholder="Qisqacha tavsif"
              rows={2}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Kenglik (px)"
                type="number"
                value={floorForm.width}
                onChange={(e) => setFloorForm({ ...floorForm, width: parseInt(e.target.value) || 800 })}
                min={400}
                max={1200}
              />
              <Input
                label="Balandlik (px)"
                type="number"
                value={floorForm.height}
                onChange={(e) => setFloorForm({ ...floorForm, height: parseInt(e.target.value) || 600 })}
                min={300}
                max={900}
              />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <Button
              variant="secondary"
              fullWidth
              type="button"
              onClick={() => setFloorModal({ open: false, floor: null })}
            >
              Bekor qilish
            </Button>
            <Button
              variant="primary"
              fullWidth
              type="submit"
              loading={createFloorMutation.isPending || updateFloorMutation.isPending}
            >
              {floorModal.floor ? "Saqlash" : "Yaratish"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default FloorPlan;
