const express = require("express");
const { register, login, getUserData, logout, updateUserData, deleteUserData, getUsers, checkToken } = require("../controllers/userController");
const { isVerifiedUser } = require("../middlewares/tokenVerification");
const router = express.Router();


// Authentication Routes
router.route("/register").post(register);
router.route("/login").post(login);
router.route("/checkToken").put(checkToken);
router.route("/logout").post(isVerifiedUser, logout)
router.route("/update").put(isVerifiedUser, updateUserData)
router.route("/delete").delete(isVerifiedUser, deleteUserData)
router.route("/getAll").get(getUsers)

router.route("/").get(isVerifiedUser , getUserData);

module.exports = router;