const express = require("express");
const router = express.Router();
const { chat } = require("../controllers/aiController");

/**
 * @swagger
 * tags:
 *   name: AI
 *   description: Asisten AI pariwisata (Ollama, RAG dari data MongoDB)
 */

/**
 * @swagger
 * /ai/chat:
 *   post:
 *     summary: Tanya asisten AI (harga penginapan, resto terdekat, spot foto, waktu tempuh, rekomendasi, dsb)
 *     tags: [AI]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [question]
 *             properties:
 *               question:
 *                 type: string
 *                 example: "Berapa jam perjalanan ke Tanjung Bira dan kendaraan apa yang cocok?"
 *               destinationName:
 *                 type: string
 *                 example: "Tanjung Bira"
 *               regency:
 *                 type: string
 *                 example: "Bulukumba"
 *               userLocation:
 *                 type: object
 *                 properties:
 *                   lat: { type: number, example: -5.1477 }
 *                   lng: { type: number, example: 119.4327 }
 *     responses:
 *       200:
 *         description: Jawaban AI + sumber data yang dipakai
 */
router.post("/chat", chat);

module.exports = router;
