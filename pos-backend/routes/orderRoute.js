const express = require("express");
const { addOrder, getOrders, getOrderById, updateOrder, deleteOrders } = require("../controllers/orderController");
const { isVerifiedUser } = require("../middlewares/tokenVerification");
const router = express.Router();


router.route("/").post(addOrder);
router.route("/").get(getOrders);
router.route("/:id").get(getOrderById);
router.route("/:id").put( updateOrder);
router.route("/:id").delete(deleteOrders)

module.exports = router;