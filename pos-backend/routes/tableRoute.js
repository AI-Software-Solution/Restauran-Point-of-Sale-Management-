const express = require("express");
const { addTable, getTables, updateTable, availableTable, deleteTable } = require("../controllers/tableController");
const router = express.Router();
const { isVerifiedUser } = require("../middlewares/tokenVerification")

// All routes require authentication
router.route("/").get(isVerifiedUser, getTables);
router.route("/").post(isVerifiedUser, addTable);
router.route("/:id").put(isVerifiedUser, updateTable);
router.route("/available/:id").put(isVerifiedUser, availableTable)
router.route("/:id").delete(isVerifiedUser, deleteTable)

module.exports = router;