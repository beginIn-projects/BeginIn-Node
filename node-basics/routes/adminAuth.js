const express = require("express");
const router = express.Router();
const adminAuthController = require("../controllers/adminAuthController");

// Admin signup & login
router.post("/signup", adminAuthController.adminSignup);
router.post("/login", adminAuthController.adminLogin);

module.exports = router;
