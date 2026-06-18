const Category = require("../models/Category");

// ── GET /api/categories ───────────────────────────
const getCategories = async (req, res) => {
  try {
    const cats = await Category.find({ isActive: true })
      .sort("displayOrder")
      .lean();
    res.set("Cache-Control", "public, max-age=300, stale-while-revalidate=60");
    res.json({ success: true, data: cats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/categories/:id ───────────────────────
const getCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id).lean();
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }
    res.json({ success: true, data: category });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/categories ──────────────────────────
const createCategory = async (req, res) => {
  try {
    let cat;
    if (Array.isArray(req.body)) {
      cat = await Category.insertMany(req.body);
    } else {
      cat = await Category.create(req.body);
    }
    res.status(201).json({
      success: true,
      count: Array.isArray(cat) ? cat.length : 1,
      data: cat,
    });
  } catch (err) {
    // Duplicate slug → friendly message
    if (err.code === 11000) {
      return res
        .status(400)
        .json({
          success: false,
          message: "A category with this slug already exists",
        });
    }
    res.status(400).json({ success: false, message: err.message });
  }
};

// ── PUT /api/categories/:id ───────────────────────
const updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }
    res.json({ success: true, data: category });
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(400)
        .json({
          success: false,
          message: "A category with this slug already exists",
        });
    }
    res.status(400).json({ success: false, message: err.message });
  }
};

// ── DELETE /api/categories/:id (soft delete) ──────
// Phase 2 missing endpoint — now implemented
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true },
    );
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }
    res.json({ success: true, message: "Category removed successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
};
