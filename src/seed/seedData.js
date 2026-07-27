require("dotenv").config();
const mongoose = require("mongoose");
const Destination = require("../models/Destination");

/**
 * CATATAN PENTING:
 * - Nama, kategori, kabupaten, dan koordinat destinasi di bawah ini adalah fakta umum yang
 *   sudah dikenal luas (tempat wisata nyata di Sulawesi Selatan).
 * - Harga tiket, harga penginapan/villa, harga resto/cafe, dan jarak lodging/eatery bersifat
 *   ILUSTRATIF/CONTOH agar aplikasi bisa langsung didemokan. WAJIB diverifikasi & diupdate
 *   lewat endpoint admin (PUT /api/destinations/:id) sebelum dipakai untuk data produksi,
 *   karena harga berubah-ubah dan sebaiknya diinput oleh pengelola/admin yang punya data aktual.
 */

const destinations = [
  {
    name: "Tanjung Bira",
    slug: "tanjung-bira",
    category: "Pantai",
    regency: "Bulukumba",
    description:
      "Pantai pasir putih terkenal di ujung selatan Sulawesi Selatan, terkenal dengan air laut jernih " +
      "bergradasi biru-toska dan menjadi titik penyeberangan kapal tradisional phinisi.",
    location: { lat: -5.5679, lng: 120.4258 },
    images: [],
    entryFee: "Rp15.000 - Rp25.000 per orang (contoh, cek ulang ke pengelola)",
    openHours: "24 jam (loket ramai 06.00 - 18.00)",
    bestVehicle: ["Mobil", "Bus/Travel"],
    accessNotes: "Jalan aspal mulus dari Makassar, sebagian jalan berkelok di area perbukitan Bulukumba.",
    photoSpots: [
      { name: "Dermaga kayu Bira", popularity: "Sangat populer", description: "Spot sunset paling ikonik" },
      { name: "Tebing Apparalang", popularity: "Sangat populer", description: "Tebing karang dengan pemandangan laut lepas" },
      { name: "Pantai Bara", popularity: "Populer", description: "Lebih tenang, cocok untuk snorkeling" },
    ],
    lodgings: [
      { name: "Bira Beach Hotel", type: "Hotel", priceRange: "Rp450.000 - Rp900.000/malam (contoh)", distanceFromSpotKm: 0.5 },
      { name: "Amatoa Resort", type: "Villa", priceRange: "Rp1.200.000 - Rp2.500.000/malam (contoh)", distanceFromSpotKm: 1 },
    ],
    eateries: [
      { name: "Warung Ikan Bakar Bira", type: "Warung", priceRange: "Rp30.000 - Rp60.000/porsi (contoh)", distanceFromSpotKm: 0.3, specialty: "Ikan bakar segar" },
      { name: "Bira Sunset Cafe", type: "Cafe", priceRange: "Rp20.000 - Rp45.000 (contoh)", distanceFromSpotKm: 0.2 },
    ],
    tags: ["pantai", "sunset", "snorkeling", "bulukumba", "phinisi"],
  },
  {
    name: "Kete Kesu",
    slug: "kete-kesu",
    category: "Budaya/Sejarah",
    regency: "Toraja Utara",
    description:
      "Desa adat Toraja dengan deretan rumah Tongkonan berusia ratusan tahun, kuburan batu, dan " +
      "gua pemakaman kuno (erong) di tebing.",
    location: { lat: -3.0817, lng: 119.8919 },
    images: [],
    entryFee: "Rp15.000 per orang (contoh)",
    openHours: "08.00 - 17.00",
    bestVehicle: ["Mobil", "Motor"],
    accessNotes: "Jalan aspal berkelok khas pegunungan Toraja, disarankan kendaraan dengan rem & mesin prima.",
    photoSpots: [
      { name: "Deretan Tongkonan", popularity: "Sangat populer", description: "Ikon utama Kete Kesu" },
      { name: "Gua pemakaman & peti erong", popularity: "Populer" },
    ],
    lodgings: [
      { name: "Toraja Heritage Hotel", type: "Hotel", priceRange: "Rp500.000 - Rp1.000.000/malam (contoh)", distanceFromSpotKm: 6 },
      { name: "Tongkonan Home Stay", type: "Homestay", priceRange: "Rp200.000 - Rp350.000/malam (contoh)", distanceFromSpotKm: 1.5 },
    ],
    eateries: [
      { name: "Rumah Makan Pong Buri", type: "Resto", priceRange: "Rp25.000 - Rp70.000 (contoh)", distanceFromSpotKm: 2, specialty: "Masakan khas Toraja (Pa'piong)" },
    ],
    tags: ["budaya", "toraja", "tongkonan", "sejarah"],
  },
  {
    name: "Bantimurung Waterfall & Butterfly Park",
    slug: "bantimurung",
    category: "Air Terjun",
    regency: "Maros",
    description:
      "Air terjun dengan kawasan karst yang dijuluki 'Kingdom of Butterfly' karena populasi kupu-kupu " +
      "beraneka warna, dekat dengan gua prasejarah Leang-Leang.",
    location: { lat: -5.0322, lng: 119.6564 },
    images: [],
    entryFee: "Rp15.000 - Rp20.000 per orang (contoh)",
    openHours: "07.00 - 18.00",
    bestVehicle: ["Motor", "Mobil"],
    accessNotes: "Jalan aspal baik, sekitar 45 menit dari Makassar via jalan poros Maros.",
    photoSpots: [
      { name: "Kolam air terjun utama", popularity: "Sangat populer" },
      { name: "Museum Kupu-Kupu", popularity: "Populer" },
      { name: "Gua Batu (Goa Mimpi)", popularity: "Cukup populer" },
    ],
    lodgings: [
      { name: "Villa Bantimurung Indah", type: "Villa", priceRange: "Rp350.000 - Rp700.000/malam (contoh)", distanceFromSpotKm: 1 },
    ],
    eateries: [
      { name: "Cafe Karst Rammang-Rammang", type: "Cafe", priceRange: "Rp15.000 - Rp50.000 (contoh)", distanceFromSpotKm: 8 },
      { name: "Warung Coto Maros", type: "Warung", priceRange: "Rp20.000 - Rp35.000 (contoh)", distanceFromSpotKm: 3 },
    ],
    tags: ["air terjun", "kupu-kupu", "maros", "karst", "keluarga"],
  },
  {
    name: "Rammang-Rammang",
    slug: "rammang-rammang",
    category: "Karst/Goa",
    regency: "Maros",
    description:
      "Kawasan karst terbesar ketiga di dunia, wisata susur sungai dengan perahu menyusuri tebing " +
      "batu kapur raksasa dan sawah hijau.",
    location: { lat: -4.9601, lng: 119.5975 },
    images: [],
    entryFee: "Sewa perahu Rp250.000 - Rp350.000/perahu (contoh, kapasitas 3-4 orang)",
    openHours: "07.00 - 17.00",
    bestVehicle: ["Motor", "Mobil"],
    accessNotes: "Jalan aspal sampai dermaga, dilanjutkan naik perahu untuk masuk kawasan karst.",
    photoSpots: [
      { name: "Telaga Bidadari", popularity: "Sangat populer" },
      { name: "Kampung Berua di tengah karst", popularity: "Sangat populer" },
    ],
    lodgings: [
      { name: "Rammang-Rammang Homestay", type: "Homestay", priceRange: "Rp150.000 - Rp300.000/malam (contoh)", distanceFromSpotKm: 0.5 },
    ],
    eateries: [
      { name: "Rumah Makan Terapung Berua", type: "Resto", priceRange: "Rp20.000 - Rp55.000 (contoh)", distanceFromSpotKm: 0.2 },
    ],
    tags: ["karst", "susur sungai", "maros", "alam"],
  },
  {
    name: "Pantai Losari",
    slug: "pantai-losari",
    category: "Pantai",
    regency: "Kota Makassar",
    description:
      "Ikon Kota Makassar berupa area pesisir kota dengan tulisan besar 'Pantai Losari', ramai " +
      "pengunjung terutama saat sore untuk menikmati sunset dan kuliner pisang epe.",
    location: { lat: -5.1361, lng: 119.4058 },
    images: [],
    entryFee: "Gratis",
    openHours: "24 jam",
    bestVehicle: ["Motor", "Mobil", "Angkutan umum"],
    accessNotes: "Di pusat kota Makassar, akses sangat mudah dari segala arah.",
    photoSpots: [
      { name: "Tulisan besar Pantai Losari", popularity: "Sangat populer" },
      { name: "Anjungan Pantai Losari saat sunset", popularity: "Sangat populer" },
    ],
    lodgings: [
      { name: "Hotel Losari Metro", type: "Hotel", priceRange: "Rp350.000 - Rp700.000/malam (contoh)", distanceFromSpotKm: 0.3 },
    ],
    eateries: [
      { name: "Deretan warung Pisang Epe Losari", type: "Warung", priceRange: "Rp10.000 - Rp25.000 (contoh)", distanceFromSpotKm: 0.1, specialty: "Pisang epe" },
      { name: "Cafe Baruga Anging Mammiri", type: "Cafe", priceRange: "Rp20.000 - Rp60.000 (contoh)", distanceFromSpotKm: 0.2 },
    ],
    tags: ["kota", "sunset", "makassar", "kuliner"],
  },
  {
    name: "Malino",
    slug: "malino",
    category: "Pegunungan",
    regency: "Gowa",
    description:
      "Kawasan pegunungan sejuk peninggalan Belanda dengan kebun teh, kebun stroberi, hutan pinus, " +
      "dan air terjun Takapala — sering disebut 'Puncak-nya Sulawesi Selatan'.",
    location: { lat: -5.2649, lng: 119.8464 },
    images: [],
    entryFee: "Rp10.000 - Rp20.000 per lokasi wisata (contoh)",
    openHours: "07.00 - 18.00",
    bestVehicle: ["Mobil", "Motor"],
    accessNotes: "Jalan menanjak & berkelok khas pegunungan sejauh ±90 km dari Makassar, disarankan kendaraan prima.",
    photoSpots: [
      { name: "Hutan Pinus Malino", popularity: "Sangat populer" },
      { name: "Air Terjun Takapala", popularity: "Sangat populer" },
      { name: "Kebun Teh Malino", popularity: "Populer" },
    ],
    lodgings: [
      { name: "Villa Bukit Malino", type: "Villa", priceRange: "Rp500.000 - Rp1.500.000/malam (contoh)", distanceFromSpotKm: 2 },
      { name: "Malino Highland Cottage", type: "Resort", priceRange: "Rp600.000 - Rp1.800.000/malam (contoh)", distanceFromSpotKm: 3 },
    ],
    eateries: [
      { name: "Rumah Makan Sup Konro Malino", type: "Resto", priceRange: "Rp30.000 - Rp65.000 (contoh)", distanceFromSpotKm: 1 },
      { name: "Cafe Kebun Strawberry", type: "Cafe", priceRange: "Rp15.000 - Rp40.000 (contoh)", distanceFromSpotKm: 1.5 },
    ],
    tags: ["pegunungan", "gowa", "hutan pinus", "sejuk"],
  },
  {
    name: "Pulau Samalona",
    slug: "pulau-samalona",
    category: "Pulau",
    regency: "Kota Makassar",
    description:
      "Pulau kecil dekat Makassar dengan pantai pasir putih dan spot snorkeling terumbu karang, " +
      "populer untuk wisata harian dari kota.",
    location: { lat: -5.1225, lng: 119.3733 },
    images: [],
    entryFee: "Perahu PP Rp400.000 - Rp600.000/perahu (contoh, kapasitas hingga 10 orang)",
    openHours: "07.00 - 17.00 (tergantung jadwal kapal)",
    bestVehicle: ["Kapal"],
    accessNotes: "Naik kapal/perahu dari Pelabuhan Kayu Bangkoa atau Pantai Losari, waktu tempuh laut ±30 menit.",
    photoSpots: [
      { name: "Dermaga kayu Samalona", popularity: "Sangat populer" },
      { name: "Spot snorkeling terumbu karang", popularity: "Populer" },
    ],
    lodgings: [
      { name: "Homestay Pulau Samalona", type: "Homestay", priceRange: "Rp250.000 - Rp450.000/malam (contoh)", distanceFromSpotKm: 0.1 },
    ],
    eateries: [
      { name: "Warung Ikan Bakar Samalona", type: "Warung", priceRange: "Rp30.000 - Rp70.000 (contoh)", distanceFromSpotKm: 0.1 },
    ],
    tags: ["pulau", "snorkeling", "makassar", "laut"],
  },
  {
    name: "Benteng Rotterdam",
    slug: "benteng-rotterdam",
    category: "Budaya/Sejarah",
    regency: "Kota Makassar",
    description:
      "Benteng peninggalan Kesultanan Gowa & era kolonial Belanda, salah satu benteng terbaik " +
      "yang bertahan di Indonesia Timur, kini juga jadi museum La Galigo.",
    location: { lat: -5.1330, lng: 119.4083 },
    images: [],
    entryFee: "Rp5.000 - Rp10.000 per orang (contoh)",
    openHours: "08.00 - 17.00",
    bestVehicle: ["Motor", "Mobil", "Angkutan umum"],
    accessNotes: "Di pusat kota Makassar, akses sangat mudah.",
    photoSpots: [
      { name: "Gerbang & tembok benteng bergaya kura-kura", popularity: "Sangat populer" },
      { name: "Halaman dalam benteng dengan bangunan kolonial", popularity: "Populer" },
    ],
    lodgings: [
      { name: "Hotel Aryaduta Makassar", type: "Hotel", priceRange: "Rp600.000 - Rp1.200.000/malam (contoh)", distanceFromSpotKm: 1 },
    ],
    eateries: [
      { name: "Cafe Benteng", type: "Cafe", priceRange: "Rp20.000 - Rp50.000 (contoh)", distanceFromSpotKm: 0.1 },
    ],
    tags: ["sejarah", "benteng", "makassar", "museum"],
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("[Seed] Terhubung ke MongoDB");

  await Destination.deleteMany({});
  await Destination.insertMany(destinations);

  console.log(`[Seed] ${destinations.length} destinasi berhasil dimasukkan.`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("[Seed] Gagal:", err);
  process.exit(1);
});
