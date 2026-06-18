const Product = require("../models/Product");

// ── GET /api/products ─────────────────────────────
const getProducts = async (req, res) => {
  try {
    const { category, featured, search, sale } = req.query;
    let filter = { isActive: true };

    if (category) filter.categoryId = category;
    if (featured) filter.isFeatured = true;
    if (sale) filter.isOnSale = true;

    let products;

    if (search) {
      products = await Product.find({
        $text: { $search: search },
        isActive: true,
      })
        .populate("categoryId", "name slug")
        .lean();
    } else {
      products = await Product.find(filter)
        .populate("categoryId", "name slug")
        .sort({ createdAt: -1 })
        .lean();
    }

    res.set("Cache-Control", "public, max-age=60, stale-while-revalidate=30");
    res.json({ success: true, count: products.length, data: products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/products/:id ─────────────────────────
const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("categoryId", "name slug")
      .lean();

    if (!product || !product.isActive) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    res.set("Cache-Control", "public, max-age=60, stale-while-revalidate=30");
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/products ────────────────────────────
const createProduct = async (req, res) => {
  try {
    // Bulk insert
    if (Array.isArray(req.body)) {
      const products = await Product.insertMany(req.body);
      return res
        .status(201)
        .json({ success: true, count: products.length, data: products });
    }

    // Validation handled by validateProduct middleware — these are safety checks
    if (!req.body.name?.en) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Product name (English) is required",
        });
    }
    if (!req.body.categoryId) {
      return res
        .status(400)
        .json({ success: false, message: "Category is required" });
    }
    if (!req.body.price?.current) {
      return res
        .status(400)
        .json({ success: false, message: "Product price is required" });
    }

    const product = await Product.create(req.body);
    res.status(201).json({ success: true, data: product });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ── PUT /api/products/:id ─────────────────────────
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, data: product });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ── DELETE /api/products/:id (soft delete) ────────
const deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: "Product removed successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};
