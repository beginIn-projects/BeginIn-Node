const jwt = require("jsonwebtoken");
const AdminUser = require("../models/AdminUser");

const generateToken = (id, role = "admin") => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

exports.adminSignup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const existing = await AdminUser.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    const admin = await AdminUser.create({ name, email, password });

    return res.status(201).json({
      success: true,
      message: "Admin account created",
      data: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        token: generateToken(admin._id, admin.role),
      },
    });
  } catch (err) {
    console.error("adminSignup error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await AdminUser.findOne({ email });
    if (!admin) {
      return res.status(400).json({ success: false, message: "Invalid email or not an admin" });
    }

    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid password" });
    }

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        token: generateToken(admin._id, admin.role),
      },
    });
  } catch (err) {
    console.error("adminLogin error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
