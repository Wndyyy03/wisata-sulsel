const mongoose = require("mongoose");

const SettingsSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, default: "whatsapp" },
    fonnteToken: { type: String, default: "" },
    whatsappTarget: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Settings", SettingsSchema);