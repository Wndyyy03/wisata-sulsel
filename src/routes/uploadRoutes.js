const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const { uploadImage } = require("../controllers/uploadController");

/**
 * @swagger
 * tags:
 *   name: Upload
 *   description: Upload gambar destinasi ke MinIO
 */

/**
 * @swagger
 * /upload/image:
 *   post:
 *     summary: Upload gambar destinasi (disimpan ke MinIO)
 *     tags: [Upload]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: URL gambar yang tersimpan di MinIO
 */
router.post("/image", upload.single("image"), uploadImage);

module.exports = router;
