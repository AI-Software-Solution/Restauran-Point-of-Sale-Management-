const Queue = require('bull');
const logger = require('../shared/utils/logger');

// Queue configuration
const REDIS_CONFIG = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined
};

// Queue names
const QUEUE_NAMES = {
    EMAIL: 'email-queue',
    SMS: 'sms-queue',
    REPORTS: 'reports-queue',
    INVENTORY: 'inventory-queue',
    NOTIFICATIONS: 'notifications-queue',
    ANALYTICS: 'analytics-queue'
};

// Create queues
const queues = {};

const createQueue = (name) => {
    if (queues[name]) {
        return queues[name];
    }

    const queue = new Queue(name, {
        redis: REDIS_CONFIG,
        defaultJobOptions: {
            removeOnComplete: 100,
            removeOnFail: 50,
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 2000
            }
        }
    });

    // Queue event handlers
    queue.on('completed', (job, result) => {
        logger.info(`Job completed`, { queue: name, jobId: job.id, result });
    });

    queue.on('failed', (job, error) => {
        logger.error(`Job failed`, { queue: name, jobId: job.id, error: error.message });
    });

    queue.on('stalled', (job) => {
        logger.warn(`Job stalled`, { queue: name, jobId: job.id });
    });

    queue.on('error', (error) => {
        logger.error(`Queue error`, { queue: name, error: error.message });
    });

    queues[name] = queue;
    return queue;
};

// Initialize all queues
const initializeQueues = () => {
    Object.values(QUEUE_NAMES).forEach(name => {
        createQueue(name);
        logger.info(`Queue initialized: ${name}`);
    });
};

// Job types
const JOB_TYPES = {
    // Email jobs
    SEND_ORDER_CONFIRMATION: 'send_order_confirmation',
    SEND_RECEIPT: 'send_receipt',
    SEND_RESERVATION_CONFIRMATION: 'send_reservation_confirmation',
    SEND_LOYALTY_POINTS_UPDATE: 'send_loyalty_points_update',

    // SMS jobs
    SMS_ORDER_READY: 'sms_order_ready',
    SMS_RESERVATION_REMINDER: 'sms_reservation_reminder',

    // Report jobs
    GENERATE_DAILY_REPORT: 'generate_daily_report',
    GENERATE_WEEKLY_REPORT: 'generate_weekly_report',
    GENERATE_MONTHLY_REPORT: 'generate_monthly_report',
    EXPORT_DATA: 'export_data',

    // Inventory jobs
    CHECK_LOW_STOCK: 'check_low_stock',
    CHECK_EXPIRING_ITEMS: 'check_expiring_items',
    SYNC_INVENTORY: 'sync_inventory',

    // Analytics jobs
    CALCULATE_DAILY_STATS: 'calculate_daily_stats',
    UPDATE_CUSTOMER_ANALYTICS: 'update_customer_analytics',
    GENERATE_AI_INSIGHTS: 'generate_ai_insights'
};

// Job helpers
const jobs = {
    // Add email job
    async sendEmail(type, data, options = {}) {
        const queue = queues[QUEUE_NAMES.EMAIL];
        if (!queue) return null;
        return queue.add(type, data, options);
    },

    // Add SMS job
    async sendSMS(type, data, options = {}) {
        const queue = queues[QUEUE_NAMES.SMS];
        if (!queue) return null;
        return queue.add(type, data, options);
    },

    // Add report generation job
    async generateReport(type, data, options = {}) {
        const queue = queues[QUEUE_NAMES.REPORTS];
        if (!queue) return null;
        return queue.add(type, data, { ...options, priority: 2 });
    },

    // Add inventory check job
    async checkInventory(type, data, options = {}) {
        const queue = queues[QUEUE_NAMES.INVENTORY];
        if (!queue) return null;
        return queue.add(type, data, options);
    },

    // Add notification job
    async sendNotification(data, options = {}) {
        const queue = queues[QUEUE_NAMES.NOTIFICATIONS];
        if (!queue) return null;
        return queue.add('notification', data, options);
    },

    // Add analytics job
    async processAnalytics(type, data, options = {}) {
        const queue = queues[QUEUE_NAMES.ANALYTICS];
        if (!queue) return null;
        return queue.add(type, data, { ...options, priority: 3 });
    },

    // Schedule recurring jobs
    async scheduleRecurringJobs() {
        // Daily stats at midnight
        const analyticsQueue = queues[QUEUE_NAMES.ANALYTICS];
        if (analyticsQueue) {
            await analyticsQueue.add(
                JOB_TYPES.CALCULATE_DAILY_STATS,
                {},
                { repeat: { cron: '0 0 * * *' } }
            );
        }

        // Check low stock every hour
        const inventoryQueue = queues[QUEUE_NAMES.INVENTORY];
        if (inventoryQueue) {
            await inventoryQueue.add(
                JOB_TYPES.CHECK_LOW_STOCK,
                {},
                { repeat: { cron: '0 * * * *' } }
            );
        }

        // Check expiring items daily at 6am
        if (inventoryQueue) {
            await inventoryQueue.add(
                JOB_TYPES.CHECK_EXPIRING_ITEMS,
                {},
                { repeat: { cron: '0 6 * * *' } }
            );
        }

        logger.info('Recurring jobs scheduled');
    }
};

// Get queue by name
const getQueue = (name) => queues[name];

// Graceful shutdown
const closeAllQueues = async () => {
    const closePromises = Object.values(queues).map(queue => queue.close());
    await Promise.all(closePromises);
    logger.info('All queues closed');
};

module.exports = {
    initializeQueues,
    createQueue,
    getQueue,
    closeAllQueues,
    jobs,
    QUEUE_NAMES,
    JOB_TYPES
};
