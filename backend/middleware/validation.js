const { body, validationResult } = require("express-validator");

// ── Run accumulated validators and return first error ─────────────────────────
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// ── Auth ──────────────────────────────────────────────────────────────────────

const validateRegister = [
  body("phoneNumber")
    .notEmpty()
    .withMessage("Phone number is required")
    .isLength({ min: 11, max: 11 })
    .withMessage("Phone number must be exactly 11 digits")
    .matches(/^[0-9]+$/)
    .withMessage("Phone number must contain only digits"),
  body("name")
    .notEmpty()
    .trim()
    .withMessage("Name is required")
    .isLength({ min: 2 })
    .withMessage("Name must be at least 2 characters"),
  body("email")
    .optional({ checkFalsy: true })
    .isEmail()
    .withMessage("Invalid email format"),
  validate,
];

const validateLogin = [
  body("phoneNumber").notEmpty().withMessage("Phone number is required"),
  validate,
];

const validateAdminLogin = [
  body("phoneNumber").notEmpty().withMessage("Phone number is required"),
  body("secretKey").notEmpty().withMessage("Secret key is required"),
  validate,
];

// ── Product ───────────────────────────────────────────────────────────────────

const validateProduct = [
  body("name.en")
    .if(body("name").exists())
    .notEmpty()
    .trim()
    .withMessage("Product name (English) is required"),
  body("price.current")
    .if(body("price").exists())
    .isNumeric()
    .withMessage("Price must be a number")
    .custom((val) => Number(val) > 0)
    .withMessage("Price must be greater than 0"),
  body("price.original")
    .optional({ checkFalsy: true })
    .isNumeric()
    .withMessage("Original price must be a number"),
  validate,
];

// ── Category ──────────────────────────────────────────────────────────────────

const validateCategory = [
  body("name.en")
    .if(body("name").exists())
    .notEmpty()
    .trim()
    .withMessage("Category name (English) is required"),
  body("slug")
    .optional({ checkFalsy: true })
    .matches(/^[a-z0-9-]+$/)
    .withMessage("Slug must be lowercase letters, numbers, and hyphens only"),
  validate,
];

// ── Order ─────────────────────────────────────────────────────────────────────

const validateOrder = [
  body("items")
    .isArray({ min: 1 })
    .withMessage("Order must contain at least one item"),
  body("items.*.quantity")
    .isInt({ min: 1 })
    .withMessage("Item quantity must be at least 1"),
  body("deliveryAddress.street")
    .notEmpty()
    .trim()
    .withMessage("Delivery address is required"),
  validate,
];

// ── Review ────────────────────────────────────────────────────────────────────

const validateReview = [
  body("productId").notEmpty().withMessage("Product ID is required"),
  body("orderId").notEmpty().withMessage("Order ID is required"),
  body("rating")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),
  body("comment")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Comment cannot exceed 500 characters"),
  validate,
];

module.exports = {
  validateRegister,
  validateLogin,
  validateAdminLogin,
  validateProduct,
  validateCategory,
  validateOrder,
  validateReview,
};
