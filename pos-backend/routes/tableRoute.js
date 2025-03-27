const express = require("express");
const { addTable, getTables, updateTable, avvaliableTable, deleteTable } = require("../controllers/tableController");
const router = express.Router();
const { isVerifiedUser } = require("../middlewares/tokenVerification")
 
router.route("/").post(addTable);
router.route("/").get(getTables);
router.route("/:id").put(updateTable);
router.route("/available/:id").put(avvaliableTable)
router.route("/:id").delete(deleteTable)

module.exports = router;