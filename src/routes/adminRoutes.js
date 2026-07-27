const express = require("express");
const router = express.Router();
const { login, getSettings, updateSettings } = require("../controllers/adminController");
const { requireAuth } = require("../middleware/auth");

router.post("/login", login);
router.get("/settings", requireAuth, getSettings);
router.put("/settings", requireAuth, updateSettings);

module.exports = router;