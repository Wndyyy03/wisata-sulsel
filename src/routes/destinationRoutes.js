const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/destinationController");

/**
 * @swagger
 * tags:
 *   name: Destinations
 *   description: CRUD data destinasi wisata Sulawesi Selatan
 */

/**
 * @swagger
 * /destinations:
 *   get:
 *     summary: Ambil semua destinasi (bisa difilter)
 *     tags: [Destinations]
 *     parameters:
 *       - in: query
 *         name: regency
 *         schema: { type: string }
 *         description: Filter kabupaten/kota, misal "Bulukumba"
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *         description: Pencarian teks bebas
 *     responses:
 *       200:
 *         description: List destinasi
 *   post:
 *     summary: Tambah destinasi baru
 *     tags: [Destinations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Destination'
 *     responses:
 *       201:
 *         description: Destinasi berhasil dibuat
 */
router.get("/", ctrl.getAllDestinations);
router.post("/", ctrl.createDestination);

/**
 * @swagger
 * /destinations/recommend:
 *   get:
 *     summary: Rekomendasi destinasi berdasarkan area/kabupaten (opsional diurutkan dari terdekat)
 *     tags: [Destinations]
 *     parameters:
 *       - in: query
 *         name: regency
 *         schema: { type: string }
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: lat
 *         schema: { type: number }
 *       - in: query
 *         name: lng
 *         schema: { type: number }
 *     responses:
 *       200:
 *         description: List destinasi terurut
 */
router.get("/recommend", ctrl.recommendByArea);

/**
 * @swagger
 * /destinations/{id}:
 *   get:
 *     summary: Detail destinasi
 *     tags: [Destinations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Detail destinasi }
 *       404: { description: Tidak ditemukan }
 *   put:
 *     summary: Update destinasi
 *     tags: [Destinations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Destinasi terupdate }
 *   delete:
 *     summary: Hapus destinasi
 *     tags: [Destinations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Destinasi dihapus }
 */
router.get("/:id", ctrl.getDestinationById);
router.put("/:id", ctrl.updateDestination);
router.delete("/:id", ctrl.deleteDestination);

/**
 * @swagger
 * /destinations/{id}/travel-estimate:
 *   get:
 *     summary: Estimasi jarak & waktu tempuh dari lokasi pengguna ke destinasi
 *     tags: [Destinations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: lat
 *         required: true
 *         schema: { type: number }
 *       - in: query
 *         name: lng
 *         required: true
 *         schema: { type: number }
 *     responses:
 *       200: { description: Estimasi jarak/waktu per moda kendaraan }
 */
router.get("/:id/travel-estimate", ctrl.getTravelEstimate);

module.exports = router;
