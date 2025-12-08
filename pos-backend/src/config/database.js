const { Sequelize } = require('sequelize');
const logger = require('../shared/utils/logger');

// Database configuration
const DB_CONFIG = {
    database: process.env.DB_NAME || 'pos_db',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? (msg) => logger.debug(msg) : false,
    pool: {
        max: 20,
        min: 5,
        acquire: 60000,
        idle: 10000
    },
    define: {
        timestamps: true,
        underscored: true,
        freezeTableName: true
    },
    dialectOptions: {
        ssl: process.env.DB_SSL === 'true' ? {
            require: true,
            rejectUnauthorized: false
        } : false
    }
};

// Create Sequelize instance
const sequelize = new Sequelize(
    DB_CONFIG.database,
    DB_CONFIG.username,
    DB_CONFIG.password,
    {
        host: DB_CONFIG.host,
        port: DB_CONFIG.port,
        dialect: DB_CONFIG.dialect,
        logging: DB_CONFIG.logging,
        pool: DB_CONFIG.pool,
        define: DB_CONFIG.define,
        dialectOptions: DB_CONFIG.dialectOptions
    }
);

// Test database connection
const testConnection = async () => {
    try {
        await sequelize.authenticate();
        logger.info('Database connection established successfully');
        return true;
    } catch (error) {
        logger.error('Unable to connect to the database:', error.message);
        return false;
    }
};

// Sync database
const syncDatabase = async (options = {}) => {
    try {
        // Default to alter in development, no action in production
        const defaultOptions = process.env.NODE_ENV === 'development'
            ? { alter: true }
            : {};

        await sequelize.sync({ ...defaultOptions, ...options });
        logger.info('Database synced successfully');
        return true;
    } catch (error) {
        logger.error('Database sync failed:', error.message);
        return false;
    }
};

// Close database connection
const closeConnection = async () => {
    try {
        await sequelize.close();
        logger.info('Database connection closed');
    } catch (error) {
        logger.error('Error closing database connection:', error.message);
    }
};

// Transaction helper
const withTransaction = async (callback) => {
    const transaction = await sequelize.transaction();
    try {
        const result = await callback(transaction);
        await transaction.commit();
        return result;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

module.exports = {
    sequelize,
    Sequelize,
    testConnection,
    syncDatabase,
    closeConnection,
    withTransaction,
    DB_CONFIG
};
