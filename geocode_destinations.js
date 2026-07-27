/**
 * geocode_destinations.js
 *
 * Tujuan:
 *  - Ambil semua destinasi dari MongoDB
 *  - Geocode tiap destinasi lewat Nominatim (OpenStreetMap) berdasarkan nama + kabupaten
 *  - Bandingkan koordinat lama vs hasil geocoding
 *  - Tulis hasilnya ke file JSON (review_output.json) untuk Anda REVIEW dulu
 *  - TIDAK langsung update database — ini sengaja, supaya tidak ada geocoding salah
 *    yang menimpa data (misalnya nama destinasi ambigu / ketemu tempat lain yang mirip)
 *
 * Cara pakai:
 *   1. npm install mongodb node-fetch@2
 *   2. Sesuaikan MONGO_URI di bawah
 *   3. node geocode_destinations.js
 *   4. Buka review_output.json, cek kolom "distance_km" (jarak lama vs baru).
 *      Kalau distance_km besar (misal >5km) dan hasil geocoding masuk akal → berarti
 *      koordinat lama memang kasar/salah, pakai yang baru.
 *      Kalau geocoding tidak ketemu / confidence rendah → riset manual untuk itu saja.
 *
 * Catatan penting:
 *  - Nominatim punya rate limit 1 request/detik — script ini sudah kasih delay otomatis.
 *  - Nominatim adalah layanan gratis komunitas OSM — hormati rate limit, jangan dipercepat.
 *  - Untuk tempat kecil/kurang dikenal, hasil bisa kosong atau kurang akurat — itu wajar,
 *    tandai untuk riset manual (search nama tempat + "google maps" atau cek Wikipedia/Wikimapia).
 */

const { MongoClient } = require("mongodb");
const fetch = require("node-fetch");

const MONGO_URI = "mongodb://root:rootpass@mongo:27017/wisata_sulsel?authSource=admin";
const DB_NAME = "wisata_sulsel";
const COLLECTION = "destinations";

// Jarak lama vs baru (km) — pakai formula Haversine sederhana
function distanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function geocodeOnce(query) {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
    query
  )}&format=json&limit=1&countrycodes=id`;

  const res = await fetch(url, {
    headers: {
      // Nominatim mewajibkan User-Agent yang jelas, bukan default library
      "User-Agent": "wisata-sulsel-geocode-check/1.0 (internal data cleanup script)",
    },
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (!data || data.length === 0) return null;

  return {
    lat: parseFloat(data[0].lat),
    lng: parseFloat(data[0].lon),
    display_name: data[0].display_name,
    importance: data[0].importance, // indikasi kasar seberapa "yakin" Nominatim
  };
}

// Coba beberapa variasi query, dari paling spesifik ke paling umum.
// Nominatim kadang gagal cocokkan kalau string terlalu panjang/kaku,
// jadi kita mundur bertahap sebelum benar-benar menyerah.
async function geocode(name, regency) {
  const attempts = [
    `${name}, ${regency}, Sulawesi Selatan, Indonesia`, // paling spesifik
    `${name}, ${regency}, Indonesia`,
    `${name}, Sulawesi Selatan, Indonesia`,
    `${name}`, // paling umum, terakhir
  ];

  for (let i = 0; i < attempts.length; i++) {
    const result = await geocodeOnce(attempts[i]);
    if (result) {
      return { ...result, matched_query: attempts[i], attempt_level: i + 1 };
    }
    if (i < attempts.length - 1) await sleep(1100); // rate limit antar percobaan
  }
  return null;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db(DB_NAME);
  const col = db.collection(COLLECTION);

  const destinations = await col
    .find({}, { projection: { name: 1, regency: 1, location: 1 } })
    .toArray();

  console.log(`Ditemukan ${destinations.length} destinasi. Mulai geocoding...\n`);

  const results = [];

  for (let i = 0; i < destinations.length; i++) {
    const dest = destinations[i];
    process.stdout.write(`[${i + 1}/${destinations.length}] ${dest.name} ... `);

    try {
      const geo = await geocode(dest.name, dest.regency);

      if (!geo) {
        console.log("TIDAK DITEMUKAN — perlu riset manual");
        results.push({
          _id: dest._id,
          name: dest.name,
          regency: dest.regency,
          old_location: dest.location,
          geocode_result: null,
          status: "NOT_FOUND",
        });
      } else {
        const dist = dest.location
          ? distanceKm(dest.location.lat, dest.location.lng, geo.lat, geo.lng)
          : null;

        console.log(
          `OK (jarak dari koordinat lama: ${dist !== null ? dist.toFixed(2) + " km" : "N/A"})`
        );

        results.push({
          _id: dest._id,
          name: dest.name,
          regency: dest.regency,
          old_location: dest.location,
          new_location: { lat: geo.lat, lng: geo.lng },
          nominatim_display_name: geo.display_name,
          nominatim_importance: geo.importance,
          matched_query: geo.matched_query,
          // 1 = query paling spesifik (nama+kabupaten+provinsi) berhasil = paling dipercaya
          // 4 = hanya nama saja yang berhasil = HATI-HATI, cek display_name baik-baik
          confidence_level: geo.attempt_level,
          distance_km: dist !== null ? Number(dist.toFixed(2)) : null,
          status: "FOUND",
        });
      }
    } catch (err) {
      console.log(`ERROR: ${err.message}`);
      results.push({
        _id: dest._id,
        name: dest.name,
        regency: dest.regency,
        old_location: dest.location,
        status: "ERROR",
        error: err.message,
      });
    }

    // Hormati rate limit Nominatim: max 1 request/detik
    await sleep(1100);
  }

  const fs = require("fs");
  fs.writeFileSync(
    "review_output.json",
    JSON.stringify(results, null, 2),
    "utf-8"
  );

  console.log("\nSelesai. Hasil tersimpan di review_output.json");
  console.log("\nRingkasan:");
  console.log(`  - Ditemukan & bisa direview: ${results.filter(r => r.status === "FOUND").length}`);
  console.log(`  - Tidak ditemukan (perlu manual): ${results.filter(r => r.status === "NOT_FOUND").length}`);
  console.log(`  - Error: ${results.filter(r => r.status === "ERROR").length}`);

  await client.close();
}

main().catch(console.error);
