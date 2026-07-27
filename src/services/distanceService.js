/**
 * Estimasi jarak & waktu tempuh berbasis haversine (jarak garis lurus) dikali
 * faktor kelokan jalan (route factor), lalu dibagi kecepatan rata-rata tiap moda.
 *
 * CATATAN: ini estimasi kasar, bukan rute jalan aktual (butuh Google Maps
 * Directions API / OSRM untuk itu). Cukup untuk kasar-kasaran & bisa
 * ditingkatkan nanti dengan mengganti fungsi `estimate()` memanggil routing API asli.
 */

const EARTH_RADIUS_KM = 6371;

// Faktor pengali jarak lurus -> jarak jalan aktual (jalan tidak pernah lurus)
const ROUTE_FACTOR = 1.35;

// Kecepatan rata-rata realistis per moda di Sulsel (macet, jalan pegunungan, dsb)
const AVG_SPEED_KMH = {
  Motor: 45,
  Mobil: 40,
  "Bus/Travel": 35,
  Kapal: 25,
};

function toRad(deg) {
  return (deg * Math.PI) / 180;
}

function haversineKm(a, b) {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return EARTH_RADIUS_KM * c;
}

function estimate(originLatLng, destLatLng) {
  const straightKm = haversineKm(originLatLng, destLatLng);
  const roadKm = straightKm * ROUTE_FACTOR;

  const perVehicle = Object.entries(AVG_SPEED_KMH).map(([vehicle, speed]) => {
    const hours = roadKm / speed;
    return {
      vehicle,
      estimatedDistanceKm: Number(roadKm.toFixed(1)),
      estimatedDurationHours: Number(hours.toFixed(2)),
      estimatedDurationText: formatHours(hours),
    };
  });

  return {
    straightLineKm: Number(straightKm.toFixed(1)),
    roadEstimateKm: Number(roadKm.toFixed(1)),
    perVehicle,
  };
}

function formatHours(hours) {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (h === 0) return `${m} menit`;
  if (m === 0) return `${h} jam`;
  return `${h} jam ${m} menit`;
}

/** Rekomendasikan kendaraan paling cocok berdasarkan jarak & tipe medan destinasi */
function recommendVehicle(roadKm, accessNotes = "") {
  const notesLower = accessNotes.toLowerCase();
  if (notesLower.includes("kapal") || notesLower.includes("perahu") || notesLower.includes("pulau")) {
    return "Kapal/Perahu (dilanjutkan kendaraan darat dari pelabuhan)";
  }
  if (roadKm > 150) return "Mobil pribadi atau Bus/Travel (jarak jauh, lebih nyaman & aman)";
  if (notesLower.includes("tanjakan") || notesLower.includes("pegunungan") || notesLower.includes("berkelok")) {
    return "Mobil atau motor dengan kondisi prima (medan menanjak/berkelok)";
  }
  return "Motor (lincah & hemat) atau Mobil (lebih nyaman untuk keluarga)";
}

module.exports = { haversineKm, estimate, recommendVehicle };
