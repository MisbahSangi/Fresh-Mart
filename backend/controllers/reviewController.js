const Review = require('../models/Review');
const Order  = require('../models/Order');

// ── GET /api/reviews/product/:productId ───────────
const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      productId:  req.params.productId,
      isApproved: true
    })
      .populate('customerId', 'name')
      .sort({ createdAt: -1 })
      .lean();

    const avgRating = reviews.length
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : 0;

    res.json({
      success:   true,
      count:     reviews.length,
      avgRating: Number(avgRating),
      data:      reviews
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/reviews/can-review/:productId ────────
const checkCanReview = async (req, res) => {
  try {
    const order = await Order.findOne({
      customerId:        req.user._id,
      status:            'delivered',
      'items.productId': req.params.productId
    });

    if (!order) {
      return res.json({
        success:   true,
        canReview: false,
        reason:    'You can only review products you have ordered and received'
      });
    }

    const existing = await Review.findOne({
      productId:  req.params.productId,
      customerId: req.user._id,
      orderId:    order._id
    });

    res.json({
      success:   true,
      canReview: !existing,
      orderId:   order._id,
      reason:    existing ? 'You have already reviewed this product' : null
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/reviews ─────────────────────────────
const createReview = async (req, res) => {
  try {
    const { productId, orderId, rating, comment } = req.body;

    if (!productId || !orderId || !rating) {
      return res.status(400).json({ success: false, message: 'Product, order and rating are required' });
    }

    const order = await Order.findOne({
      _id:               orderId,
      customerId:        req.user._id,
      status:            'delivered',
      'items.productId': productId
    });

    if (!order) {
      return res.status(403).json({ success: false, message: 'You can only review products from delivered orders' });
    }

    const review = await Review.create({ productId, customerId: req.user._id, orderId, rating, comment });
    await review.populate('customerId', 'name');

    res.status(201).json({ success: true, data: review });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this product' });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/reviews/admin/all — admin only ────────
const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('customerId', 'name phoneNumber')
      .populate('productId',  'name')
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, count: reviews.length, data: reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── PUT /api/reviews/:id/toggle — admin only ───────
const toggleReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    review.isApproved = !review.isApproved;
    await review.save();
    res.json({ success: true, data: review });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── DELETE /api/reviews/:id — admin only ───────────
const deleteReview = async (req, res) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getProductReviews, checkCanReview, createReview, getAllReviews, toggleReview, deleteReview };
