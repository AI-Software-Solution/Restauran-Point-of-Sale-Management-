const Product = require("../models/productModel");
const Category = require("../models/categoryModel");
const Table = require("../models/tableModel");
const Order = require("../models/orderModel");
const User = require("../models/userModel");

const statistics = async (req, res, next) => {
  try {
    const categories = await Category.find();
    const products = await Product.find();
    const tables = await Table.find();
    const users = await User.find();
    const orders = await Order.find();
    const inProgressCount = orders.filter(order => order.orderStatus === "In Progress").length;
    const revenue = orders.reduce((sum, order) => {
      return sum + (order.bills?.totalWithTax || 0);
    }, 0);
    return res.status(200).json({
      totalCategories: categories.length,
      totalProducts: products.length,
      totalTable: tables.length,
      totalUsers: users.length,
      totalOrders: orders.length,
      totalRevenue: revenue,
      activeOrders: inProgressCount
    });
  } catch (error) {
    next(error)
  }
};

module.exports = statistics
