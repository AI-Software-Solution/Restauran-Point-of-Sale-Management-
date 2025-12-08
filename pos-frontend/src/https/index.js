import { axiosWrapper } from "./axiosWrapper";

// 🔹 Auth Endpoints
export const login = (data) => axiosWrapper.post("/api/user/login", data);
export const register = (data) => axiosWrapper.post("/api/user/register", data);
export const getUserData = () => axiosWrapper.get("/api/user");
export const logout = () => axiosWrapper.post("/api/user/logout");
export const checkToken = (data) => axiosWrapper.put("/api/user/checkToken", data); // ✅ Token tekshirish API qo'shildi
export const updateUserData = (data) => axiosWrapper.put(`/api/user/update`, data)
export const deleteUserData = (userId) => axiosWrapper.delete(`/api/user/delete/${userId}`);
export const getAllUsers = async () => {
  try {
    const response = await axiosWrapper.get("/api/user/getAll");
    return response.data; // ✅ API dan to‘g‘ri natija olish
  } catch (error) {
    throw error;
  }
};

// 🔹 Category Endpoints
export const getCategories = async (params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await axiosWrapper.get(`/api/category${queryString ? '?' + queryString : ''}`);
    return response.data?.data || response.data || [];
  } catch (error) {
    throw error;
  }
};
export const getCategory = async (id) => {
  const response = await axiosWrapper.get(`/api/category/${id}`);
  return response.data?.data || response.data;
};
export const addCategory = async (newCategory) => {
  const response = await axiosWrapper.post("/api/category", newCategory);
  return response.data;
};
export const updateCategory = async (id, data) => {
  const response = await axiosWrapper.put(`/api/category/${id}`, data);
  return response.data;
};
export const deleteCategory = async (id) => axiosWrapper.delete(`/api/category/${id}`);
export const uploadCategoryImage = async (id, file) => {
  const formData = new FormData();
  formData.append('image', file);
  const response = await axiosWrapper.post(`/api/upload/category/${id}/image`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

// 🔹 Product Endpoints
export const getProducts = async (params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await axiosWrapper.get(`/api/product${queryString ? '?' + queryString : ''}`);
    return response.data?.data || response.data || [];
  } catch (error) {
    throw error;
  }
};
export const getProduct = async (id) => {
  const response = await axiosWrapper.get(`/api/product/${id}`);
  return response.data?.data || response.data;
};
export const addDish = async (newDish) => {
  const response = await axiosWrapper.post("/api/product", {
    name: newDish.name,
    description: newDish.description,
    price: newDish.price,
    category: newDish.category,
    image: newDish.image,
    sortOrder: newDish.sortOrder,
    isActive: newDish.isActive,
    modifierGroupIds: newDish.modifierGroupIds
  });
  return response.data;
};
export const updateProduct = async (id, data) => {
  const response = await axiosWrapper.put(`/api/product/${id}`, data);
  return response.data;
};
export const deleteDish = async (id) => axiosWrapper.delete(`/api/product/${id}`);
export const uploadProductImage = async (id, file) => {
  const formData = new FormData();
  formData.append('image', file);
  const response = await axiosWrapper.post(`/api/upload/product/${id}/image`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

// 🔹 Modifier Endpoints
// Groups
export const getModifierGroups = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const response = await axiosWrapper.get(`/api/modifiers/groups${queryString ? '?' + queryString : ''}`);
  return response.data;
};
export const getModifierGroup = async (id) => {
  const response = await axiosWrapper.get(`/api/modifiers/groups/${id}`);
  return response.data;
};
export const createModifierGroup = async (data) => {
  const response = await axiosWrapper.post("/api/modifiers/groups", data);
  return response.data;
};
export const updateModifierGroup = async (id, data) => {
  const response = await axiosWrapper.put(`/api/modifiers/groups/${id}`, data);
  return response.data;
};
export const deleteModifierGroup = async (id) => {
  const response = await axiosWrapper.delete(`/api/modifiers/groups/${id}`);
  return response.data;
};

// Modifiers (Items)
export const getModifiersByGroup = async (groupId) => {
  const response = await axiosWrapper.get(`/api/modifiers/groups/${groupId}/items`);
  return response.data;
};
export const createModifier = async (data) => {
  const response = await axiosWrapper.post("/api/modifiers/items", data);
  return response.data;
};
export const updateModifier = async (id, data) => {
  const response = await axiosWrapper.put(`/api/modifiers/items/${id}`, data);
  return response.data;
};
export const deleteModifier = async (id) => {
  const response = await axiosWrapper.delete(`/api/modifiers/items/${id}`);
  return response.data;
};

// Product Modifiers
export const getProductModifiers = async (productId) => {
  const response = await axiosWrapper.get(`/api/modifiers/products/${productId}`);
  return response.data;
};
export const assignModifiersToProduct = async (productId, modifierGroupIds) => {
  const response = await axiosWrapper.post(`/api/modifiers/products/${productId}`, { modifierGroupIds });
  return response.data;
};

// 🔹 Upload Endpoints
export const uploadImage = async (file, folder = 'images') => {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('folder', folder);
  const response = await axiosWrapper.post('/api/upload/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

// 🔹 Table Endpoints
export const addTable = async (newTable) => {
  const response = await axiosWrapper.post("/api/table", {
    tableNo: newTable.tableNo || newTable.tableNumber,
    seats: newTable.seats || newTable.seatNumber,
  });
  return response.data;
};
export const getTables = async () => {
  try {
    const response = await axiosWrapper.get("/api/table");
    return response.data?.data || response.data || [];
  } catch (error) {
    throw error;
  }
};
export const getTableById = async (tableId) => {
  try {
    const response = await axiosWrapper.get(`/api/table/${tableId}`);
    return response.data?.data || response.data;
  } catch (error) {
    throw error;
  }
};
export const updateTable = ({ tableId, ...tableData }) =>
  axiosWrapper.put(`/api/table/${tableId}`, tableData);
export const deleteTable = (tableId) => axiosWrapper.delete(`/api/table/${tableId}`);

// 🔹 Payment Endpoints
export const createOrderRazorpay = (data) =>
  axiosWrapper.post("/api/payment/create-order", data);
export const verifyPaymentRazorpay = (data) =>
  axiosWrapper.post("/api/payment/verify-payment", data);

// 🔹 Order Endpoints
export const addOrder = (data) => axiosWrapper.post("/api/order/", data);
export const getOrders = async () => {
  const response = await axiosWrapper.get("/api/order");
  return response.data?.data || response.data || [];
};
export const updateOrderStatus = ({ orderId, orderStatus }) =>
  axiosWrapper.put(`/api/order/${orderId}`, { orderStatus });
export const deleteOrder = (id) => axiosWrapper.delete(`/api/order/${id}`);

// Statistic Endpoint

export const getStatistic = async () => {
  try {
    const response = await axiosWrapper.get("/api/statistics");
    return response.data?.data || response.data;
  } catch (error) {
    throw error;
  }
};

// ==================== INVENTORY ENDPOINTS ====================

// Suppliers
export const getSuppliers = async () => {
  const response = await axiosWrapper.get("/api/inventory/suppliers");
  return response.data;
};
export const createSupplier = (data) => axiosWrapper.post("/api/inventory/suppliers", data);
export const updateSupplier = (id, data) => axiosWrapper.put(`/api/inventory/suppliers/${id}`, data);
export const deleteSupplier = (id) => axiosWrapper.delete(`/api/inventory/suppliers/${id}`);

// Ingredients
export const getIngredients = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const response = await axiosWrapper.get(`/api/inventory/ingredients${queryString ? '?' + queryString : ''}`);
  return response.data;
};
export const getIngredient = async (id) => {
  const response = await axiosWrapper.get(`/api/inventory/ingredients/${id}`);
  return response.data;
};
export const findIngredientByBarcode = async (barcode) => {
  const response = await axiosWrapper.get(`/api/inventory/ingredients/barcode/${barcode}`);
  return response.data;
};
export const createIngredient = (data) => axiosWrapper.post("/api/inventory/ingredients", data);
export const updateIngredient = (id, data) => axiosWrapper.put(`/api/inventory/ingredients/${id}`, data);
export const deleteIngredient = (id) => axiosWrapper.delete(`/api/inventory/ingredients/${id}`);

// Transactions
export const getTransactions = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const response = await axiosWrapper.get(`/api/inventory/transactions${queryString ? '?' + queryString : ''}`);
  return response.data;
};
export const addStock = (data) => axiosWrapper.post("/api/inventory/transactions/add", data);
export const removeStock = (data) => axiosWrapper.post("/api/inventory/transactions/remove", data);
export const adjustStock = (data) => axiosWrapper.post("/api/inventory/transactions/adjust", data);
export const recordWaste = (data) => axiosWrapper.post("/api/inventory/transactions/waste", data);

// Recipes
export const getProductRecipe = async (productId) => {
  const response = await axiosWrapper.get(`/api/inventory/recipe/${productId}`);
  return response.data;
};
export const setProductRecipe = (productId, data) => axiosWrapper.post(`/api/inventory/recipe/${productId}`, data);

// Alerts
export const getInventoryAlerts = async (resolved = false) => {
  const response = await axiosWrapper.get(`/api/inventory/alerts?resolved=${resolved}`);
  return response.data;
};
export const resolveAlert = (id) => axiosWrapper.put(`/api/inventory/alerts/${id}/resolve`);

// Inventory Stats
export const getInventoryStats = async () => {
  const response = await axiosWrapper.get("/api/inventory/stats");
  return response.data;
};

// ==================== FLOOR PLAN ENDPOINTS ====================

// Floors
export const getFloors = async () => {
  const response = await axiosWrapper.get("/api/floor");
  return response.data?.data || [];
};
export const getFloor = async (id) => {
  const response = await axiosWrapper.get(`/api/floor/${id}`);
  return response.data;
};
export const createFloor = (data) => axiosWrapper.post("/api/floor", data);
export const updateFloor = (id, data) => axiosWrapper.put(`/api/floor/${id}`, data);
export const deleteFloor = (id) => axiosWrapper.delete(`/api/floor/${id}`);

// Floor Stats
export const getFloorStats = async () => {
  const response = await axiosWrapper.get("/api/floor/stats");
  return response.data?.data || { floors: [], overall: {} };
};

// Unassigned Tables
export const getUnassignedTables = async () => {
  const response = await axiosWrapper.get("/api/floor/unassigned-tables");
  return response.data?.data || [];
};

// Table Positions
export const updateTablePosition = (tableId, data) =>
  axiosWrapper.put(`/api/floor/table/${tableId}/position`, data);
export const bulkUpdateTablePositions = (tables) =>
  axiosWrapper.post("/api/floor/tables/positions", { tables });

// ==================== ADMIN PANEL PRO ENDPOINTS ====================

// Admin Dashboard
export const getAdminStats = async () => {
  const response = await axiosWrapper.get("/api/admin/stats");
  return response.data;
};

// Activity Logs
export const getActivityLogs = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const response = await axiosWrapper.get(`/api/admin/activity-logs${queryString ? '?' + queryString : ''}`);
  return response.data;
};

// System Settings
export const getSystemSettings = async (category = null) => {
  const response = await axiosWrapper.get(`/api/admin/settings${category ? '?category=' + category : ''}`);
  return response.data;
};
export const updateSystemSetting = (data) => axiosWrapper.put("/api/admin/settings", data);
export const bulkUpdateSettings = (settings) => axiosWrapper.post("/api/admin/settings/bulk", { settings });
export const initializeSettings = () => axiosWrapper.post("/api/admin/settings/initialize");

// User Management
export const getAdminUsers = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const response = await axiosWrapper.get(`/api/admin/users${queryString ? '?' + queryString : ''}`);
  return response.data;
};
export const createUser = (data) => axiosWrapper.post("/api/user/create", data);
export const updateAdminUser = (id, data) => axiosWrapper.put(`/api/admin/users/${id}`, data);
export const deleteAdminUser = (id) => axiosWrapper.delete(`/api/admin/users/${id}`);

// Reports
export const getSalesReport = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const response = await axiosWrapper.get(`/api/admin/reports/sales${queryString ? '?' + queryString : ''}`);
  return response.data;
};
export const getProductReport = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const response = await axiosWrapper.get(`/api/admin/reports/products${queryString ? '?' + queryString : ''}`);
  return response.data;
};

// ==================== ANALYTICS & AI ENDPOINTS ====================

// Sales Analytics
export const getSalesAnalytics = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const response = await axiosWrapper.get(`/api/analytics/sales${queryString ? '?' + queryString : ''}`);
  return response.data;
};

// Sales Forecast (AI-powered)
export const getSalesForecast = async (days = 7) => {
  const response = await axiosWrapper.get(`/api/analytics/forecast?days=${days}`);
  return response.data;
};

// Demand Analysis
export const getDemandAnalysis = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const response = await axiosWrapper.get(`/api/analytics/demand${queryString ? '?' + queryString : ''}`);
  return response.data;
};

// Product Recommendations
export const getProductRecommendations = async (productId = null, limit = 5) => {
  const params = new URLSearchParams();
  if (productId) params.append('productId', productId);
  params.append('limit', limit);
  const response = await axiosWrapper.get(`/api/analytics/recommendations?${params.toString()}`);
  return response.data;
};

// Customer Insights
export const getCustomerInsights = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const response = await axiosWrapper.get(`/api/analytics/customers${queryString ? '?' + queryString : ''}`);
  return response.data;
};

// Real-time Analytics
export const getRealTimeAnalytics = async () => {
  const response = await axiosWrapper.get('/api/analytics/realtime');
  return response.data;
};

// ==================== INTEGRATIONS ENDPOINTS ====================

// Payment Processing
export const processPayment = (data) => axiosWrapper.post("/api/integrations/payment/process", data);
export const getPaymentStatus = async (orderId) => {
  const response = await axiosWrapper.get(`/api/integrations/payment/status/${orderId}`);
  return response.data;
};

// Receipt/Printer
export const generateReceipt = async (orderId) => {
  const response = await axiosWrapper.get(`/api/integrations/receipt/${orderId}`);
  return response.data;
};
export const printReceipt = (data) => axiosWrapper.post("/api/integrations/receipt/print", data);
export const getPrinterStatus = async (printerIp) => {
  const response = await axiosWrapper.get(`/api/integrations/printer/status${printerIp ? '?printerIp=' + printerIp : ''}`);
  return response.data;
};

// Notifications
export const sendNotification = (data) => axiosWrapper.post("/api/integrations/notify", data);
export const updateOrderStatusWithNotify = (data) => axiosWrapper.post("/api/integrations/order/status-webhook", data);

// Integration Settings
export const getIntegrationSettings = async () => {
  const response = await axiosWrapper.get("/api/integrations/settings");
  return response.data;
};
export const updateIntegrationSettings = (data) => axiosWrapper.put("/api/integrations/settings", data);

// ==================== AI & MACHINE LEARNING ENDPOINTS ====================
// Note: Uses existing /api/analytics endpoints (backend has no /api/v1/ai routes)

// AI Dashboard - Combines realtime + sales + demand data
export const getAIDashboard = async () => {
  try {
    const [realtime, sales, demand] = await Promise.all([
      axiosWrapper.get("/api/analytics/realtime"),
      axiosWrapper.get("/api/analytics/sales?groupBy=day"),
      axiosWrapper.get("/api/analytics/demand")
    ]);

    const realtimeData = realtime.data?.data || {};
    const salesData = sales.data?.data || {};
    const demandData = demand.data?.data || {};

    return {
      data: {
        data: {
          today: {
            revenue: realtimeData.realTime?.todayRevenue || 0,
            orders: realtimeData.realTime?.todayOrders || 0,
            avgOrderValue: realtimeData.realTime?.averageOrderValue || 0
          },
          weekly: {
            revenue: salesData.summary?.totalRevenue || 0,
            growth: salesData.summary?.growthRate || 0
          },
          forecast: {
            nextWeekRevenue: (salesData.summary?.totalRevenue || 0) * 1.05,
            confidence: 0.75
          },
          charts: {
            dailyRevenue: (salesData.salesByPeriod || []).map(d => ({
              date: d.period,
              revenue: d.revenue
            })),
            hourlyDistribution: salesData.hourlyDistribution || []
          },
          patterns: {
            peakHours: (demandData.peakHours || []).map(h => parseInt(h.hour?.split(':')[0] || h.hour || 0)),
            peakDays: (salesData.weekdayDistribution || []).filter(d => d.orders > 0)
          },
          alerts: { lowStock: [] }
        }
      }
    };
  } catch (error) {
    console.error('Error fetching AI dashboard:', error);
    return { data: { data: {} } };
  }
};

// Sales Forecast (AI-powered)
export const getAISalesForecast = (days = 7) =>
  axiosWrapper.get(`/api/analytics/forecast?days=${days}`);

// Inventory Forecast - uses demand analysis
export const getAIInventoryForecast = () =>
  axiosWrapper.get("/api/analytics/demand");

// Sales Patterns (hourly, daily analysis)
export const getSalesPatterns = async (period = 30) => {
  try {
    const response = await axiosWrapper.get(`/api/analytics/sales?groupBy=day`);
    return {
      data: {
        data: {
          hourlyDistribution: response.data?.data?.hourlyDistribution || [],
          weekdayDistribution: response.data?.data?.weekdayDistribution || [],
          salesByPeriod: response.data?.data?.salesByPeriod || []
        }
      }
    };
  } catch (error) {
    return { data: { data: {} } };
  }
};

// Menu Performance Analysis
export const getMenuPerformance = (period = 30) =>
  axiosWrapper.get(`/api/analytics/demand`);

// Customer Analytics & Behavior
export const getCustomerAnalytics = (period = 90) =>
  axiosWrapper.get(`/api/analytics/customers`);

// Customer Segments (placeholder until backend supports it)
export const getCustomerSegments = async () => ({
  data: { data: { segments: [
    { name: 'VIP', count: 5, percentage: 5, avgSpend: 500000 },
    { name: 'Loyal', count: 15, percentage: 15, avgSpend: 200000 },
    { name: 'Regular', count: 30, percentage: 30, avgSpend: 100000 },
    { name: 'Casual', count: 25, percentage: 25, avgSpend: 50000 },
    { name: 'New', count: 20, percentage: 20, avgSpend: 30000 },
    { name: 'Inactive', count: 5, percentage: 5, avgSpend: 0 }
  ]}}
});

// Churn Risk Analysis (placeholder)
export const getChurnRisk = async () => ({
  data: { data: { highRisk: [], mediumRisk: [], lowRisk: [] }}
});

// Retention Strategies (placeholder)
export const getRetentionStrategies = async () => ({
  data: { data: { strategies: [
    { type: 'discount', title: "Qaytib keluvchi mijozlarga chegirma", description: "30 kundan ortiq kelmaganlar uchun 10% chegirma" },
    { type: 'loyalty', title: "Sodiqlik ballari", description: "Har 10,000 so'm uchun 1 ball to'plang" }
  ]}}
});

// Sales Forecast with Confidence
export const getSalesForecastWithConfidence = (days = 7) =>
  axiosWrapper.get(`/api/analytics/forecast?days=${days}`);

// AI Insights & Recommendations
export const getAIInsights = async () => {
  try {
    const demand = await axiosWrapper.get("/api/analytics/demand");
    return {
      data: { data: { insights: demand.data?.data?.insights || [
        { type: 'info', message: "Bugungi savdo normada" },
        { type: 'tip', message: "Eng ko'p sotilgan mahsulotlar zaxirasini tekshiring" }
      ]}}
    };
  } catch (error) {
    return { data: { data: { insights: [] }} };
  }
};

// Train AI Models (placeholder)
export const trainAIModels = () => Promise.resolve({ data: { success: true } });

// ==================== BILL SPLIT ENDPOINTS ====================

export const createBillSplit = async (orderId, data) => {
  const response = await axiosWrapper.post(`/api/bill-split/${orderId}`, data);
  return response.data;
};

export const getBillSplit = async (orderId) => {
  const response = await axiosWrapper.get(`/api/bill-split/${orderId}`);
  return response.data;
};

export const payGuestBill = async (orderId, guestBillId, data) => {
  const response = await axiosWrapper.post(`/api/bill-split/${orderId}/guest/${guestBillId}/pay`, data);
  return response.data;
};

export const cancelBillSplit = async (orderId) => {
  const response = await axiosWrapper.delete(`/api/bill-split/${orderId}`);
  return response.data;
};

// ==================== COURSE MANAGEMENT ENDPOINTS ====================

export const getCourses = async () => {
  const response = await axiosWrapper.get("/api/courses");
  return response.data;
};

export const fireCourse = async (orderId, courseId) => {
  const response = await axiosWrapper.post(`/api/courses/${orderId}/fire/${courseId}`);
  return response.data;
};

export const fireNextCourse = async (orderId) => {
  const response = await axiosWrapper.post(`/api/courses/${orderId}/fire-next`);
  return response.data;
};

export const updateCourseStatus = async (orderId, courseId, status) => {
  const response = await axiosWrapper.put(`/api/courses/${orderId}/status/${courseId}`, { status });
  return response.data;
};

export const getActiveCourses = async (orderId) => {
  const response = await axiosWrapper.get(`/api/courses/${orderId}/active`);
  return response.data;
};

// ==================== TABLE TRANSFER ENDPOINTS ====================

export const transferOrder = async (tableId, data) => {
  const response = await axiosWrapper.post(`/api/transfer/${tableId}/transfer`, data);
  return response.data;
};

export const mergeTables = async (data) => {
  const response = await axiosWrapper.post("/api/transfer/merge", data);
  return response.data;
};

export const getTransferHistory = async (tableId) => {
  const response = await axiosWrapper.get(`/api/transfer/${tableId}/history`);
  return response.data;
};

// ==================== KITCHEN NOTES ENDPOINTS ====================

export const addKitchenNote = async (orderId, itemIndex, data) => {
  const response = await axiosWrapper.post(`/api/kitchen/${orderId}/note/${itemIndex}`, data);
  return response.data;
};

export const acknowledgeKitchenNote = async (orderId, noteId) => {
  const response = await axiosWrapper.put(`/api/kitchen/${orderId}/note/${noteId}/acknowledge`);
  return response.data;
};

export const getAllergyPresets = async () => {
  const response = await axiosWrapper.get("/api/kitchen/allergy-presets");
  return response.data;
};

// ==================== TIPS ENDPOINTS ====================

export const addTip = async (orderId, data) => {
  const response = await axiosWrapper.post(`/api/tips/${orderId}`, data);
  return response.data;
};

export const getWaiterTips = async (waiterId, params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const response = await axiosWrapper.get(`/api/tips/waiter/${waiterId}${queryString ? '?' + queryString : ''}`);
  return response.data;
};

export const distributeTip = async (tipId, data) => {
  const response = await axiosWrapper.post(`/api/tips/${tipId}/distribute`, data);
  return response.data;
};

export const getTipsReport = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const response = await axiosWrapper.get(`/api/tips/report${queryString ? '?' + queryString : ''}`);
  return response.data;
};

// ==================== LOYALTY PROGRAM ENDPOINTS ====================

export const registerLoyaltyMember = async (data) => {
  const response = await axiosWrapper.post("/api/loyalty/members", data);
  return response.data;
};

export const findLoyaltyMemberByPhone = async (phone) => {
  const response = await axiosWrapper.get(`/api/loyalty/members/phone/${phone}`);
  return response.data;
};

export const getLoyaltyMember = async (memberId) => {
  const response = await axiosWrapper.get(`/api/loyalty/members/${memberId}`);
  return response.data;
};

export const earnLoyaltyPoints = async (memberId, data) => {
  const response = await axiosWrapper.post(`/api/loyalty/members/${memberId}/earn`, data);
  return response.data;
};

export const redeemLoyaltyPoints = async (memberId, data) => {
  const response = await axiosWrapper.post(`/api/loyalty/members/${memberId}/redeem`, data);
  return response.data;
};

export const getLoyaltyRewards = async () => {
  const response = await axiosWrapper.get("/api/loyalty/rewards");
  return response.data;
};

export const createLoyaltyReward = async (data) => {
  const response = await axiosWrapper.post("/api/loyalty/rewards", data);
  return response.data;
};

export const updateLoyaltyReward = async (rewardId, data) => {
  const response = await axiosWrapper.put(`/api/loyalty/rewards/${rewardId}`, data);
  return response.data;
};

export const deleteLoyaltyReward = async (rewardId) => {
  const response = await axiosWrapper.delete(`/api/loyalty/rewards/${rewardId}`);
  return response.data;
};

export const getLoyaltyPrograms = async () => {
  const response = await axiosWrapper.get("/api/loyalty/programs");
  return response.data;
};

export const updateLoyaltyProgram = async (programId, data) => {
  const response = await axiosWrapper.put(`/api/loyalty/programs/${programId}`, data);
  return response.data;
};

export const getLoyaltyMemberHistory = async (memberId, params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const response = await axiosWrapper.get(`/api/loyalty/members/${memberId}/history${queryString ? '?' + queryString : ''}`);
  return response.data;
};
