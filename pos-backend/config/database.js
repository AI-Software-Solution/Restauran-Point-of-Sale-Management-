const { Sequelize } = require('sequelize');
const config = require('./config');

const sequelize = new Sequelize(
    config.database.name,
    config.database.user,
    config.database.password,
    {
        host: config.database.host,
        port: config.database.port,
        dialect: 'postgres',
        logging: config.nodeEnv === 'development' ? console.log : false,

        pool: {
            max: config.database.pool.max,
            min: config.database.pool.min,
            acquire: config.database.pool.acquire,
            idle: config.database.pool.idle
        },

        define: {
            timestamps: true,
            underscored: true,
            freezeTableName: true
        }
    }
);

const seedDefaultAdmin = async () => {
    try {
        const { User } = require('../models');

        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;
        const adminName = process.env.ADMIN_NAME || 'Admin';
        const adminPhone = process.env.ADMIN_PHONE || '+998000000000';

        if (!adminEmail || !adminPassword) {
            console.log('⚠️  ADMIN_EMAIL and ADMIN_PASSWORD not set, skipping admin seeding');
            return;
        }

        const existingAdmin = await User.findOne({ where: { email: adminEmail } });
        if (existingAdmin) {
            console.log('✅ Default admin already exists');
            return;
        }

        await User.create({
            name: adminName,
            email: adminEmail,
            password: adminPassword,
            phone: adminPhone,
            role: 'admin',
            status: true
        });

        console.log('✅ Default admin user created');
    } catch (error) {
        console.log(`⚠️  Admin seeding failed: ${error.message}`);
    }
};

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ PostgreSQL Connected successfully');

        // Sync models - only sync new tables, don't alter existing ones
        try {
            await sequelize.sync({ force: false });
            console.log('✅ Database synchronized');
        } catch (syncError) {
            console.log(`⚠️  Database sync warning: ${syncError.message}`);
            console.log('✅ Continuing with existing schema');
        }

        // Seed default admin user
        await seedDefaultAdmin();
    } catch (error) {
        console.log(`❌ Database connection failed: ${error.message}`);
        process.exit(1);
    }
};

module.exports = { sequelize, connectDB };
