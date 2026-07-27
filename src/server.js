require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");
const { ensureBucket } = require("./config/minio");

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB();
  await ensureBucket().catch((err) =>
    console.warn("[MinIO] Tidak bisa memastikan bucket saat startup:", err.message)
  );

  app.listen(PORT, () => {
    console.log(`[Server] Wisata Sulsel API berjalan di port ${PORT}`);
    console.log(`[Server] Swagger docs: http://localhost:${PORT}/api-docs`);
  });
}

start();
