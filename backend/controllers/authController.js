const User = require("../models/User");
const jwt = require("jsonwebtoken");

// ── Helper ────────────────────────────────────────
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });

const userShape = (user, extra = {}) => ({
  _id: user._id,
  name: user.name,
  phoneNumber: user.phoneNumber,
  email: user.email,
  profileImage: user.profileImage || null,
  isAdmin: user.isAdmin || false,
  ...extra,
});

// ── POST /api/auth/register ───────────────────────
const register = async (req, res) => {
  try {
    const { phoneNumber, name, email } = req.body;

    if (!phoneNumber || !name) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Phone number and name are required",
        });
    }
    if (phoneNumber.length < 11) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Enter a valid Pakistani phone number (11 digits)",
        });
    }

    const exists = await User.findOne({ phoneNumber });
    if (exists) {
      return res
        .status(400)
        .json({
          success: false,
          message: "This phone number is already registered",
        });
    }

    const user = await User.create({ phoneNumber, name, email });

    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      data: userShape(user),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/auth/login ──────────────────────────
const login = async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res
        .status(400)
        .json({ success: false, message: "Phone number is required" });
    }

    const user = await User.findOne({ phoneNumber });
    if (!user) {
      return res
        .status(404)
        .json({
          success: false,
          message: "No account found with this phone number",
        });
    }
    if (!user.isActive) {
      return res
        .status(403)
        .json({ success: false, message: "Your account has been deactivated" });
    }

    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

    res.json({
      success: true,
      token: generateToken(user._id),
      data: userShape(user),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/auth/profile ─────────────────────────
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, data: userShape(user) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── PUT /api/auth/profile ─────────────────────────
const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name?.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Name is required" });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, email },
      { new: true },
    );

    res.json({ success: true, data: userShape(user) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/auth/admin-login ────────────────────
const adminLogin = async (req, res) => {
  try {
    const { phoneNumber, secretKey } = req.body;

    if (!phoneNumber || !secretKey) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Phone number and secret key are required",
        });
    }
    if (secretKey !== process.env.ADMIN_SECRET) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid admin credentials" });
    }

    const user = await User.findOne({ phoneNumber });
    if (!user) {
      return res
        .status(404)
        .json({
          success: false,
          message: "No account found with this phone number",
        });
    }

    await User.findByIdAndUpdate(user._id, { isAdmin: true });

    res.json({
      success: true,
      token: generateToken(user._id),
      data: { ...userShape(user), isAdmin: true },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { register, login, getProfile, updateProfile, adminLogin };
