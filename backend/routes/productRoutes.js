const express = require("express");
const router = express.Router();
const { protect, requireAdmin } = require("../middleware/authMiddleware");
const { validateProduct } = require("../middleware/validation");
const ctrl = require("../controllers/productController");

router.get("/", ctrl.getProducts);
router.get("/:id", ctrl.getProduct);
router.post("/", protect, requireAdmin, validateProduct, ctrl.createProduct);
router.put("/:id", protect, requireAdmin, validateProduct, ctrl.updateProduct);
router.delete("/:id", protect, requireAdmin, ctrl.deleteProduct);

module.exports = router;
