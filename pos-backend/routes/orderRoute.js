const express = require("express");
const { addOrder, getOrders, getOrderById, updateOrder, deleteOrders } = require("../controllers/orderController");
const { isVerifiedUser } = require("../middlewares/tokenVerification");
const router = express.Router();

// All order routes require authentication
router.route("/").post(isVerifiedUser, addOrder);
router.route("/").get(isVerifiedUser, getOrders);
router.route("/:id").get(isVerifiedUser, getOrderById);
router.route("/:id").put(isVerifiedUser, updateOrder);
router.route("/:id").delete(isVerifiedUser, deleteOrders)

module.exports = router;