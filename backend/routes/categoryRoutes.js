const express = require("express");
const router = express.Router();
const { protect, requireAdmin } = require("../middleware/authMiddleware");
const { validateCategory } = require("../middleware/validation");
const ctrl = require("../controllers/categoryController");

router.get("/", ctrl.getCategories);
router.get("/:id", ctrl.getCategory);
router.post("/", protect, requireAdmin, validateCategory, ctrl.createCategory);
router.put(
  "/:id",
  protect,
  requireAdmin,
  validateCategory,
  ctrl.updateCategory,
);
router.delete("/:id", protect, requireAdmin, ctrl.deleteCategory);

module.exports = router;
