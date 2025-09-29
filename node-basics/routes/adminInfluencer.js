const express = require("express");
const router = express.Router();
const adminInfluencerController = require("../controllers/adminInfluencerController");
const auth = require("../middleware/auth");

router.get("/influencers/pending",auth.protect,auth.authorizeRoles("admin"),adminInfluencerController.getPendingInfluencers);
router.put("/influencers/:id/status", adminInfluencerController.updateInfluencerStatus);

module.exports = router;
