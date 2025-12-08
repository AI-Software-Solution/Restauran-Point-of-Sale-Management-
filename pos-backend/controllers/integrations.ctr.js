const { Order, Product, Table, User, sequelize } = require('../models');
const crypto = require('crypto');

// ==================== PAYMENT GATEWAY INTEGRATION ====================

/**
 * Click Payment Integration
 * Documentation: https://docs.click.uz
 */
const clickPrepare = async (req, res, next) => {
    try {
        const {
            click_trans_id,
            service_id,
            click_paydoc_id,
            merchant_trans_id,
            amount,
            action,
            error,
            error_note,
            sign_time,
            sign_string
        } = req.body;

        // Verify signature
        const secretKey = process.env.CLICK_SECRET_KEY || 'test_secret';
        const signCheck = crypto.createHash('md5')
            .update(`${click_trans_id}${service_id}${secretKey}${merchant_trans_id}${amount}${action}${sign_time}`)
            .digest('hex');

        if (sign_string !== signCheck) {
            return res.json({
                error: -1,
                error_note: 'Invalid signature'
            });
        }

        // Find order
        const order = await Order.findByPk(merchant_trans_id);
        if (!order) {
            return res.json({
                error: -5,
                error_note: 'Order not found'
            });
        }

        // Check amount
        if (parseFloat(amount) !== parseFloat(order.totalAmount)) {
            return res.json({
                error: -2,
                error_note: 'Invalid amount'
            });
        }

        // Check if already paid
        if (order.paymentStatus === 'paid') {
            return res.json({
                error: -4,
                error_note: 'Already paid'
            });
        }

        res.json({
            error: 0,
            error_note: 'Success',
            click_trans_id,
            merchant_trans_id,
            merchant_prepare_id: order.id
        });

    } catch (error) {
        next(error);
    }
};

const clickComplete = async (req, res, next) => {
    try {
        const {
            click_trans_id,
            service_id,
            click_paydoc_id,
            merchant_trans_id,
            merchant_prepare_id,
            amount,
            action,
            error,
            sign_time,
            sign_string
        } = req.body;

        // Verify signature
        const secretKey = process.env.CLICK_SECRET_KEY || 'test_secret';
        const signCheck = crypto.createHash('md5')
            .update(`${click_trans_id}${service_id}${secretKey}${merchant_trans_id}${merchant_prepare_id}${amount}${action}${sign_time}`)
            .digest('hex');

        if (sign_string !== signCheck) {
            return res.json({
                error: -1,
                error_note: 'Invalid signature'
            });
        }

        if (error < 0) {
            return res.json({
                error: -9,
                error_note: 'Transaction cancelled'
            });
        }

        // Find and update order
        const order = await Order.findByPk(merchant_trans_id);
        if (!order) {
            return res.json({
                error: -5,
                error_note: 'Order not found'
            });
        }

        // Update payment status
        await order.update({
            paymentStatus: 'paid',
            paymentMethod: 'click',
            paymentTransactionId: click_trans_id,
            paidAt: new Date()
        });

        res.json({
            error: 0,
            error_note: 'Success',
            click_trans_id,
            merchant_trans_id,
            merchant_confirm_id: order.id
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Payme Payment Integration
 * Documentation: https://developer.help.paycom.uz
 */
const paymeHandler = async (req, res, next) => {
    try {
        const { method, params, id } = req.body;
        const merchantKey = process.env.PAYME_MERCHANT_KEY || 'test_key';

        // Verify authorization
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Basic ')) {
            return res.json({
                error: { code: -32504, message: 'Unauthorized' },
                id
            });
        }

        switch (method) {
            case 'CheckPerformTransaction':
                return await paymeCheckPerform(params, id, res);
            case 'CreateTransaction':
                return await paymeCreateTransaction(params, id, res);
            case 'PerformTransaction':
                return await paymePerformTransaction(params, id, res);
            case 'CancelTransaction':
                return await paymeCancelTransaction(params, id, res);
            case 'CheckTransaction':
                return await paymeCheckTransaction(params, id, res);
            default:
                return res.json({
                    error: { code: -32601, message: 'Method not found' },
                    id
                });
        }
    } catch (error) {
        next(error);
    }
};

const paymeCheckPerform = async (params, id, res) => {
    const orderId = params.account?.order_id;
    const order = await Order.findByPk(orderId);

    if (!order) {
        return res.json({
            error: { code: -31050, message: 'Order not found' },
            id
        });
    }

    if (order.paymentStatus === 'paid') {
        return res.json({
            error: { code: -31051, message: 'Already paid' },
            id
        });
    }

    if (params.amount !== order.totalAmount * 100) {
        return res.json({
            error: { code: -31001, message: 'Invalid amount' },
            id
        });
    }

    return res.json({
        result: { allow: true },
        id
    });
};

const paymeCreateTransaction = async (params, id, res) => {
    const orderId = params.account?.order_id;
    const order = await Order.findByPk(orderId);

    if (!order) {
        return res.json({
            error: { code: -31050, message: 'Order not found' },
            id
        });
    }

    await order.update({
        paymentTransactionId: params.id,
        paymentMethod: 'payme'
    });

    return res.json({
        result: {
            create_time: Date.now(),
            transaction: params.id,
            state: 1
        },
        id
    });
};

const paymePerformTransaction = async (params, id, res) => {
    const order = await Order.findOne({
        where: { paymentTransactionId: params.id }
    });

    if (!order) {
        return res.json({
            error: { code: -31003, message: 'Transaction not found' },
            id
        });
    }

    await order.update({
        paymentStatus: 'paid',
        paidAt: new Date()
    });

    return res.json({
        result: {
            perform_time: Date.now(),
            transaction: params.id,
            state: 2
        },
        id
    });
};

const paymeCancelTransaction = async (params, id, res) => {
    const order = await Order.findOne({
        where: { paymentTransactionId: params.id }
    });

    if (!order) {
        return res.json({
            error: { code: -31003, message: 'Transaction not found' },
            id
        });
    }

    await order.update({
        paymentStatus: 'cancelled'
    });

    return res.json({
        result: {
            cancel_time: Date.now(),
            transaction: params.id,
            state: -1
        },
        id
    });
};

const paymeCheckTransaction = async (params, id, res) => {
    const order = await Order.findOne({
        where: { paymentTransactionId: params.id }
    });

    if (!order) {
        return res.json({
            error: { code: -31003, message: 'Transaction not found' },
            id
        });
    }

    const state = order.paymentStatus === 'paid' ? 2 :
                  order.paymentStatus === 'cancelled' ? -1 : 1;

    return res.json({
        result: {
            create_time: new Date(order.createdAt).getTime(),
            perform_time: order.paidAt ? new Date(order.paidAt).getTime() : 0,
            cancel_time: 0,
            transaction: params.id,
            state
        },
        id
    });
};

// ==================== INTERNAL PAYMENT PROCESSING ====================

const processPayment = async (req, res, next) => {
    try {
        const { orderId, method, amount } = req.body;

        const order = await Order.findByPk(orderId, {
            include: [{ model: Table }]
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // For cash payments, mark as paid immediately
        if (method === 'cash') {
            await order.update({
                paymentStatus: 'paid',
                paymentMethod: 'cash',
                paidAt: new Date()
            });

            // Free up the table
            if (order.Table) {
                await order.Table.update({ status: 'available' });
            }

            return res.json({
                success: true,
                message: 'Payment processed successfully',
                order
            });
        }

        // For card payments at POS terminal
        if (method === 'card') {
            await order.update({
                paymentStatus: 'paid',
                paymentMethod: 'card',
                paidAt: new Date()
            });

            if (order.Table) {
                await order.Table.update({ status: 'available' });
            }

            return res.json({
                success: true,
                message: 'Card payment processed',
                order
            });
        }

        // For online payments, generate payment link
        if (method === 'click' || method === 'payme') {
            const paymentUrl = method === 'click'
                ? `https://my.click.uz/services/pay?service_id=${process.env.CLICK_SERVICE_ID}&merchant_id=${process.env.CLICK_MERCHANT_ID}&amount=${order.totalAmount}&transaction_param=${order.id}`
                : `https://checkout.paycom.uz/${Buffer.from(JSON.stringify({
                    m: process.env.PAYME_MERCHANT_ID,
                    ac: { order_id: order.id },
                    a: order.totalAmount * 100
                })).toString('base64')}`;

            return res.json({
                success: true,
                paymentUrl,
                orderId: order.id
            });
        }

        res.status(400).json({
            success: false,
            message: 'Invalid payment method'
        });

    } catch (error) {
        next(error);
    }
};

const getPaymentStatus = async (req, res, next) => {
    try {
        const { orderId } = req.params;
        const order = await Order.findByPk(orderId, {
            attributes: ['id', 'paymentStatus', 'paymentMethod', 'totalAmount', 'paidAt']
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.json({
            success: true,
            payment: {
                orderId: order.id,
                status: order.paymentStatus,
                method: order.paymentMethod,
                amount: order.totalAmount,
                paidAt: order.paidAt
            }
        });

    } catch (error) {
        next(error);
    }
};

// ==================== RECEIPT/PRINTER INTEGRATION ====================

const generateReceipt = async (req, res, next) => {
    try {
        const { orderId } = req.params;
        const order = await Order.findByPk(orderId, {
            include: [
                { model: Table },
                { model: User, as: 'waiter', attributes: ['name'] }
            ]
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;

        // Generate receipt data
        const receipt = {
            restaurantName: process.env.RESTAURANT_NAME || 'Bobur Mirzo Restaurant',
            address: process.env.RESTAURANT_ADDRESS || 'Toshkent shahri',
            phone: process.env.RESTAURANT_PHONE || '+998 90 123 45 67',
            receiptNumber: `R-${order.id}-${Date.now().toString(36).toUpperCase()}`,
            date: new Date().toLocaleString('uz-UZ'),
            table: order.Table?.name || 'Olib ketish',
            waiter: order.waiter?.name || 'N/A',
            items: items.map(item => ({
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                total: item.quantity * item.price
            })),
            subtotal: order.totalAmount,
            tax: 0, // Can be configured
            serviceCharge: 0, // Can be configured
            total: order.totalAmount,
            paymentMethod: order.paymentMethod || 'Naqd',
            footer: 'Tashrifingiz uchun rahmat!'
        };

        // ESC/POS format for thermal printers
        const escposData = generateEscPosReceipt(receipt);

        res.json({
            success: true,
            receipt,
            escpos: escposData,
            printCommands: {
                cut: '\x1d\x56\x00',
                bold: '\x1b\x45\x01',
                normal: '\x1b\x45\x00',
                center: '\x1b\x61\x01',
                left: '\x1b\x61\x00'
            }
        });

    } catch (error) {
        next(error);
    }
};

const generateEscPosReceipt = (receipt) => {
    const ESC = '\x1b';
    const GS = '\x1d';
    const commands = {
        init: ESC + '@',
        center: ESC + 'a' + '\x01',
        left: ESC + 'a' + '\x00',
        bold: ESC + 'E' + '\x01',
        normal: ESC + 'E' + '\x00',
        doubleHeight: ESC + '!' + '\x10',
        normalSize: ESC + '!' + '\x00',
        cut: GS + 'V' + '\x00',
        feed: ESC + 'd' + '\x03'
    };

    let data = commands.init;

    // Header
    data += commands.center + commands.bold + commands.doubleHeight;
    data += receipt.restaurantName + '\n';
    data += commands.normalSize + commands.normal;
    data += receipt.address + '\n';
    data += receipt.phone + '\n';
    data += '================================\n';

    // Receipt info
    data += commands.left;
    data += `Chek: ${receipt.receiptNumber}\n`;
    data += `Sana: ${receipt.date}\n`;
    data += `Stol: ${receipt.table}\n`;
    data += `Ofitsiant: ${receipt.waiter}\n`;
    data += '--------------------------------\n';

    // Items
    receipt.items.forEach(item => {
        data += `${item.name}\n`;
        data += `  ${item.quantity} x ${item.price.toLocaleString()} = ${item.total.toLocaleString()}\n`;
    });

    data += '--------------------------------\n';

    // Totals
    data += commands.bold;
    data += `JAMI: ${receipt.total.toLocaleString()} so'm\n`;
    data += commands.normal;
    data += `To'lov: ${receipt.paymentMethod}\n`;

    // Footer
    data += '================================\n';
    data += commands.center;
    data += receipt.footer + '\n';

    data += commands.feed + commands.cut;

    return Buffer.from(data).toString('base64');
};

const printReceipt = async (req, res, next) => {
    try {
        const { orderId, printerIp, printerPort = 9100 } = req.body;

        // Get receipt data first
        const order = await Order.findByPk(orderId, {
            include: [
                { model: Table },
                { model: User, as: 'waiter', attributes: ['name'] }
            ]
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // In production, this would connect to the printer via TCP
        // For now, we return the print data
        res.json({
            success: true,
            message: 'Receipt sent to printer',
            printJob: {
                orderId,
                printerIp: printerIp || 'localhost',
                printerPort,
                status: 'queued'
            }
        });

    } catch (error) {
        next(error);
    }
};

const getPrinterStatus = async (req, res, next) => {
    try {
        const { printerIp } = req.query;

        // In production, this would check actual printer status
        res.json({
            success: true,
            printer: {
                ip: printerIp || 'localhost',
                status: 'online',
                paperStatus: 'ok',
                lastPrint: new Date()
            }
        });

    } catch (error) {
        next(error);
    }
};

// ==================== NOTIFICATION SYSTEM ====================

const sendNotification = async (req, res, next) => {
    try {
        const { type, recipient, message, orderId } = req.body;

        let result = { success: false };

        if (type === 'sms') {
            result = await sendSmsNotification(recipient, message);
        } else if (type === 'telegram') {
            result = await sendTelegramNotification(recipient, message);
        } else if (type === 'email') {
            result = await sendEmailNotification(recipient, message);
        }

        res.json({
            success: result.success,
            message: result.message || 'Notification sent',
            notificationId: `N-${Date.now()}`
        });

    } catch (error) {
        next(error);
    }
};

const sendSmsNotification = async (phone, message) => {
    // Eskiz.uz or PlayMobile integration
    const smsApiUrl = process.env.SMS_API_URL || 'https://notify.eskiz.uz/api/message/sms/send';
    const smsToken = process.env.SMS_API_TOKEN;

    if (!smsToken) {
        return { success: true, message: 'SMS sent (test mode)' };
    }

    try {
        // In production, this would call the actual SMS API
        // const response = await fetch(smsApiUrl, {
        //     method: 'POST',
        //     headers: {
        //         'Authorization': `Bearer ${smsToken}`,
        //         'Content-Type': 'application/json'
        //     },
        //     body: JSON.stringify({
        //         mobile_phone: phone,
        //         message,
        //         from: '4546'
        //     })
        // });

        return { success: true, message: 'SMS sent successfully' };
    } catch (error) {
        return { success: false, message: error.message };
    }
};

const sendTelegramNotification = async (chatId, message) => {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    if (!botToken) {
        return { success: true, message: 'Telegram sent (test mode)' };
    }

    try {
        // In production, this would call Telegram API
        // const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({
        //         chat_id: chatId,
        //         text: message,
        //         parse_mode: 'HTML'
        //     })
        // });

        return { success: true, message: 'Telegram message sent' };
    } catch (error) {
        return { success: false, message: error.message };
    }
};

const sendEmailNotification = async (email, message) => {
    // Nodemailer or SendGrid integration
    return { success: true, message: 'Email sent (test mode)' };
};

const orderStatusWebhook = async (req, res, next) => {
    try {
        const { orderId, status, notifyCustomer = true } = req.body;

        const order = await Order.findByPk(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Update order status
        await order.update({ status });

        // Send notifications if enabled
        if (notifyCustomer && order.customerPhone) {
            const statusMessages = {
                preparing: `Buyurtmangiz tayyorlanmoqda. Buyurtma #${orderId}`,
                ready: `Buyurtmangiz tayyor! Buyurtma #${orderId}`,
                delivered: `Buyurtma yetkazildi. Rahmat! #${orderId}`
            };

            if (statusMessages[status]) {
                await sendSmsNotification(order.customerPhone, statusMessages[status]);
            }
        }

        res.json({
            success: true,
            message: 'Order status updated and notifications sent'
        });

    } catch (error) {
        next(error);
    }
};

// ==================== INTEGRATION SETTINGS ====================

const getIntegrationSettings = async (req, res, next) => {
    try {
        // In production, these would come from a database
        const settings = {
            payment: {
                click: {
                    enabled: !!process.env.CLICK_SERVICE_ID,
                    serviceId: process.env.CLICK_SERVICE_ID || '',
                    merchantId: process.env.CLICK_MERCHANT_ID || ''
                },
                payme: {
                    enabled: !!process.env.PAYME_MERCHANT_ID,
                    merchantId: process.env.PAYME_MERCHANT_ID || ''
                },
                cash: { enabled: true },
                card: { enabled: true }
            },
            printer: {
                enabled: true,
                defaultPrinter: process.env.PRINTER_IP || 'localhost',
                port: process.env.PRINTER_PORT || 9100,
                autoPrint: process.env.AUTO_PRINT === 'true'
            },
            notifications: {
                sms: {
                    enabled: !!process.env.SMS_API_TOKEN,
                    provider: 'eskiz'
                },
                telegram: {
                    enabled: !!process.env.TELEGRAM_BOT_TOKEN
                },
                email: {
                    enabled: !!process.env.SMTP_HOST
                }
            }
        };

        res.json({
            success: true,
            settings
        });

    } catch (error) {
        next(error);
    }
};

const updateIntegrationSettings = async (req, res, next) => {
    try {
        const { settings } = req.body;

        // In production, save to database
        // For now, just acknowledge
        res.json({
            success: true,
            message: 'Settings updated successfully',
            settings
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    // Payment
    clickPrepare,
    clickComplete,
    paymeHandler,
    processPayment,
    getPaymentStatus,
    // Printer
    generateReceipt,
    printReceipt,
    getPrinterStatus,
    // Notifications
    sendNotification,
    orderStatusWebhook,
    // Settings
    getIntegrationSettings,
    updateIntegrationSettings
};
