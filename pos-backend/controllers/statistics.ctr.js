const Product = require("../models/productModel");
const Category = require("../models/categoryModel");
const Table = require("../models/tableModel");
const Order = require("../models/orderModel");
const User = require("../models/userModel");

const dayjs = require('dayjs');
const isBetween = require('dayjs/plugin/isBetween');
dayjs.extend(isBetween);

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

    for (const order of orders) {
      const orderDate = dayjs(order.createdAt);
      
      const amount = order.bills?.totalWithTax || 0;

      totalRevenue += amount;

      if (order.orderStatus === "In Progress") {
        inProgressCount++;
      }

      if (orderDate.isAfter(startOfToday)) dailyRevenue += amount;
      if (orderDate.isAfter(startOfWeek)) weeklyRevenue += amount;
      if (orderDate.isAfter(startOfMonth)) monthlyRevenue += amount;
      if (orderDate.isAfter(startOfYear)) yearlyRevenue += amount;
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
      weeklyRevenue,
      monthlyRevenue,
      yearlyRevenue
    });

  } catch (error) {
    next(error);
  }
};


module.exports = statistics
