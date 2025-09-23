const express = require("express");
const router = express.Router();
const influencerController = require("../controllers/influencerController");
const auth = require("../middleware/auth"); 

router.post("/onboard", auth.protect, influencerController.onboardInfluencer);
router.get("/profile/:id", auth.protect, influencerController.getInfluencerProfile);
router.put("/update", auth.protect, influencerController.updateInfluencer);

module.exports = router;