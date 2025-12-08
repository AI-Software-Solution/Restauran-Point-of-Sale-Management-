const express = require("express");
const { createUser, login, getUserData, logout, updateUserData, deleteUserData, getUsers, checkToken } = require("../controllers/userController");
const { isVerifiedUser, isAdminOrOwner } = require("../middlewares/tokenVerification");
const router = express.Router();


// Authentication Routes
router.route("/login").post(login);
router.route("/logout").post(isVerifiedUser, logout);
router.route("/checkToken").put(isVerifiedUser, checkToken);

// User management (admin/owner only)
router.route("/create").post(isAdminOrOwner, createUser);

// Protected routes
router.route("/update").put(isVerifiedUser, updateUserData);
router.route("/delete").delete(isVerifiedUser, deleteUserData);
router.route("/getAll").get(isVerifiedUser, getUsers);
router.route("/").get(isVerifiedUser, getUserData);

module.exports = router;