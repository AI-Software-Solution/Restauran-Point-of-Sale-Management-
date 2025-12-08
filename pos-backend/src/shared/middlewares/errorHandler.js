const { HTTP_STATUS } = require('../constants');
const logger = require('../utils/logger');

/**
 * Custom error class for API errors
 */
class AppError extends Error {
    constructor(message, statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.status = statusCode >= 500 ? 'error' : 'fail';

        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Not found handler
 */
const notFoundHandler = (req, res, next) => {
    const error = new AppError(`Route ${req.originalUrl} not found`, HTTP_STATUS.NOT_FOUND);
    next(error);
};

/**
 * Global error handler middleware
 */
const globalErrorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;
    error.statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;

    // Log error
    logger.error('Error:', {
        message: err.message,
        stack: err.stack,
        statusCode: error.statusCode,
        path: req.path,
        method: req.method
    });

    // Sequelize validation error
    if (err.name === 'SequelizeValidationError') {
        const errors = err.errors.map(e => ({
            field: e.path,
            message: e.message
        }));
        error.statusCode = HTTP_STATUS.BAD_REQUEST;
        error.message = 'Validation error';
        return res.status(error.statusCode).json({
            success: false,
            message: error.message,
            errors
        });
    }

    // Sequelize unique constraint error
    if (err.name === 'SequelizeUniqueConstraintError') {
        const field = err.errors[0]?.path || 'field';
        error.statusCode = HTTP_STATUS.CONFLICT;
        error.message = `${field} already exists`;
    }

    // Sequelize foreign key constraint error
    if (err.name === 'SequelizeForeignKeyConstraintError') {
        error.statusCode = HTTP_STATUS.BAD_REQUEST;
        error.message = 'Invalid reference: related resource does not exist';
    }

    // Sequelize database error
    if (err.name === 'SequelizeDatabaseError') {
        error.statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
        error.message = 'Database error';
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        error.statusCode = HTTP_STATUS.UNAUTHORIZED;
        error.message = 'Invalid token';
    }

    if (err.name === 'TokenExpiredError') {
        error.statusCode = HTTP_STATUS.UNAUTHORIZED;
        error.message = 'Token expired';
    }

    // Multer file upload errors
    if (err.code === 'LIMIT_FILE_SIZE') {
        error.statusCode = HTTP_STATUS.BAD_REQUEST;
        error.message = 'File size too large';
    }

    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        error.statusCode = HTTP_STATUS.BAD_REQUEST;
        error.message = 'Unexpected file field';
    }

    // Zod validation errors
    if (err.name === 'ZodError') {
        error.statusCode = HTTP_STATUS.BAD_REQUEST;
        error.message = 'Validation error';
        return res.status(error.statusCode).json({
            success: false,
            message: error.message,
            errors: err.errors.map(e => ({
                field: e.path.join('.'),
                message: e.message
            }))
        });
    }

    // Send response
    const response = {
        success: false,
        message: error.message || 'Internal server error'
    };

    // Include stack trace in development
    if (process.env.NODE_ENV === 'development') {
        response.stack = err.stack;
    }

    res.status(error.statusCode).json(response);
};

/**
 * Async handler wrapper to catch errors in async route handlers
 */
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

module.exports = {
    AppError,
    notFoundHandler,
    globalErrorHandler,
    asyncHandler
};
