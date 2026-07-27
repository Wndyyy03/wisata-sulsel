const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const Settings = require("../models/Settings");

async function login(req, res) {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Username dan password wajib diisi" });
    }

    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).json({ message: "Username atau password salah" });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Username atau password salah" });
    }

    const token = jwt.sign(
      { id: admin._id, username: admin.username },
      process.env.JWT_SECRET || "rahasia_default_ganti_ini",
      { expiresIn: "7d" }
    );

    res.json({ token, username: admin.username });
  } catch (err) {
    res.status(500).json({ message: "Gagal login", error: err.message });
  }
}

async function getSettings(req, res) {
  try {
    let settings = await Settings.findOne({ key: "whatsapp" });
    if (!settings) {
      settings = await Settings.create({ key: "whatsapp" });
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: "Gagal mengambil settings", error: err.message });
  }
}

async function updateSettings(req, res) {
  try {
    const { fonnteToken, whatsappTarget } = req.body;
    const settings = await Settings.findOneAndUpdate(
      { key: "whatsapp" },
      { fonnteToken, whatsappTarget },
      { new: true, upsert: true }
    );
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: "Gagal menyimpan settings", error: err.message });
  }
}

module.exports = { login, getSettings, updateSettings };