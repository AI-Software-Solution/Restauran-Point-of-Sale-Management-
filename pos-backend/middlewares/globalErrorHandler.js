const config = require("../config/config");
const logger = require("../utils/logger");

const globalErrorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;

    // Log error with Winston
    logger.error({
        message: err.message,
        statusCode,
        stack: err.stack,
        path: req.path,
        method: req.method,
        ip: req.ip
    });

    return res.status(statusCode).json({
        status: statusCode,
        message: err.message,
        errorStack: config.nodeEnv === "development" ? err.stack : ""
    })
}

module.exports = globalErrorHandler;