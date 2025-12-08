const { HTTP_STATUS } = require('../constants');

/**
 * Standard API response helper
 */
class ApiResponse {
    /**
     * Success response
     */
    static success(res, data = null, message = 'Success', statusCode = HTTP_STATUS.OK) {
        return res.status(statusCode).json({
            success: true,
            message,
            data
        });
    }

    /**
     * Created response
     */
    static created(res, data = null, message = 'Resource created successfully') {
        return this.success(res, data, message, HTTP_STATUS.CREATED);
    }

    /**
     * No content response
     */
    static noContent(res) {
        return res.status(HTTP_STATUS.NO_CONTENT).send();
    }

    /**
     * Paginated response
     */
    static paginated(res, { data, page, limit, total, totalPages }) {
        return res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Success',
            data,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        });
    }

    /**
     * Error response
     */
    static error(res, message = 'An error occurred', statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, errors = null) {
        const response = {
            success: false,
            message
        };

        if (errors) {
            response.errors = errors;
        }

        return res.status(statusCode).json(response);
    }

    /**
     * Bad request response
     */
    static badRequest(res, message = 'Bad request', errors = null) {
        return this.error(res, message, HTTP_STATUS.BAD_REQUEST, errors);
    }

    /**
     * Unauthorized response
     */
    static unauthorized(res, message = 'Unauthorized') {
        return this.error(res, message, HTTP_STATUS.UNAUTHORIZED);
    }

    /**
     * Forbidden response
     */
    static forbidden(res, message = 'Forbidden') {
        return this.error(res, message, HTTP_STATUS.FORBIDDEN);
    }

    /**
     * Not found response
     */
    static notFound(res, message = 'Resource not found') {
        return this.error(res, message, HTTP_STATUS.NOT_FOUND);
    }

    /**
     * Conflict response
     */
    static conflict(res, message = 'Resource already exists') {
        return this.error(res, message, HTTP_STATUS.CONFLICT);
    }

    /**
     * Validation error response
     */
    static validationError(res, errors) {
        return this.error(res, 'Validation error', HTTP_STATUS.UNPROCESSABLE_ENTITY, errors);
    }

    /**
     * Too many requests response
     */
    static tooManyRequests(res, message = 'Too many requests') {
        return this.error(res, message, HTTP_STATUS.TOO_MANY_REQUESTS);
    }

    /**
     * Internal server error response
     */
    static internalError(res, message = 'Internal server error') {
        return this.error(res, message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
}

module.exports = ApiResponse;
