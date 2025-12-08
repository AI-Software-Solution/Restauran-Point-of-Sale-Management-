const createHttpError = require("http-errors");
const jwt = require("jsonwebtoken");
const config = require("../config/config");
const { User } = require("../models");

const isVerifiedUser = async (req, res, next) => {
    try {
        // Check cookie first, then Authorization header
        let accessToken = req.cookies?.accessToken;

        // If no cookie, check Authorization header (Bearer token)
        if (!accessToken && req.headers.authorization) {
            const authHeader = req.headers.authorization;
            if (authHeader.startsWith('Bearer ')) {
                accessToken = authHeader.substring(7);
            }
        }

        if (!accessToken) {
            const error = createHttpError(401, "Please provide token!");
            return next(error);
        }

        const decodeToken = jwt.verify(accessToken, config.accessTokenSecret);

        // Use Sequelize findByPk instead of Mongoose findById
        const user = await User.findByPk(decodeToken._id);
        if (!user) {
            const error = createHttpError(401, "User not exist!");
            return next(error);
        }

        // Check if user account is active
        if (user.status === false) {
            const error = createHttpError(401, "Account is disabled. Please contact administrator.");
            return next(error);
        }

        // Add id property for compatibility
        req.user = { ...user.toJSON(), id: user.id, _id: user.id };
        next();

    } catch (error) {
        const err = createHttpError(401, "Invalid Token!");
        next(err);
    }
};

const isAdminOrOwner = async (req, res, next) => {
    try {
        // Check cookie first, then Authorization header
        let accessToken = req.cookies?.accessToken;

        // If no cookie, check Authorization header (Bearer token)
        if (!accessToken && req.headers.authorization) {
            const authHeader = req.headers.authorization;
            if (authHeader.startsWith('Bearer ')) {
                accessToken = authHeader.substring(7);
            }
        }

        if (!accessToken) {
            const error = createHttpError(401, "Please provide token!");
            return next(error);
        }

        const decodeToken = jwt.verify(accessToken, config.accessTokenSecret);

        const user = await User.findByPk(decodeToken._id);
        if (!user) {
            const error = createHttpError(401, "User not exist!");
            return next(error);
        }

        // Check if user account is active
        if (user.status === false) {
            const error = createHttpError(401, "Account is disabled. Please contact administrator.");
            return next(error);
        }

        // Check if user is admin or owner
        if (user.role !== 'admin' && user.role !== 'owner') {
            const error = createHttpError(403, "Access denied. Admin or owner role required.");
            return next(error);
        }

        req.user = { ...user.toJSON(), id: user.id, _id: user.id };
        next();

    } catch (error) {
        const err = createHttpError(401, "Invalid Token!");
        next(err);
    }
};

module.exports = { isVerifiedUser, isAdminOrOwner };
