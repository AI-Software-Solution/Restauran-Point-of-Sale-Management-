// Order status enum
const ORDER_STATUS = {
    PENDING: 'Pending',
    IN_PROGRESS: 'In Progress',
    READY: 'Ready',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled'
};

// Payment status enum
const PAYMENT_STATUS = {
    PENDING: 'pending',
    COMPLETED: 'completed',
    FAILED: 'failed',
    REFUNDED: 'refunded',
    CANCELLED: 'cancelled'
};

// Payment methods
const PAYMENT_METHODS = {
    CASH: 'Cash',
    ONLINE: 'Online',
    CARD: 'Card',
    CLICK: 'Click',
    PAYME: 'Payme',
    SPLIT: 'Split'
};

// Order types
const ORDER_TYPES = {
    DINE_IN: 'dine-in',
    TAKEAWAY: 'takeaway',
    DELIVERY: 'delivery'
};

// Table status
const TABLE_STATUS = {
    AVAILABLE: 'Available',
    BOOKED: 'Booked',
    RESERVED: 'Reserved',
    CLEANING: 'Cleaning'
};

// Reservation status
const RESERVATION_STATUS = {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    SEATED: 'seated',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    NO_SHOW: 'no_show'
};

// User roles
const USER_ROLES = {
    SUPER_ADMIN: 'super_admin',
    OWNER: 'owner',
    MANAGER: 'manager',
    CASHIER: 'cashier',
    WAITER: 'waiter',
    KITCHEN: 'kitchen',
    INVENTORY: 'inventory'
};

// Permissions
const PERMISSIONS = {
    // Orders
    ORDERS_CREATE: 'orders.create',
    ORDERS_VIEW: 'orders.view',
    ORDERS_UPDATE: 'orders.update',
    ORDERS_VOID: 'orders.void',
    ORDERS_REFUND: 'orders.refund',

    // Products
    PRODUCTS_VIEW: 'products.view',
    PRODUCTS_CREATE: 'products.create',
    PRODUCTS_UPDATE: 'products.update',
    PRODUCTS_DELETE: 'products.delete',

    // Categories
    CATEGORIES_VIEW: 'categories.view',
    CATEGORIES_MANAGE: 'categories.manage',

    // Tables
    TABLES_VIEW: 'tables.view',
    TABLES_MANAGE: 'tables.manage',

    // Payments
    PAYMENTS_VIEW: 'payments.view',
    PAYMENTS_PROCESS: 'payments.process',
    PAYMENTS_REFUND: 'payments.refund',

    // Reports
    REPORTS_VIEW: 'reports.view',
    REPORTS_FINANCIAL: 'reports.financial',
    REPORTS_EXPORT: 'reports.export',

    // Inventory
    INVENTORY_VIEW: 'inventory.view',
    INVENTORY_MANAGE: 'inventory.manage',
    INVENTORY_ADJUST: 'inventory.adjust',

    // Users
    USERS_VIEW: 'users.view',
    USERS_CREATE: 'users.create',
    USERS_UPDATE: 'users.update',
    USERS_DELETE: 'users.delete',

    // Settings
    SETTINGS_VIEW: 'settings.view',
    SETTINGS_MODIFY: 'settings.modify',

    // Kitchen
    KITCHEN_VIEW: 'kitchen.view',
    KITCHEN_UPDATE: 'kitchen.update',

    // Customers
    CUSTOMERS_VIEW: 'customers.view',
    CUSTOMERS_MANAGE: 'customers.manage',

    // Reservations
    RESERVATIONS_VIEW: 'reservations.view',
    RESERVATIONS_MANAGE: 'reservations.manage'
};

// Role permissions mapping
const ROLE_PERMISSIONS = {
    [USER_ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS),
    [USER_ROLES.OWNER]: Object.values(PERMISSIONS),
    [USER_ROLES.MANAGER]: [
        PERMISSIONS.ORDERS_CREATE, PERMISSIONS.ORDERS_VIEW, PERMISSIONS.ORDERS_UPDATE,
        PERMISSIONS.ORDERS_VOID, PERMISSIONS.ORDERS_REFUND,
        PERMISSIONS.PRODUCTS_VIEW, PERMISSIONS.PRODUCTS_CREATE, PERMISSIONS.PRODUCTS_UPDATE,
        PERMISSIONS.CATEGORIES_VIEW, PERMISSIONS.CATEGORIES_MANAGE,
        PERMISSIONS.TABLES_VIEW, PERMISSIONS.TABLES_MANAGE,
        PERMISSIONS.PAYMENTS_VIEW, PERMISSIONS.PAYMENTS_PROCESS, PERMISSIONS.PAYMENTS_REFUND,
        PERMISSIONS.REPORTS_VIEW, PERMISSIONS.REPORTS_EXPORT,
        PERMISSIONS.INVENTORY_VIEW, PERMISSIONS.INVENTORY_MANAGE, PERMISSIONS.INVENTORY_ADJUST,
        PERMISSIONS.USERS_VIEW,
        PERMISSIONS.SETTINGS_VIEW,
        PERMISSIONS.KITCHEN_VIEW, PERMISSIONS.KITCHEN_UPDATE,
        PERMISSIONS.CUSTOMERS_VIEW, PERMISSIONS.CUSTOMERS_MANAGE,
        PERMISSIONS.RESERVATIONS_VIEW, PERMISSIONS.RESERVATIONS_MANAGE
    ],
    [USER_ROLES.CASHIER]: [
        PERMISSIONS.ORDERS_CREATE, PERMISSIONS.ORDERS_VIEW, PERMISSIONS.ORDERS_UPDATE,
        PERMISSIONS.PRODUCTS_VIEW,
        PERMISSIONS.CATEGORIES_VIEW,
        PERMISSIONS.TABLES_VIEW,
        PERMISSIONS.PAYMENTS_VIEW, PERMISSIONS.PAYMENTS_PROCESS,
        PERMISSIONS.CUSTOMERS_VIEW
    ],
    [USER_ROLES.WAITER]: [
        PERMISSIONS.ORDERS_CREATE, PERMISSIONS.ORDERS_VIEW, PERMISSIONS.ORDERS_UPDATE,
        PERMISSIONS.PRODUCTS_VIEW,
        PERMISSIONS.CATEGORIES_VIEW,
        PERMISSIONS.TABLES_VIEW,
        PERMISSIONS.RESERVATIONS_VIEW
    ],
    [USER_ROLES.KITCHEN]: [
        PERMISSIONS.ORDERS_VIEW,
        PERMISSIONS.KITCHEN_VIEW, PERMISSIONS.KITCHEN_UPDATE
    ],
    [USER_ROLES.INVENTORY]: [
        PERMISSIONS.PRODUCTS_VIEW,
        PERMISSIONS.INVENTORY_VIEW, PERMISSIONS.INVENTORY_MANAGE, PERMISSIONS.INVENTORY_ADJUST
    ]
};

// Loyalty tiers
const LOYALTY_TIERS = {
    BRONZE: { name: 'Bronze', minPoints: 0, discount: 0 },
    SILVER: { name: 'Silver', minPoints: 10000, discount: 5 },
    GOLD: { name: 'Gold', minPoints: 50000, discount: 10 },
    PLATINUM: { name: 'Platinum', minPoints: 100000, discount: 15 }
};

// HTTP Status codes
const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503
};

// Pagination defaults
const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100
};

// Tax rate (can be overridden per location)
const DEFAULT_TAX_RATE = 5.25;

// Currency
const DEFAULT_CURRENCY = 'UZS';

module.exports = {
    ORDER_STATUS,
    PAYMENT_STATUS,
    PAYMENT_METHODS,
    ORDER_TYPES,
    TABLE_STATUS,
    RESERVATION_STATUS,
    USER_ROLES,
    PERMISSIONS,
    ROLE_PERMISSIONS,
    LOYALTY_TIERS,
    HTTP_STATUS,
    PAGINATION,
    DEFAULT_TAX_RATE,
    DEFAULT_CURRENCY
};
