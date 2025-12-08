import { createSlice } from "@reduxjs/toolkit";

// Generate unique order ID using crypto API (collision-safe)
const generateOrderId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    // Fallback for older browsers
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
};

const initialState = {
    orderId: "",
    customerName: "",
    customerPhone: "",
    guests: 0,
    table: null,
    orderType: "dine-in" // 'dine-in' | 'takeaway'
}


const customerSlice = createSlice({
    name : "customer",
    initialState,
    reducers : {
        setCustomer: (state, action) => {
            const { name, phone, guests, orderType, table } = action.payload;
            state.orderId = generateOrderId();
            state.customerName = name || "";
            state.customerPhone = phone || "";
            state.guests = guests || 0;
            if (orderType) state.orderType = orderType;
            if (table !== undefined) state.table = table;
        },

        setOrderType: (state, action) => {
            state.orderType = action.payload;
        },

        removeCustomer: (state) => {
            state.customerName = "";
            state.customerPhone = "";
            state.guests = 0;
            state.table = null;
            state.orderType = "dine-in";
        },

        updateTable: (state, action) => {
            state.table = action.payload.table;
        }

    }
})


export const { setCustomer, setOrderType, removeCustomer, updateTable } = customerSlice.actions;
export default customerSlice.reducer;