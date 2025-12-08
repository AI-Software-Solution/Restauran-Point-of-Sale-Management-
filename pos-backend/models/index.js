const { sequelize } = require('../config/database');
const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');

// ==================== USER MODEL ====================
const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    phone: {
        type: DataTypes.STRING(20),
        allowNull: false,
        validate: {
            is: /^\+998\d{9}$/
        }
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    role: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
            isIn: {
                args: [['admin', 'owner', 'cashier', 'waiter']],
                msg: 'Role must be one of: admin, owner, cashier, waiter'
            }
        }
    },
    status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'users',
    timestamps: true,
    underscored: true,
    hooks: {
        beforeCreate: async (user) => {
            if (user.password) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
            }
        },
        beforeUpdate: async (user) => {
            if (user.changed('password')) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
            }
        }
    }
});

// ==================== CATEGORY MODEL ====================
const Category = sequelize.define('Category', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    image: {
        type: DataTypes.STRING(500),
        allowNull: true
        // Rasm URL yoki path
    },
    sortOrder: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'sort_order'
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        field: 'is_active'
    }
}, {
    tableName: 'categories',
    timestamps: true,
    underscored: true
});

// ==================== PRODUCT MODEL ====================
const Product = sequelize.define('Product', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    image: {
        type: DataTypes.STRING(500),
        allowNull: true
        // Mahsulot rasmi URL yoki path
    },
    categoryId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'category_id',
        references: {
            model: 'categories',
            key: 'id'
        }
    },
    sortOrder: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'sort_order'
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        field: 'is_active'
    }
}, {
    tableName: 'products',
    timestamps: true,
    underscored: true,
    indexes: [
        { fields: ['category_id'] },
        { fields: ['is_active'] },
        { fields: ['sort_order'] },
        { fields: ['category_id', 'is_active'] } // Composite index
    ]
});

// ==================== MODIFIER GROUP MODEL ====================
// Modifikator guruhi (O'lcham, Qo'shimchalar, Soslar)
const ModifierGroup = sequelize.define('ModifierGroup', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false
        // "O'lcham", "Qo'shimchalar", "Soslar"
    },
    type: {
        type: DataTypes.ENUM('single', 'multiple'),
        defaultValue: 'single'
        // single = faqat 1 ta tanlash, multiple = bir nechta tanlash
    },
    required: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
        // Majburiy yoki ixtiyoriy
    },
    minSelect: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'min_select'
        // multiple uchun minimal tanlash soni
    },
    maxSelect: {
        type: DataTypes.INTEGER,
        defaultValue: 10,
        field: 'max_select'
        // multiple uchun maksimal tanlash soni
    },
    sortOrder: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'sort_order'
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        field: 'is_active'
    }
}, {
    tableName: 'modifier_groups',
    timestamps: true,
    underscored: true
});

// ==================== MODIFIER MODEL ====================
// Individual modifikator (Kichik, O'rta, Katta)
const Modifier = sequelize.define('Modifier', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    groupId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'group_id',
        references: {
            model: 'modifier_groups',
            key: 'id'
        }
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false
        // "Kichik", "O'rta", "Katta"
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
        // Qo'shimcha narx (0 = bepul)
    },
    isDefault: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'is_default'
        // Default tanlangan
    },
    sortOrder: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'sort_order'
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        field: 'is_active'
    }
}, {
    tableName: 'modifiers',
    timestamps: true,
    underscored: true
});

// ==================== PRODUCT MODIFIER GROUP MODEL ====================
// Mahsulot va Modifikator guruhi bog'lanishi
const ProductModifierGroup = sequelize.define('ProductModifierGroup', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'product_id',
        references: {
            model: 'products',
            key: 'id'
        }
    },
    modifierGroupId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'modifier_group_id',
        references: {
            model: 'modifier_groups',
            key: 'id'
        }
    },
    sortOrder: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'sort_order'
    }
}, {
    tableName: 'product_modifier_groups',
    timestamps: true,
    underscored: true
});

// ==================== ORDER MODEL ====================
const Order = sequelize.define('Order', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    customerDetails: {
        type: DataTypes.JSONB,
        allowNull: false,
        field: 'customer_details'
    },
    orderStatus: {
        type: DataTypes.ENUM('Pending', 'In Progress', 'Ready', 'Completed', 'Cancelled'),
        allowNull: false,
        defaultValue: 'Pending',
        field: 'order_status'
    },
    orderDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'order_date'
    },
    bills: {
        type: DataTypes.JSONB,
        allowNull: false
    },
    items: {
        type: DataTypes.JSONB,
        defaultValue: []
    },
    tableId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'table_id'
    },
    paymentMethod: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'payment_method'
    },
    paymentData: {
        type: DataTypes.JSONB,
        allowNull: true,
        field: 'payment_data'
    },
    paymentStatus: {
        type: DataTypes.STRING(50),
        defaultValue: 'pending',
        field: 'payment_status'
        // pending, paid, failed, cancelled, refunded
    },
    paymentTransactionId: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'payment_transaction_id'
    },
    paidAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'paid_at'
    },
    totalAmount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
        field: 'total_amount'
    },
    customerPhone: {
        type: DataTypes.STRING(20),
        allowNull: true,
        field: 'customer_phone'
    },
    waiterId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'waiter_id',
        references: {
            model: 'users',
            key: 'id'
        }
    }
}, {
    tableName: 'orders',
    timestamps: true,
    underscored: true,
    indexes: [
        { fields: ['order_status'] },
        { fields: ['created_at'] },
        { fields: ['table_id'] },
        { fields: ['customer_phone'] },
        { fields: ['order_status', 'created_at'] } // Composite index
    ]
});

// ==================== FLOOR/ZONE MODEL ====================
const Floor = sequelize.define('Floor', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false
        // "Asosiy zal", "Teras", "VIP xona", etc.
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    width: {
        type: DataTypes.INTEGER,
        defaultValue: 800
        // Floor plan canvas width in pixels
    },
    height: {
        type: DataTypes.INTEGER,
        defaultValue: 600
        // Floor plan canvas height in pixels
    },
    backgroundColor: {
        type: DataTypes.STRING(20),
        defaultValue: '#2d2d2d',
        field: 'background_color'
    },
    sortOrder: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'sort_order'
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        field: 'is_active'
    }
}, {
    tableName: 'floors',
    timestamps: true,
    underscored: true
});

// ==================== TABLE MODEL ====================
const Table = sequelize.define('Table', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    tableNo: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        field: 'table_no'
    },
    status: {
        type: DataTypes.STRING(50),
        defaultValue: 'Available'
        // Available, Occupied, Reserved, Cleaning
    },
    seats: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    currentOrderId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'current_order_id'
    },
    // Floor Plan positioning
    floorId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'floor_id',
        references: {
            model: 'floors',
            key: 'id'
        }
    },
    posX: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'pos_x'
        // X koordinata (piksel)
    },
    posY: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'pos_y'
        // Y koordinata (piksel)
    },
    width: {
        type: DataTypes.INTEGER,
        defaultValue: 80
        // Stol kengligi (piksel)
    },
    height: {
        type: DataTypes.INTEGER,
        defaultValue: 80
        // Stol balandligi (piksel)
    },
    shape: {
        type: DataTypes.STRING(20),
        defaultValue: 'rectangle'
        // rectangle, circle, square
    },
    rotation: {
        type: DataTypes.INTEGER,
        defaultValue: 0
        // Rotation angle (0-360)
    }
}, {
    tableName: 'tables',
    timestamps: true,
    underscored: true
});

// ==================== PAYMENT MODEL ====================
const Payment = sequelize.define('Payment', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    paymentId: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'payment_id'
    },
    orderId: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'order_id'
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: 0
        }
    },
    currency: {
        type: DataTypes.STRING(10),
        allowNull: false,
        defaultValue: 'UZS'
    },
    status: {
        type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded', 'cancelled'),
        allowNull: false,
        defaultValue: 'pending'
    },
    method: {
        type: DataTypes.ENUM('cash', 'card', 'online', 'transfer'),
        allowNull: false,
        defaultValue: 'cash'
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: true,
        validate: {
            isEmail: true
        }
    },
    contact: {
        type: DataTypes.STRING(50),
        allowNull: true
    }
}, {
    tableName: 'payments',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: false
});

// ==================== LANDING CONTENT MODEL ====================
const LandingContent = sequelize.define('LandingContent', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    section: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    contentKey: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'content_key'
    },
    contentValue: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'content_value'
    },
    imageUrl: {
        type: DataTypes.STRING(500),
        allowNull: true,
        field: 'image_url'
    },
    displayOrder: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'display_order'
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        field: 'is_active'
    }
}, {
    tableName: 'landing_content',
    timestamps: true,
    underscored: true
});

// ==================== TESTIMONIAL MODEL ====================
const Testimonial = sequelize.define('Testimonial', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    customerName: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'customer_name'
    },
    customerImage: {
        type: DataTypes.STRING(500),
        allowNull: true,
        field: 'customer_image'
    },
    rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 5,
        validate: {
            min: 1,
            max: 5
        }
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        field: 'is_active'
    },
    displayOrder: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'display_order'
    }
}, {
    tableName: 'testimonials',
    timestamps: true,
    underscored: true
});

// ==================== MEDIA FILE MODEL ====================
const MediaFile = sequelize.define('MediaFile', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    filename: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    originalName: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'original_name'
    },
    mimeType: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'mime_type'
    },
    size: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    url: {
        type: DataTypes.STRING(500),
        allowNull: false
    },
    folder: {
        type: DataTypes.STRING(100),
        defaultValue: 'general'
    },
    uploadedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'uploaded_by',
        references: {
            model: 'users',
            key: 'id'
        }
    }
}, {
    tableName: 'media_files',
    timestamps: true,
    underscored: true,
    updatedAt: false
});

// ==================== SUPPLIER MODEL ====================
const Supplier = sequelize.define('Supplier', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    contactPerson: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'contact_person'
    },
    phone: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    address: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        field: 'is_active'
    }
}, {
    tableName: 'suppliers',
    timestamps: true,
    underscored: true
});

// ==================== INGREDIENT MODEL ====================
const Ingredient = sequelize.define('Ingredient', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    sku: {
        type: DataTypes.STRING(50),
        allowNull: true,
        unique: true
        // Ichki kod (SKU - Stock Keeping Unit)
    },
    barcode: {
        type: DataTypes.STRING(100),
        allowNull: true,
        unique: true
        // EAN-13, UPC, QR kod yoki boshqa barcode
    },
    unit: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'kg' // kg, g, l, ml, dona, pachka
    },
    currentStock: {
        type: DataTypes.DECIMAL(10, 3),
        defaultValue: 0,
        field: 'current_stock'
    },
    minStock: {
        type: DataTypes.DECIMAL(10, 3),
        defaultValue: 0,
        field: 'min_stock'
    },
    costPerUnit: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
        field: 'cost_per_unit'
    },
    supplierId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'supplier_id',
        references: {
            model: 'suppliers',
            key: 'id'
        }
    },
    categoryName: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'category_name' // Go'sht, Sabzavot, Ichimlik, Ziravorlar, etc.
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        field: 'is_active'
    }
}, {
    tableName: 'ingredients',
    timestamps: true,
    underscored: true
});

// ==================== INVENTORY TRANSACTION MODEL ====================
const InventoryTransaction = sequelize.define('InventoryTransaction', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    ingredientId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'ingredient_id',
        references: {
            model: 'ingredients',
            key: 'id'
        }
    },
    type: {
        type: DataTypes.ENUM('in', 'out', 'adjustment', 'waste'),
        allowNull: false
        // in: kirim, out: chiqim, adjustment: tuzatish, waste: isrof
    },
    quantity: {
        type: DataTypes.DECIMAL(10, 3),
        allowNull: false
    },
    previousStock: {
        type: DataTypes.DECIMAL(10, 3),
        allowNull: true,
        field: 'previous_stock'
    },
    newStock: {
        type: DataTypes.DECIMAL(10, 3),
        allowNull: true,
        field: 'new_stock'
    },
    unitCost: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        field: 'unit_cost'
    },
    totalCost: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
        field: 'total_cost'
    },
    supplierId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'supplier_id',
        references: {
            model: 'suppliers',
            key: 'id'
        }
    },
    orderId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'order_id'
    },
    note: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    performedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'performed_by',
        references: {
            model: 'users',
            key: 'id'
        }
    }
}, {
    tableName: 'inventory_transactions',
    timestamps: true,
    underscored: true
});

// ==================== PRODUCT INGREDIENT (RECIPE) MODEL ====================
const ProductIngredient = sequelize.define('ProductIngredient', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'product_id',
        references: {
            model: 'products',
            key: 'id'
        }
    },
    ingredientId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'ingredient_id',
        references: {
            model: 'ingredients',
            key: 'id'
        }
    },
    quantity: {
        type: DataTypes.DECIMAL(10, 3),
        allowNull: false
        // Mahsulot uchun zarur bo'lgan ingredient miqdori
    }
}, {
    tableName: 'product_ingredients',
    timestamps: true,
    underscored: true
});

// ==================== INVENTORY ALERT MODEL ====================
const InventoryAlert = sequelize.define('InventoryAlert', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    ingredientId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'ingredient_id',
        references: {
            model: 'ingredients',
            key: 'id'
        }
    },
    alertType: {
        type: DataTypes.ENUM('low_stock', 'out_of_stock', 'expiring'),
        allowNull: false,
        field: 'alert_type'
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    isResolved: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'is_resolved'
    },
    resolvedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'resolved_at'
    },
    resolvedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'resolved_by',
        references: {
            model: 'users',
            key: 'id'
        }
    }
}, {
    tableName: 'inventory_alerts',
    timestamps: true,
    underscored: true
});

// ==================== ASSOCIATIONS ====================

// Category has many Products
Category.hasMany(Product, {
    foreignKey: 'categoryId',
    as: 'products',
    onDelete: 'SET NULL'
});
Product.belongsTo(Category, {
    foreignKey: 'categoryId',
    as: 'category'
});

// Table has one current Order
Table.belongsTo(Order, {
    foreignKey: 'currentOrderId',
    as: 'currentOrder'
});

// Order belongs to Table
Order.belongsTo(Table, {
    foreignKey: 'tableId',
    as: 'table'
});

// Order belongs to User (waiter)
Order.belongsTo(User, {
    foreignKey: 'waiterId',
    as: 'waiter'
});

// MediaFile belongs to User
MediaFile.belongsTo(User, {
    foreignKey: 'uploadedBy',
    as: 'uploader'
});

// Supplier has many Ingredients
Supplier.hasMany(Ingredient, {
    foreignKey: 'supplierId',
    as: 'ingredients'
});
Ingredient.belongsTo(Supplier, {
    foreignKey: 'supplierId',
    as: 'supplier'
});

// Ingredient has many InventoryTransactions
Ingredient.hasMany(InventoryTransaction, {
    foreignKey: 'ingredientId',
    as: 'transactions'
});
InventoryTransaction.belongsTo(Ingredient, {
    foreignKey: 'ingredientId',
    as: 'ingredient'
});

// InventoryTransaction belongs to Supplier
InventoryTransaction.belongsTo(Supplier, {
    foreignKey: 'supplierId',
    as: 'supplier'
});

// InventoryTransaction belongs to User (performedBy)
InventoryTransaction.belongsTo(User, {
    foreignKey: 'performedBy',
    as: 'performer'
});

// Product has many ProductIngredients (Recipe)
Product.hasMany(ProductIngredient, {
    foreignKey: 'productId',
    as: 'recipe'
});
ProductIngredient.belongsTo(Product, {
    foreignKey: 'productId',
    as: 'product'
});

// Ingredient has many ProductIngredients
Ingredient.hasMany(ProductIngredient, {
    foreignKey: 'ingredientId',
    as: 'productIngredients'
});
ProductIngredient.belongsTo(Ingredient, {
    foreignKey: 'ingredientId',
    as: 'ingredient'
});

// Ingredient has many InventoryAlerts
Ingredient.hasMany(InventoryAlert, {
    foreignKey: 'ingredientId',
    as: 'alerts'
});
InventoryAlert.belongsTo(Ingredient, {
    foreignKey: 'ingredientId',
    as: 'ingredient'
});

// InventoryAlert resolved by User
InventoryAlert.belongsTo(User, {
    foreignKey: 'resolvedBy',
    as: 'resolver'
});

// Floor has many Tables
Floor.hasMany(Table, {
    foreignKey: 'floorId',
    as: 'tables'
});
Table.belongsTo(Floor, {
    foreignKey: 'floorId',
    as: 'floor'
});

// ==================== MODIFIER ASSOCIATIONS ====================

// ModifierGroup has many Modifiers
ModifierGroup.hasMany(Modifier, {
    foreignKey: 'groupId',
    as: 'modifiers',
    onDelete: 'CASCADE'
});
Modifier.belongsTo(ModifierGroup, {
    foreignKey: 'groupId',
    as: 'group'
});

// Product <-> ModifierGroup (Many-to-Many through ProductModifierGroup)
Product.belongsToMany(ModifierGroup, {
    through: ProductModifierGroup,
    foreignKey: 'productId',
    otherKey: 'modifierGroupId',
    as: 'modifierGroups'
});
ModifierGroup.belongsToMany(Product, {
    through: ProductModifierGroup,
    foreignKey: 'modifierGroupId',
    otherKey: 'productId',
    as: 'products'
});

// ProductModifierGroup associations for include queries
ProductModifierGroup.belongsTo(Product, {
    foreignKey: 'productId',
    as: 'product'
});
ProductModifierGroup.belongsTo(ModifierGroup, {
    foreignKey: 'modifierGroupId',
    as: 'modifierGroup'
});

// ==================== ACTIVITY LOG MODEL ====================
const ActivityLog = sequelize.define('ActivityLog', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'user_id',
        references: {
            model: 'users',
            key: 'id'
        }
    },
    action: {
        type: DataTypes.STRING(100),
        allowNull: false
        // login, logout, create_order, update_order, create_product, etc.
    },
    entityType: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'entity_type'
        // order, product, user, table, category, etc.
    },
    entityId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'entity_id'
    },
    details: {
        type: DataTypes.JSONB,
        allowNull: true
        // Additional details about the action
    },
    ipAddress: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'ip_address'
    },
    userAgent: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'user_agent'
    }
}, {
    tableName: 'activity_logs',
    timestamps: true,
    underscored: true,
    updatedAt: false
});

// ==================== SYSTEM SETTINGS MODEL ====================
const SystemSetting = sequelize.define('SystemSetting', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    key: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
    },
    value: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    valueType: {
        type: DataTypes.STRING(20),
        defaultValue: 'string',
        field: 'value_type'
        // string, number, boolean, json
    },
    category: {
        type: DataTypes.STRING(50),
        defaultValue: 'general'
        // general, appearance, notifications, business, tax, etc.
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    isPublic: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'is_public'
        // If true, accessible without authentication
    }
}, {
    tableName: 'system_settings',
    timestamps: true,
    underscored: true
});

// ActivityLog belongs to User
ActivityLog.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
});

// ==================== BILL SPLIT MODEL ====================
const BillSplit = sequelize.define('BillSplit', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    orderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'order_id',
        references: {
            model: 'orders',
            key: 'id'
        }
    },
    splitType: {
        type: DataTypes.ENUM('equal', 'by_item', 'custom'),
        allowNull: false,
        defaultValue: 'equal',
        field: 'split_type'
        // equal: teng bo'lish, by_item: mahsulot bo'yicha, custom: ixtiyoriy
    },
    totalGuests: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 2,
        field: 'total_guests'
    },
    status: {
        type: DataTypes.ENUM('active', 'partial', 'completed'),
        defaultValue: 'active'
        // active: hali to'lanmagan, partial: qisman to'langan, completed: to'liq to'langan
    }
}, {
    tableName: 'bill_splits',
    timestamps: true,
    underscored: true
});

// ==================== GUEST BILL MODEL ====================
const GuestBill = sequelize.define('GuestBill', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    billSplitId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'bill_split_id',
        references: {
            model: 'bill_splits',
            key: 'id'
        }
    },
    guestNumber: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'guest_number'
        // 1, 2, 3... mehmon raqami
    },
    guestName: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'guest_name'
    },
    subtotal: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0
    },
    tax: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0
    },
    total: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0
    },
    paymentStatus: {
        type: DataTypes.ENUM('pending', 'paid'),
        defaultValue: 'pending',
        field: 'payment_status'
    },
    paymentMethod: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'payment_method'
    },
    paidAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'paid_at'
    }
}, {
    tableName: 'guest_bills',
    timestamps: true,
    underscored: true
});

// ==================== GUEST BILL ITEM MODEL ====================
const GuestBillItem = sequelize.define('GuestBillItem', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    guestBillId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'guest_bill_id',
        references: {
            model: 'guest_bills',
            key: 'id'
        }
    },
    productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'product_id'
    },
    productName: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'product_name'
    },
    quantity: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 1
    },
    unitPrice: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        field: 'unit_price'
    },
    totalPrice: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        field: 'total_price'
    }
}, {
    tableName: 'guest_bill_items',
    timestamps: true,
    underscored: true
});

// ==================== COURSE MODEL ====================
const Course = sequelize.define('Course', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false
        // "Appetizer", "Main Course", "Dessert", "Drinks"
    },
    nameUz: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'name_uz'
        // "Salatlar", "Asosiy taom", "Shirinlik", "Ichimliklar"
    },
    displayOrder: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'display_order'
    },
    color: {
        type: DataTypes.STRING(20),
        defaultValue: '#714B67'
    },
    icon: {
        type: DataTypes.STRING(50),
        allowNull: true
        // Icon nomi yoki emoji
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        field: 'is_active'
    }
}, {
    tableName: 'courses',
    timestamps: true,
    underscored: true
});

// ==================== ORDER COURSE MODEL ====================
const OrderCourse = sequelize.define('OrderCourse', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    orderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'order_id',
        references: {
            model: 'orders',
            key: 'id'
        }
    },
    courseId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'course_id',
        references: {
            model: 'courses',
            key: 'id'
        }
    },
    courseStatus: {
        type: DataTypes.ENUM('waiting', 'fired', 'preparing', 'ready', 'served'),
        defaultValue: 'waiting',
        field: 'course_status'
        // waiting: kutmoqda, fired: oshxonaga yuborildi, preparing: tayyorlanmoqda, ready: tayyor, served: berildi
    },
    firedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'fired_at'
        // Oshxonaga yuborilgan vaqt
    },
    readyAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'ready_at'
    },
    servedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'served_at'
    },
    firedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'fired_by',
        references: {
            model: 'users',
            key: 'id'
        }
    }
}, {
    tableName: 'order_courses',
    timestamps: true,
    underscored: true
});

// ==================== ORDER COURSE ITEM MODEL ====================
const OrderCourseItem = sequelize.define('OrderCourseItem', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    orderCourseId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'order_course_id',
        references: {
            model: 'order_courses',
            key: 'id'
        }
    },
    productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'product_id'
    },
    productName: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'product_name'
    },
    quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    itemStatus: {
        type: DataTypes.ENUM('pending', 'preparing', 'ready'),
        defaultValue: 'pending',
        field: 'item_status'
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    modifiers: {
        type: DataTypes.JSONB,
        allowNull: true
        // Tanlangan modifikatorlar
    }
}, {
    tableName: 'order_course_items',
    timestamps: true,
    underscored: true
});

// ==================== TABLE TRANSFER MODEL ====================
const TableTransfer = sequelize.define('TableTransfer', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    orderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'order_id',
        references: {
            model: 'orders',
            key: 'id'
        }
    },
    fromTableId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'from_table_id',
        references: {
            model: 'tables',
            key: 'id'
        }
    },
    toTableId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'to_table_id',
        references: {
            model: 'tables',
            key: 'id'
        }
    },
    transferType: {
        type: DataTypes.ENUM('move', 'merge', 'split'),
        defaultValue: 'move',
        field: 'transfer_type'
        // move: ko'chirish, merge: birlashtirish, split: bo'lish
    },
    reason: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    performedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'performed_by',
        references: {
            model: 'users',
            key: 'id'
        }
    }
}, {
    tableName: 'table_transfers',
    timestamps: true,
    underscored: true
});

// ==================== KITCHEN NOTE MODEL ====================
const KitchenNote = sequelize.define('KitchenNote', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    orderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'order_id',
        references: {
            model: 'orders',
            key: 'id'
        }
    },
    itemIndex: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'item_index'
        // Buyurtma ichidagi mahsulot indeksi (null = butun buyurtma uchun)
    },
    productId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'product_id'
    },
    noteType: {
        type: DataTypes.ENUM('allergy', 'preference', 'instruction', 'warning', 'general'),
        defaultValue: 'general',
        field: 'note_type'
    },
    noteText: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: 'note_text'
    },
    severity: {
        type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
        defaultValue: 'low'
        // critical = allergiya kabi jiddiy holatlar
    },
    isAcknowledged: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'is_acknowledged'
        // Oshxona tomonidan ko'rildi
    },
    acknowledgedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'acknowledged_at'
    },
    acknowledgedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'acknowledged_by',
        references: {
            model: 'users',
            key: 'id'
        }
    }
}, {
    tableName: 'kitchen_notes',
    timestamps: true,
    underscored: true
});

// ==================== ALLERGY PRESET MODEL ====================
const AllergyPreset = sequelize.define('AllergyPreset', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false
        // "Gluten", "Nuts", "Dairy", "Shellfish", etc.
    },
    nameUz: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'name_uz'
    },
    icon: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    color: {
        type: DataTypes.STRING(20),
        defaultValue: '#DC3545'
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        field: 'is_active'
    }
}, {
    tableName: 'allergy_presets',
    timestamps: true,
    underscored: true
});

// ==================== TIP MODEL ====================
const Tip = sequelize.define('Tip', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    orderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'order_id',
        references: {
            model: 'orders',
            key: 'id'
        }
    },
    waiterId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'waiter_id',
        references: {
            model: 'users',
            key: 'id'
        }
    },
    amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false
    },
    percentage: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true
        // Agar foiz bo'yicha hisoblangan bo'lsa
    },
    paymentMethod: {
        type: DataTypes.STRING(50),
        defaultValue: 'cash',
        field: 'payment_method'
    },
    isDistributed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'is_distributed'
        // Pool tizimida taqsimlangan yoki yo'q
    }
}, {
    tableName: 'tips',
    timestamps: true,
    underscored: true
});

// ==================== TIP DISTRIBUTION MODEL ====================
const TipDistribution = sequelize.define('TipDistribution', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    tipId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'tip_id',
        references: {
            model: 'tips',
            key: 'id'
        }
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'user_id',
        references: {
            model: 'users',
            key: 'id'
        }
    },
    shareAmount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        field: 'share_amount'
    },
    sharePercentage: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        field: 'share_percentage'
    }
}, {
    tableName: 'tip_distributions',
    timestamps: true,
    underscored: true
});

// ==================== LOYALTY PROGRAM MODEL ====================
const LoyaltyProgram = sequelize.define('LoyaltyProgram', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        defaultValue: 'Default Loyalty'
    },
    pointsPerCurrency: {
        type: DataTypes.DECIMAL(10, 4),
        defaultValue: 0.01,
        field: 'points_per_currency'
        // 1 so'm = 0.01 ball (100 so'm = 1 ball)
    },
    minRedeemPoints: {
        type: DataTypes.INTEGER,
        defaultValue: 100,
        field: 'min_redeem_points'
    },
    pointValue: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 100,
        field: 'point_value'
        // 1 ball = 100 so'm
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        field: 'is_active'
    }
}, {
    tableName: 'loyalty_programs',
    timestamps: true,
    underscored: true
});

// ==================== LOYALTY MEMBER MODEL ====================
const LoyaltyMember = sequelize.define('LoyaltyMember', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    phone: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    cardNumber: {
        type: DataTypes.STRING(50),
        allowNull: true,
        unique: true,
        field: 'card_number'
    },
    currentPoints: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'current_points'
    },
    totalEarned: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'total_earned'
    },
    totalRedeemed: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'total_redeemed'
    },
    tier: {
        type: DataTypes.ENUM('bronze', 'silver', 'gold', 'platinum'),
        defaultValue: 'bronze'
    },
    totalSpent: {
        type: DataTypes.DECIMAL(14, 2),
        defaultValue: 0,
        field: 'total_spent'
    },
    visitCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'visit_count'
    },
    lastVisit: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'last_visit'
    },
    birthDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        field: 'birth_date'
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        field: 'is_active'
    }
}, {
    tableName: 'loyalty_members',
    timestamps: true,
    underscored: true
});

// ==================== LOYALTY TRANSACTION MODEL ====================
const LoyaltyTransaction = sequelize.define('LoyaltyTransaction', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    memberId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'member_id',
        references: {
            model: 'loyalty_members',
            key: 'id'
        }
    },
    orderId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'order_id',
        references: {
            model: 'orders',
            key: 'id'
        }
    },
    transactionType: {
        type: DataTypes.ENUM('earn', 'redeem', 'expire', 'bonus', 'adjustment'),
        allowNull: false,
        field: 'transaction_type'
    },
    points: {
        type: DataTypes.INTEGER,
        allowNull: false
        // Musbat = qo'shish, Manfiy = ayirish
    },
    orderAmount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
        field: 'order_amount'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    previousBalance: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'previous_balance'
    },
    newBalance: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'new_balance'
    },
    performedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'performed_by',
        references: {
            model: 'users',
            key: 'id'
        }
    }
}, {
    tableName: 'loyalty_transactions',
    timestamps: true,
    underscored: true
});

// ==================== LOYALTY REWARD MODEL ====================
const LoyaltyReward = sequelize.define('LoyaltyReward', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    rewardType: {
        type: DataTypes.ENUM('discount_percentage', 'discount_amount', 'free_item', 'points_multiplier'),
        allowNull: false,
        field: 'reward_type'
    },
    rewardValue: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        field: 'reward_value'
        // Foiz, summa, yoki ko'paytiruvchi
    },
    pointsRequired: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'points_required'
    },
    productId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'product_id'
        // free_item uchun
    },
    minTier: {
        type: DataTypes.ENUM('bronze', 'silver', 'gold', 'platinum'),
        defaultValue: 'bronze',
        field: 'min_tier'
    },
    validFrom: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'valid_from'
    },
    validUntil: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'valid_until'
    },
    maxRedemptions: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'max_redemptions'
    },
    currentRedemptions: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'current_redemptions'
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        field: 'is_active'
    }
}, {
    tableName: 'loyalty_rewards',
    timestamps: true,
    underscored: true
});

// ==================== NEW MODEL ASSOCIATIONS ====================

// BillSplit belongs to Order
BillSplit.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });
Order.hasOne(BillSplit, { foreignKey: 'orderId', as: 'billSplit' });

// BillSplit has many GuestBills
BillSplit.hasMany(GuestBill, { foreignKey: 'billSplitId', as: 'guestBills', onDelete: 'CASCADE' });
GuestBill.belongsTo(BillSplit, { foreignKey: 'billSplitId', as: 'billSplit' });

// GuestBill has many GuestBillItems
GuestBill.hasMany(GuestBillItem, { foreignKey: 'guestBillId', as: 'items', onDelete: 'CASCADE' });
GuestBillItem.belongsTo(GuestBill, { foreignKey: 'guestBillId', as: 'guestBill' });

// Course has many OrderCourses
Course.hasMany(OrderCourse, { foreignKey: 'courseId', as: 'orderCourses' });
OrderCourse.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

// Order has many OrderCourses
Order.hasMany(OrderCourse, { foreignKey: 'orderId', as: 'orderCourses' });
OrderCourse.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

// OrderCourse has many OrderCourseItems
OrderCourse.hasMany(OrderCourseItem, { foreignKey: 'orderCourseId', as: 'items', onDelete: 'CASCADE' });
OrderCourseItem.belongsTo(OrderCourse, { foreignKey: 'orderCourseId', as: 'orderCourse' });

// OrderCourse belongs to User (firedBy)
OrderCourse.belongsTo(User, { foreignKey: 'firedBy', as: 'firedByUser' });

// TableTransfer associations
TableTransfer.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });
TableTransfer.belongsTo(Table, { foreignKey: 'fromTableId', as: 'fromTable' });
TableTransfer.belongsTo(Table, { foreignKey: 'toTableId', as: 'toTable' });
TableTransfer.belongsTo(User, { foreignKey: 'performedBy', as: 'performer' });

// KitchenNote associations
KitchenNote.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });
Order.hasMany(KitchenNote, { foreignKey: 'orderId', as: 'kitchenNotes' });
KitchenNote.belongsTo(User, { foreignKey: 'acknowledgedBy', as: 'acknowledger' });

// Tip associations
Tip.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });
Order.hasMany(Tip, { foreignKey: 'orderId', as: 'tips' });
Tip.belongsTo(User, { foreignKey: 'waiterId', as: 'waiter' });

// TipDistribution associations
Tip.hasMany(TipDistribution, { foreignKey: 'tipId', as: 'distributions', onDelete: 'CASCADE' });
TipDistribution.belongsTo(Tip, { foreignKey: 'tipId', as: 'tip' });
TipDistribution.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// LoyaltyMember associations
LoyaltyMember.hasMany(LoyaltyTransaction, { foreignKey: 'memberId', as: 'transactions' });
LoyaltyTransaction.belongsTo(LoyaltyMember, { foreignKey: 'memberId', as: 'member' });
LoyaltyTransaction.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });
LoyaltyTransaction.belongsTo(User, { foreignKey: 'performedBy', as: 'performer' });

// LoyaltyReward to Product (for free items)
LoyaltyReward.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

module.exports = {
    sequelize,
    User,
    Category,
    Product,
    Order,
    Table,
    Floor,
    Payment,
    LandingContent,
    Testimonial,
    MediaFile,
    // Inventory models
    Supplier,
    Ingredient,
    InventoryTransaction,
    ProductIngredient,
    InventoryAlert,
    // Admin Panel models
    ActivityLog,
    SystemSetting,
    // Modifier models
    ModifierGroup,
    Modifier,
    ProductModifierGroup,
    // Bill Split models
    BillSplit,
    GuestBill,
    GuestBillItem,
    // Course Management models
    Course,
    OrderCourse,
    OrderCourseItem,
    // Table Transfer model
    TableTransfer,
    // Kitchen Notes models
    KitchenNote,
    AllergyPreset,
    // Tips models
    Tip,
    TipDistribution,
    // Loyalty models
    LoyaltyProgram,
    LoyaltyMember,
    LoyaltyTransaction,
    LoyaltyReward
};
