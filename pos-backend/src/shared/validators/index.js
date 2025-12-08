const { z } = require('zod');
const { ORDER_STATUS, PAYMENT_STATUS, PAYMENT_METHODS, ORDER_TYPES, TABLE_STATUS, RESERVATION_STATUS, USER_ROLES } = require('../constants');

// Common validators
const phoneRegex = /^\+998[0-9]{9}$/;
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Common schemas
const paginationSchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc')
});

const idParamSchema = z.object({
    id: z.string().uuid()
});

// Auth validators
const authSchemas = {
    register: z.object({
        name: z.string().min(2).max(100),
        email: z.string().email(),
        password: z.string().min(8).max(100),
        phone: z.string().regex(phoneRegex, 'Phone must be in format +998XXXXXXXXX'),
        role: z.enum(Object.values(USER_ROLES)).optional().default(USER_ROLES.CASHIER)
    }),

    login: z.object({
        email: z.string().email(),
        password: z.string().min(1)
    }),

    updatePassword: z.object({
        currentPassword: z.string().min(1),
        newPassword: z.string().min(8).max(100)
    })
};

// User validators
const userSchemas = {
    create: z.object({
        name: z.string().min(2).max(100),
        email: z.string().email(),
        password: z.string().min(8).max(100),
        phone: z.string().regex(phoneRegex, 'Phone must be in format +998XXXXXXXXX'),
        role: z.enum(Object.values(USER_ROLES)),
        isActive: z.boolean().optional().default(true)
    }),

    update: z.object({
        name: z.string().min(2).max(100).optional(),
        email: z.string().email().optional(),
        phone: z.string().regex(phoneRegex).optional(),
        role: z.enum(Object.values(USER_ROLES)).optional(),
        isActive: z.boolean().optional()
    })
};

// Product validators
const productSchemas = {
    create: z.object({
        name: z.string().min(1).max(200),
        description: z.string().max(1000).optional(),
        price: z.number().positive(),
        category: z.string().uuid(),
        image: z.string().url().optional(),
        isAvailable: z.boolean().optional().default(true),
        preparationTime: z.number().int().positive().optional(),
        modifierGroups: z.array(z.string().uuid()).optional()
    }),

    update: z.object({
        name: z.string().min(1).max(200).optional(),
        description: z.string().max(1000).optional(),
        price: z.number().positive().optional(),
        category: z.string().uuid().optional(),
        image: z.string().url().optional(),
        isAvailable: z.boolean().optional(),
        preparationTime: z.number().int().positive().optional(),
        modifierGroups: z.array(z.string().uuid()).optional()
    })
};

// Category validators
const categorySchemas = {
    create: z.object({
        name: z.string().min(1).max(100),
        description: z.string().max(500).optional(),
        image: z.string().url().optional(),
        sortOrder: z.number().int().optional()
    }),

    update: z.object({
        name: z.string().min(1).max(100).optional(),
        description: z.string().max(500).optional(),
        image: z.string().url().optional(),
        sortOrder: z.number().int().optional()
    })
};

// Order validators
const orderItemSchema = z.object({
    productId: z.string().uuid(),
    name: z.string(),
    price: z.number().positive(),
    quantity: z.number().int().positive(),
    modifiers: z.array(z.object({
        id: z.string(),
        name: z.string(),
        price: z.number()
    })).optional(),
    notes: z.string().max(500).optional()
});

const orderSchemas = {
    create: z.object({
        customerDetails: z.object({
            name: z.string().min(1).max(100),
            phone: z.string().optional(),
            guests: z.number().int().positive().optional(),
            orderType: z.enum(Object.values(ORDER_TYPES))
        }),
        items: z.array(orderItemSchema).min(1),
        table: z.string().uuid().nullable().optional(),
        paymentMethod: z.enum(Object.values(PAYMENT_METHODS)),
        notes: z.string().max(1000).optional(),
        discount: z.number().min(0).optional(),
        bills: z.object({
            total: z.number().min(0),
            tax: z.number().min(0),
            totalWithTax: z.number().min(0)
        }).optional()
    }),

    updateStatus: z.object({
        orderStatus: z.enum(Object.values(ORDER_STATUS))
    }),

    addItem: z.object({
        item: orderItemSchema
    }),

    removeItem: z.object({
        itemIndex: z.number().int().min(0)
    })
};

// Table validators
const tableSchemas = {
    create: z.object({
        tableNumber: z.number().int().positive(),
        capacity: z.number().int().positive().max(50),
        floor: z.string().uuid().optional(),
        status: z.enum(Object.values(TABLE_STATUS)).optional().default(TABLE_STATUS.AVAILABLE),
        positionX: z.number().optional(),
        positionY: z.number().optional()
    }),

    update: z.object({
        tableNumber: z.number().int().positive().optional(),
        capacity: z.number().int().positive().max(50).optional(),
        floor: z.string().uuid().optional(),
        status: z.enum(Object.values(TABLE_STATUS)).optional(),
        positionX: z.number().optional(),
        positionY: z.number().optional(),
        orderId: z.string().uuid().nullable().optional()
    })
};

// Payment validators
const paymentSchemas = {
    create: z.object({
        orderId: z.string().uuid(),
        amount: z.number().positive(),
        method: z.enum(Object.values(PAYMENT_METHODS)),
        tip: z.number().min(0).optional(),
        splitPayments: z.array(z.object({
            method: z.enum(Object.values(PAYMENT_METHODS)),
            amount: z.number().positive()
        })).optional()
    }),

    refund: z.object({
        reason: z.string().min(1).max(500),
        amount: z.number().positive().optional()
    })
};

// Customer validators
const customerSchemas = {
    create: z.object({
        name: z.string().min(1).max(100),
        phone: z.string().regex(phoneRegex, 'Phone must be in format +998XXXXXXXXX'),
        email: z.string().email().optional(),
        birthday: z.string().datetime().optional(),
        dietaryPreferences: z.array(z.string()).optional(),
        allergies: z.array(z.string()).optional(),
        notes: z.string().max(1000).optional()
    }),

    update: z.object({
        name: z.string().min(1).max(100).optional(),
        phone: z.string().regex(phoneRegex).optional(),
        email: z.string().email().optional(),
        birthday: z.string().datetime().optional(),
        dietaryPreferences: z.array(z.string()).optional(),
        allergies: z.array(z.string()).optional(),
        notes: z.string().max(1000).optional()
    })
};

// Reservation validators
const reservationSchemas = {
    create: z.object({
        customerId: z.string().uuid().optional(),
        customerName: z.string().min(1).max(100),
        customerPhone: z.string().regex(phoneRegex),
        tableId: z.string().uuid(),
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        time: z.string().regex(/^\d{2}:\d{2}$/),
        duration: z.number().int().positive().default(90),
        partySize: z.number().int().positive().max(50),
        specialRequests: z.string().max(1000).optional(),
        deposit: z.number().min(0).optional()
    }),

    update: z.object({
        tableId: z.string().uuid().optional(),
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
        time: z.string().regex(/^\d{2}:\d{2}$/).optional(),
        duration: z.number().int().positive().optional(),
        partySize: z.number().int().positive().max(50).optional(),
        status: z.enum(Object.values(RESERVATION_STATUS)).optional(),
        specialRequests: z.string().max(1000).optional()
    })
};

// Inventory validators
const inventorySchemas = {
    stockAdjustment: z.object({
        productId: z.string().uuid(),
        quantity: z.number().int(),
        reason: z.string().min(1).max(500),
        type: z.enum(['add', 'remove', 'adjust'])
    }),

    purchaseOrder: z.object({
        supplierId: z.string().uuid(),
        items: z.array(z.object({
            productId: z.string().uuid(),
            quantity: z.number().int().positive(),
            unitCost: z.number().positive()
        })).min(1),
        expectedDate: z.string().datetime().optional(),
        notes: z.string().max(1000).optional()
    }),

    supplier: z.object({
        name: z.string().min(1).max(200),
        contact: z.string().max(100).optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        address: z.string().max(500).optional(),
        paymentTerms: z.string().max(200).optional(),
        leadTimeDays: z.number().int().positive().optional()
    })
};

// Validation middleware factory
const validate = (schema) => {
    return (req, res, next) => {
        try {
            const validated = schema.parse(req.body);
            req.validatedBody = validated;
            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation error',
                    errors: error.errors.map(err => ({
                        field: err.path.join('.'),
                        message: err.message
                    }))
                });
            }
            next(error);
        }
    };
};

const validateQuery = (schema) => {
    return (req, res, next) => {
        try {
            const validated = schema.parse(req.query);
            req.validatedQuery = validated;
            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    success: false,
                    message: 'Query validation error',
                    errors: error.errors.map(err => ({
                        field: err.path.join('.'),
                        message: err.message
                    }))
                });
            }
            next(error);
        }
    };
};

const validateParams = (schema) => {
    return (req, res, next) => {
        try {
            const validated = schema.parse(req.params);
            req.validatedParams = validated;
            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    success: false,
                    message: 'Parameter validation error',
                    errors: error.errors.map(err => ({
                        field: err.path.join('.'),
                        message: err.message
                    }))
                });
            }
            next(error);
        }
    };
};

module.exports = {
    // Schemas
    paginationSchema,
    idParamSchema,
    authSchemas,
    userSchemas,
    productSchemas,
    categorySchemas,
    orderSchemas,
    tableSchemas,
    paymentSchemas,
    customerSchemas,
    reservationSchemas,
    inventorySchemas,

    // Middleware
    validate,
    validateQuery,
    validateParams,

    // Zod instance for custom schemas
    z
};
