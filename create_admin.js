require("dotenv").config();
const mongoose = require("mongoose");
const Admin = require("./src/models/Admin");

const USERNAME = "admin";
const PASSWORD = "gantipassword123";

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const existing = await Admin.findOne({ username: USERNAME });
  if (existing) {
    console.log("Admin dengan username itu sudah ada.");
  } else {
    await Admin.create({ username: USERNAME, password: PASSWORD });
    console.log(`Admin berhasil dibuat. Username: ${USERNAME} | Password: ${PASSWORD}`);
  }
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("Gagal buat admin:", err.message);
  process.exit(1);
});