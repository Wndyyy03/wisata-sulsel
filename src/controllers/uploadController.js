const { v4: uuidv4 } = require("uuid");
const { minioClient, BUCKET, buildPublicUrl } = require("../config/minio");

async function uploadImage(req, res) {
  try {
    if (!req.file) return res.status(400).json({ message: "File gambar wajib diupload (field: image)" });

    const ext = req.file.originalname.split(".").pop();
    const objectName = `destinations/${uuidv4()}.${ext}`;

    await minioClient.putObject(BUCKET, objectName, req.file.buffer, req.file.size, {
      "Content-Type": req.file.mimetype,
    });

    const url = buildPublicUrl(objectName);
    res.status(201).json({ objectName, url });
  } catch (err) {
    res.status(500).json({ message: "Gagal upload gambar ke MinIO", error: err.message });
  }
}

module.exports = { uploadImage };
