const User = require("../models/User");

// ── POST /api/upload/product ──────────────────────
const uploadProductImage = (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No image uploaded" });
    }
    res.json({
      success: true,
      url: req.file.path,
      message: "Image uploaded successfully",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/upload/profile ──────────────────────
const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No image uploaded" });
    }

    await User.findByIdAndUpdate(req.user._id, { profileImage: req.file.path });

    res.json({
      success: true,
      url: req.file.path,
      message: "Profile image updated!",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { uploadProductImage, uploadProfileImage };
