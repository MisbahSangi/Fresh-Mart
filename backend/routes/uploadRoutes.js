const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { uploadProduct, uploadProfile } = require("../config/cloudinary");
const ctrl = require("../controllers/uploadController");

router.post(
  "/product",
  protect,
  uploadProduct.single("image"),
  ctrl.uploadProductImage,
);
router.post(
  "/profile",
  protect,
  uploadProfile.single("image"),
  ctrl.uploadProfileImage,
);

module.exports = router;
