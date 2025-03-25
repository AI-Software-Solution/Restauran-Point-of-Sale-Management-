const express = require("express");
const router = express.Router();
const { isVerifiedUser } = require("../middlewares/tokenVerification");
const { createOrder, verifyPayment, webHookVerification } = require("../controllers/paymentController");
 
router.route("/create-order").post(createOrder);
router.route("/verify-payment").post(verifyPayment);
router.route("/webhook-verification").post(webHookVerification);


module.exports = router;