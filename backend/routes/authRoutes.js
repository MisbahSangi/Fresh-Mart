const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  validateRegister,
  validateLogin,
  validateAdminLogin,
} = require("../middleware/validation");
const ctrl = require("../controllers/authController");

router.post("/register", validateRegister, ctrl.register);
router.post("/login", validateLogin, ctrl.login);
router.get("/profile", protect, ctrl.getProfile);
router.put("/profile", protect, ctrl.updateProfile);
router.post("/admin-login", validateAdminLogin, ctrl.adminLogin);

module.exports = router;
