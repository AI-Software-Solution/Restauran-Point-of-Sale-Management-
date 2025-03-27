import { axiosWrapper } from "./axiosWrapper";

// 🔹 Auth Endpoints
export const login = (data) => axiosWrapper.post("/api/user/login", data);
export const register = (data) => axiosWrapper.post("/api/user/register", data);
export const getUserData = () => axiosWrapper.get("/api/user");
export const logout = () => axiosWrapper.post("/api/user/logout");
export const checkToken = (data) => axiosWrapper.put("/api/user/checkToken", data); // ✅ Token tekshirish API qo'shildi
export const updateUserData = (data) => axiosWrapper.put(`/api/user/update`, data)
export const deleteUserData = (data) => axiosWrapper.delete(`/api/user/delete`, data)
export const getAllUsers = async () => {
  try {
    const response = await axiosWrapper.get("/api/user/getAll");
    return response.data; // ✅ API dan to‘g‘ri natija olish
  } catch (error) {
    throw error;
  }
};

// 🔹 Category Endpoints ✅ Yangilandi
export const getCategories = async () => {
  try {
    const response = await axiosWrapper.get("/api/category");
    return response.data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};
export const addCategory = async (newCategory) => {
  const response = await axios.post(`${API_BASE_URL}/category`, newCategory);
  return response.data;
};
export const deleteCategory = async (id) => axiosWrapper.delete(`/api/category/${id}`)

// 🔹 Product Endpoints ✅ Qo‘shildi
export const getProducts = async () => {
  try {
    const response = await axiosWrapper.get("/api/product");
    return response.data;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};
export const addDish = async (newDish) => {
  const response = await axios.post(`${API_BASE_URL}/product`, {
    name: newDish.name,
    price: newDish.price,
    category: newDish.category, // <-- Backend uchun ID jo‘natiladi
  });
  return response.data;
};
export const deleteDish = async (id) => axiosWrapper.delete(`/api/product/${id}`)

// 🔹 Table Endpoints
export const addTable = async (newTable) => {
  const response = await axios.post(`${API_BASE_URL}/table`, {
    tableNo: newTable.tableNumber,
    seats: newTable.seatNumber,
  });
  return response.data;
};
export const getTables = async () => {
  try {
    const response = await axiosWrapper.get("/api/table");
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const updateTable = ({ tableId, ...tableData }) =>
  axiosWrapper.put(`/api/table/${tableId}`, tableData);
export const deleteTable = (tableId) => axiosWrapper.delete(`/api/table/${tableId}`)

// 🔹 Payment Endpoints
export const createOrderRazorpay = (data) =>
  axiosWrapper.post("/api/payment/create-order", data);
export const verifyPaymentRazorpay = (data) =>
  axiosWrapper.post("/api/payment/verify-payment", data);

// 🔹 Order Endpoints
export const addOrder = (data) => axiosWrapper.post("/api/order/", data);
export const getOrders = () => axiosWrapper.get("/api/order");
export const updateOrderStatus = ({ orderId, orderStatus }) =>
axiosWrapper.put(`/api/order/${orderId}`, { orderStatus });
export const deleteOrder = (id) => axiosWrapper.delete(`/api/order/${id}`)

// Statistic Endpoint 

export const getStatistic = async () => {
  try {
    const response = await axiosWrapper.get("/api/statistics");
    return response.data;
  } catch (error) {
    throw error;
  }
};
