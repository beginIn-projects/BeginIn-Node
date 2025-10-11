const express = require("express");
const router = express.Router();
const campaignController = require("../controllers/campaignController");
const auth = require("../middleware/auth");
const upload = require("../middleware/upload");

// CRUD routes
router.post("/create", auth.protect, auth.authorizeRoles("brand"), upload.array("images", 5), campaignController.createCampaign);
router.get("/:id", auth.protect, campaignController.getCampaign);
router.put("/:id", auth.protect, auth.authorizeRoles("brand"), upload.array("images", 5), campaignController.updateCampaign);
router.delete("/:id", auth.protect, auth.authorizeRoles("brand"), campaignController.deleteCampaign);
router.get("/", auth.protect, campaignController.getAllCampaigns);

module.exports = router;
