const Product = require("../models/productModel");
const Category = require("../models/categoryModel");
const Table = require("../models/tableModel");
const Order = require("../models/orderModel");
const User = require("../models/userModel");

const dayjs = require('dayjs');
const isBetween = require('dayjs/plugin/isBetween');
const isSameOrAfter = require('dayjs/plugin/isSameOrAfter');
dayjs.extend(isBetween);
dayjs.extend(isSameOrAfter);

const statistics = async (req, res, next) => {
  try {
    const categories = await Category.find();
    const products = await Product.find();
    const tables = await Table.find();
    const users = await User.find();
    const orders = await Order.find();

    const now = dayjs();

    const startOfToday = now.startOf('day');
    const startOfWeek = now.startOf('week');
    const startOfMonth = now.startOf('month');
    const startOfYear = now.startOf('year');

    let totalRevenue = 0;
    let dailyRevenue = 0;
    let weeklyRevenue = 0;
    let monthlyRevenue = 0;
    let yearlyRevenue = 0;
    let inProgressCount = 0;

    const dailyRevenueHistory = Array(6).fill(0);    // 4-hour chunks
    const weeklyRevenueHistory = Array(7).fill(0);   // per day (Sun to Sat)
    const monthlyRevenueHistory = Array(4).fill(0);  // 4 weeks
    const yearlyRevenueHistory = Array(12).fill(0);  // Jan to Dec

    for (const order of orders) {
      const orderDate = dayjs(order.createdAt);
      const amount = order.bills?.totalWithTax || 0;

      totalRevenue += amount;

      if (order.orderStatus === "In Progress") {
        inProgressCount++;
      }

      // Time comparisons
      if (orderDate.isSameOrAfter(startOfToday)) {
        dailyRevenue += amount;

        const hour = orderDate.hour();
        const partIndex = Math.floor(hour / 4); // 0 to 5
        dailyRevenueHistory[partIndex] += amount;
      }

      if (orderDate.isSameOrAfter(startOfWeek)) {
        weeklyRevenue += amount;

        const weekday = orderDate.day(); // 0 = Sunday
        weeklyRevenueHistory[weekday] += amount;
      }

      if (orderDate.isSameOrAfter(startOfMonth)) {
        monthlyRevenue += amount;

        const dayOfMonth = orderDate.date(); // 1-based
        const weekIndex = Math.floor((dayOfMonth - 1) / 7); // 0 to 3
        monthlyRevenueHistory[Math.min(weekIndex, 3)] += amount;
      }

      if (orderDate.isSameOrAfter(startOfYear)) {
        yearlyRevenue += amount;

        const monthIndex = orderDate.month(); // 0 = January
        yearlyRevenueHistory[monthIndex] += amount;
      }
    }

    return res.status(200).json({
      totalCategories: categories.length,
      totalProducts: products.length,
      totalTable: tables.length,
      totalUsers: users.length,
      totalOrders: orders.length,
      activeOrders: inProgressCount,
      totalRevenue,
    
      dailyRevenue,
      dailyRevenueHistory,
      dailyRevenueLabels: [
        "00:00–04:00", "04:00–08:00", "08:00–12:00",
        "12:00–16:00", "16:00–20:00", "20:00–00:00"
      ],
    
      weeklyRevenue,
      weeklyRevenueHistory,
      weeklyRevenueLabels: [
        "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
      ],
    
      monthlyRevenue,
      monthlyRevenueHistory,
      monthlyRevenueLabels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    
      yearlyRevenue,
      yearlyRevenueHistory,
      yearlyRevenueLabels: [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ]
    });
    

  } catch (error) {
    next(error);
  }
};

module.exports = statistics;
