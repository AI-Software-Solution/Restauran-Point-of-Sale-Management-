const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
const sharp = require('sharp');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Storage configuration - memory storage for Sharp processing
const memoryStorage = multer.memoryStorage();

// Disk storage for non-resized files
const diskStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const folder = req.body.folder || 'general';
        const folderPath = path.join(uploadsDir, folder);

        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
        }

        cb(null, folderPath);
    },
    filename: (req, file, cb) => {
        const uniqueId = crypto.randomBytes(8).toString('hex');
        const ext = path.extname(file.originalname);
        cb(null, `${Date.now()}-${uniqueId}${ext}`);
    }
});

// File filter - only images
const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/svg+xml'
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, GIF, WebP, and SVG allowed.'), false);
    }
};

// Multer upload instance (disk storage - original)
const upload = multer({
    storage: diskStorage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Multer upload instance with memory storage (for Sharp processing)
const uploadWithResize = multer({
    storage: memoryStorage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit before resize
    }
});

// Process and resize image middleware
const processImage = async (req, res, next) => {
    if (!req.file) {
        return next();
    }

    try {
        const folder = req.body.folder || 'products';
        const folderPath = path.join(uploadsDir, folder);

        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
        }

        const uniqueId = crypto.randomBytes(8).toString('hex');
        const filename = `${Date.now()}-${uniqueId}.webp`;
        const filepath = path.join(folderPath, filename);

        // Resize to 400x400 and convert to WebP for better compression
        await sharp(req.file.buffer)
            .resize(400, 400, {
                fit: 'cover',
                position: 'center'
            })
            .webp({ quality: 85 })
            .toFile(filepath);

        // Add file info to request
        req.file.filename = filename;
        req.file.path = filepath;
        req.file.folder = folder;
        req.file.url = `/uploads/${folder}/${filename}`;

        next();
    } catch (error) {
        console.error('Image processing error:', error);
        next(error);
    }
};

// Process image with custom size
const processImageWithSize = (width, height) => async (req, res, next) => {
    if (!req.file) {
        return next();
    }

    try {
        const folder = req.body.folder || 'images';
        const folderPath = path.join(uploadsDir, folder);

        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
        }

        const uniqueId = crypto.randomBytes(8).toString('hex');
        const filename = `${Date.now()}-${uniqueId}.webp`;
        const filepath = path.join(folderPath, filename);

        // Resize to custom size
        await sharp(req.file.buffer)
            .resize(width, height, {
                fit: 'cover',
                position: 'center'
            })
            .webp({ quality: 85 })
            .toFile(filepath);

        req.file.filename = filename;
        req.file.path = filepath;
        req.file.folder = folder;
        req.file.url = `/uploads/${folder}/${filename}`;

        next();
    } catch (error) {
        console.error('Image processing error:', error);
        next(error);
    }
};

module.exports = {
    upload,
    uploadWithResize,
    processImage,
    processImageWithSize,
    uploadsDir
};
