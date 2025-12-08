const Razorpay = require("razorpay");
const config = require("../config/config");
const crypto = require("crypto");
const { Payment, Order, Table } = require("../models");
const createHttpError = require("http-errors");

// Initialize Razorpay (if keys are configured)
let razorpay = null;
if (config.razorpayKeyId && config.razorpaySecretKey) {
    razorpay = new Razorpay({
        key_id: config.razorpayKeyId,
        key_secret: config.razorpaySecretKey
    });
}

const createOrder = async (req, res, next) => {
    try {
        if (!razorpay) {
            const error = createHttpError(500, "Razorpay is not configured");
            return next(error);
        }

        const { amount } = req.body;
        const options = {
            amount: amount * 100, // Amount in paisa (1 INR = 100 paisa)
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);
        res.status(200).json({ success: true, order });
    } catch (error) {
        next(error);
    }
};

const verifyPayment = async (req, res, next) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const expectedSignature = crypto
            .createHmac("sha256", config.razorpaySecretKey)
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest("hex");

        if (expectedSignature === razorpay_signature) {
            res.json({ success: true, message: "Payment verified successfully!" });
        } else {
            const error = createHttpError(400, "Payment verification failed!");
            return next(error);
        }
    } catch (error) {
        next(error);
    }
};

const webHookVerification = async (req, res, next) => {
    try {
        const secret = config.razorpayWebhookSecret;
        const signature = req.headers["x-razorpay-signature"];

        const body = JSON.stringify(req.body);

        // Verify the signature
        const expectedSignature = crypto
            .createHmac("sha256", secret)
            .update(body)
            .digest("hex");

        if (expectedSignature === signature) {
            // Process payment
            if (req.body.event === "payment.captured") {
                const payment = req.body.payload.payment.entity;

                // Add Payment Details in Database using Sequelize
                const paymentRecord = await Payment.create({
                    paymentId: payment.id,
                    orderId: payment.order_id,
                    amount: payment.amount / 100,
                    currency: payment.currency,
                    status: payment.status,
                    method: payment.method,
                    email: payment.email,
                    contact: payment.contact,
                    createdAt: new Date(payment.created_at * 1000)
                });

                // Find and update the Order status to Completed
                // payment.notes contains our internal orderId
                if (payment.notes && payment.notes.internalOrderId) {
                    const order = await Order.findByPk(payment.notes.internalOrderId);
                    if (order) {
                        await order.update({
                            orderStatus: 'Completed',
                            paymentStatus: 'Paid',
                            paidAt: new Date()
                        });

                        // Update Table status to Available
                        if (order.tableId) {
                            await Table.update(
                                { status: 'Available', currentOrderId: null },
                                { where: { id: order.tableId } }
                            );
                        }
                    }
                }
            }

            // Handle payment failed event
            if (req.body.event === "payment.failed") {
                const payment = req.body.payload.payment.entity;

                // Log failed payment
                await Payment.create({
                    paymentId: payment.id,
                    orderId: payment.order_id,
                    amount: payment.amount / 100,
                    currency: payment.currency,
                    status: 'failed',
                    method: payment.method,
                    email: payment.email,
                    contact: payment.contact,
                    createdAt: new Date(payment.created_at * 1000)
                });
            }

            res.json({ success: true });
        } else {
            const error = createHttpError(400, "Invalid Signature!");
            return next(error);
        }
    } catch (error) {
        next(error);
    }
};

module.exports = { createOrder, verifyPayment, webHookVerification };
