const createHttpError = require("http-errors");
const { User } = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("../config/config");

require('dotenv').config();

const VALID_ROLES = ['admin', 'owner', 'cashier', 'waiter'];

const createUser = async (req, res, next) => {
    try {
        const { name, phone, email, password, role } = req.body;

        if (!name || !phone || !email || !password || !role) {
            const error = createHttpError(400, "All fields are required!");
            return next(error);
        }

        // Validate role
        if (!VALID_ROLES.includes(role)) {
            const error = createHttpError(400, `Invalid role. Must be one of: ${VALID_ROLES.join(', ')}`);
            return next(error);
        }

        // Role restrictions: Owner can only create cashier and waiter
        if (req.user.role === 'owner' && !['cashier', 'waiter'].includes(role)) {
            const error = createHttpError(403, "Owner can only create cashier or waiter users");
            return next(error);
        }

        const isUserPresent = await User.findOne({ where: { email } });
        if (isUserPresent) {
            const error = createHttpError(400, "User already exist!");
            return next(error);
        }

        const newUser = await User.create({ name, phone, email, password, role });

        res.status(201).json({
            success: true,
            message: "New user created!",
            data: { ...newUser.toJSON(), _id: newUser.id }
        });

    } catch (error) {
        next(error);
    }
};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            const error = createHttpError(400, "All fields are required!");
            return next(error);
        }

        const isUserPresent = await User.findOne({ where: { email } });
        if (!isUserPresent) {
            const error = createHttpError(401, "Invalid Credentials");
            return next(error);
        }

        const isPassMatch = await bcrypt.compare(password, isUserPresent.password);
        if (!isPassMatch) {
            const error = createHttpError(401, "Invalid Credentials");
            return next(error);
        }

        // Check if user account is active
        if (!isUserPresent.status) {
            const error = createHttpError(403, "Account is disabled");
            return next(error);
        }

        const accessToken = jwt.sign({ _id: isUserPresent.id }, config.accessTokenSecret, {
            expiresIn: '1d'
        });

        res.cookie('accessToken', accessToken, {
            maxAge: 1000 * 60 * 60 * 24 * 30,
            httpOnly: true,
            sameSite: 'none',
            secure: true
        });

        res.status(200).json({
            success: true,
            message: "User login successfully!",
            data: { ...isUserPresent.toJSON(), _id: isUserPresent.id },
            accessToken
        });

    } catch (error) {
        next(error);
    }
};

const getUsers = async (req, res, next) => {
    try {
        const users = await User.findAll();
        // Add _id field for frontend compatibility
        const usersWithId = users.map(user => ({
            ...user.toJSON(),
            _id: user.id
        }));
        res.status(200).json(usersWithId);
    } catch (error) {
        next(error);
    }
};

const getUserData = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.user.id);

        // Cache-Control header - auth endpoint cache qilinmasin
        res.set({
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        });

        res.status(200).json({
            success: true,
            data: { ...user.toJSON(), _id: user.id }
        });
    } catch (error) {
        next(error);
    }
};

const updateUserData = async (req, res, next) => {
    try {
        const id = req.user.id;
        const newData = { ...req.body };

        const [rowsUpdated] = await User.update(newData, { where: { id } });

        if (rowsUpdated === 0) {
            const error = createHttpError(404, "There is no such profile");
            return next(error);
        }

        const data = await User.findByPk(id);
        res.status(200).json({
            message: 'Your profile updated successfully',
            data: { ...data.toJSON(), _id: data.id }
        });
    } catch (error) {
        next(error);
    }
};

const deleteUserData = async (req, res, next) => {
    try {
        const id = req.user.id;
        const deleted = await User.destroy({ where: { id } });

        if (!deleted) {
            const error = createHttpError(404, "There is no such profile");
            return next(error);
        }

        res.status(200).json({ success: true, message: 'Your profile was deleted successfully' });
    } catch (error) {
        next(error);
    }
};

const checkToken = async (req, res, next) => {
    try {
        // Token is already validated by middleware, just return user data
        const user = req.user;
        res.status(200).json({
            success: true,
            message: "Token is valid",
            data: {
                id: user.id,
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        next(error);
    }
};

const logout = async (req, res, next) => {
    try {
        res.clearCookie('accessToken');
        res.status(200).json({ success: true, message: "User logout successfully!" });
    } catch (error) {
        next(error);
    }
};

module.exports = { createUser, login, getUserData, logout, updateUserData, deleteUserData, getUsers, checkToken };
