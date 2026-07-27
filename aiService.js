const fetch = require("node-fetch");
const Destination = require("../models/Destination");
const { estimate, recommendVehicle } = require("./distanceService");

const OLLAMA_URL = () => `${process.env.OLLAMA_BASE_URL}/api/generate`;
const OLLAMA_MODEL = () => process.env.OLLAMA_MODEL || "llama3";

// ---------------------------------------------------------------------------
// Cache ringan untuk daftar kabupaten & nama destinasi yang benar-benar ada
// di database. Dipakai untuk (a) mendeteksi kalau pengguna secara eksplisit
// menyebut kabupaten/tempat lain (baru boleh pindah topik), dan (b) supaya
// AI tahu apa saja yang tersedia di web ini, bukan cuma yang kebetulan ke-
// search di pertanyaan saat ini.
// Cache di-refresh tiap 5 menit — cukup untuk data yang jarang berubah,
// tapi tetap otomatis update kalau ada destinasi baru ditambahkan.
// ---------------------------------------------------------------------------
let _catalogCache = null;
let _catalogCacheAt = 0;
const CATALOG_TTL_MS = 5 * 60 * 1000;

async function getCatalog() {
  const now = Date.now();
  if (_catalogCache && now - _catalogCacheAt < CATALOG_TTL_MS) return _catalogCache;

  const all = await Destination.find({}, { name: 1, regency: 1, category: 1 }).lean();
  const regencies = [...new Set(all.map((d) => d.regency).filter(Boolean))];

  _catalogCache = { destinations: all, regencies };
  _catalogCacheAt = now;
  return _catalogCache;
}

/** Cari apakah teks pertanyaan menyebut eksplisit salah satu kabupaten yang ada di DB. */
function detectExplicitRegency(text, regencies) {
  if (!text) return null;
  const lower = text.toLowerCase();
  const sorted = [...regencies].sort((a, b) => b.length - a.length);
  for (const r of sorted) {
    if (lower.includes(r.toLowerCase())) return r;
    const short = r.replace(/^kota\s+|^kabupaten\s+/i, "").trim();
    if (short && lower.includes(short.toLowerCase())) return r;
  }
  return null;
}

/** Cari destinasi terakhir yang sedang dibahas dari riwayat percakapan (kalau ada). */
function lastActiveDestinationFromHistory(conversationHistory) {
  if (!Array.isArray(conversationHistory)) return null;
  const last = [...conversationHistory].reverse().find((h) => h.destination);
  return last ? last.destination : null;
}

/**
 * Deteksi kalau pengguna secara eksplisit minta destinasi/tempat LAIN (bukan
 * lanjutan soal destinasi yang sama). Kalau ini terpicu, kita SENGAJA tidak
 * "mengunci" ke destinasi sebelumnya, supaya AI tidak salah lanjut membahas
 * tempat lama padahal user justru minta pilihan baru.
 */
function wantsDifferentPlace(text) {
  if (!text) return false;
  const lower = text.toLowerCase();
  const cues = [
    "tempat lain",
    "destinasi lain",
    "wisata lain",
    "rekomendasi lain",
    "spot lain",
    "yang lain",
    "selain itu",
    "opsi lain",
    "pilihan lain",
  ];
  return cues.some((c) => lower.includes(c));
}
function detectExplicitDestination(text, destinations) {
  if (!text) return null;
  const lower = text.toLowerCase();
  const sorted = [...destinations].sort((a, b) => b.name.length - a.name.length);
  for (const d of sorted) {
    if (lower.includes(d.name.toLowerCase())) return d;
  }
  return null;
}

/**
 * Cari SATU destinasi utama yang paling cocok dengan nama yang disebut/dicari.
 * Ini yang jadi subjek utama jawaban AI.
 */
async function findMainDestination(name, regencyFilter) {
  if (!name) return null;
  const filter = { name: new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i") };
  if (regencyFilter) filter.regency = new RegExp(`^${regencyFilter}$`, "i");
  let dest = await Destination.findOne(filter).lean();
  if (!dest) {
    // fallback: text search kalau nama tidak match persis
    dest = await Destination.findOne(
      { ...(regencyFilter ? { regency: new RegExp(`^${regencyFilter}$`, "i") } : {}), $text: { $search: name } },
      { score: { $meta: "textScore" } }
    )
      .sort({ score: { $meta: "textScore" } })
      .lean();
  }
  return dest;
}

/**
 * Cari destinasi LAIN di kabupaten yang sama (untuk rekomendasi tambahan),
 * mengecualikan destinasi utama yang sudah ditemukan supaya tidak duplikat/campur.
 */
async function findSupportingDestinations(regencyFilter, excludeId, limit = 3) {
  if (!regencyFilter) return [];
  const filter = { regency: new RegExp(`^${regencyFilter}$`, "i") };
  if (excludeId) filter._id = { $ne: excludeId };
  return Destination.find(filter).limit(limit).lean();
}

/**
 * Text search MURNI (tanpa fallback ke populer) — dipakai untuk MENEMUKAN
 * kandidat destinasi utama berdasarkan relevansi teks, termasuk kasus di mana
 * nama tempat yang disebut user (mis. "Tanjung Bira") bukan nama persis
 * destinasi di DB, tapi disebut di deskripsinya (mis. destinasi "Puncak Pua
 * Janggo" yang berlokasi di kawasan Tanjung Bira).
 */
async function searchDestinationsRanked(query, regencyFilter, limit = 5) {
  if (!query) return [];
  const filter = {};
  if (regencyFilter) filter.regency = new RegExp(`^${regencyFilter}$`, "i");
  return Destination.find({ ...filter, $text: { $search: query } }, { score: { $meta: "textScore" } })
    .sort({ score: { $meta: "textScore" } })
    .limit(limit)
    .lean();
}

/**
 * Cari destinasi relevan dari MongoDB berdasarkan teks bebas, dengan fallback
 * ke destinasi populer di kabupaten yang sama kalau text search kosong.
 * Dipakai HANYA untuk jalur "tidak ketemu destinasi utama sama sekali" —
 * hasilnya ditampilkan sebagai daftar terpisah, bukan digabung jadi satu.
 */
async function findRelevantDestinations(query, regencyFilter, limit = 4) {
  const results = await searchDestinationsRanked(query, regencyFilter, limit);
  if (results.length > 0) return results;

  if (regencyFilter) {
    const filter = { regency: new RegExp(`^${regencyFilter}$`, "i") };
    return Destination.find(filter).limit(limit).lean();
  }

  return [];
}

/** Susun blok konteks teks dari satu destinasi, termasuk estimasi jarak jika ada lokasi user */
function buildContextBlock(dest, userLocation) {
  let distanceInfo = "";
  if (userLocation && userLocation.lat && userLocation.lng) {
    const est = estimate(userLocation, dest.location);
    const vehicle = recommendVehicle(est.roadEstimateKm, dest.accessNotes);
    distanceInfo = `
- Estimasi jarak dari lokasi pengguna: ~${est.roadEstimateKm} km (garis lurus ${est.straightLineKm} km)
- Estimasi waktu tempuh: ${est.perVehicle.map((v) => `${v.vehicle}: ${v.estimatedDurationText}`).join(", ")}
- Rekomendasi kendaraan: ${vehicle}
- Catatan akses jalan: ${dest.accessNotes || "-"}`;
  }

  const lodgings =
    (dest.lodgings || [])
      .map((l) => `  • ${l.name} (${l.type}) - ${l.priceRange || "harga belum ada data"}`)
      .join("\n") || "  (belum ada data penginapan/villa untuk destinasi ini)";

  const eateries =
    (dest.eateries || [])
      .map(
        (e) =>
          `  • ${e.name} (${e.type}) - ${e.priceRange || "harga belum ada data"}${
            e.specialty ? `, terkenal: ${e.specialty}` : ""
          }`
      )
      .join("\n") || "  (belum ada data resto/cafe untuk destinasi ini)";

  const photoSpots =
    (dest.photoSpots || [])
      .map((p) => `  • ${p.name} - ${p.popularity}${p.description ? `: ${p.description}` : ""}`)
      .join("\n") || "  (belum ada data spot foto untuk destinasi ini)";

  return `
### ${dest.name} (${dest.category}, Kab./Kota ${dest.regency})
Deskripsi: ${dest.description}
Tiket masuk: ${dest.entryFee}
Jam buka: ${dest.openHours}
${distanceInfo}

Penginapan/Villa terdekat:
${lodgings}

Resto/Cafe terdekat:
${eateries}

Spot foto favorit:
${photoSpots}
`.trim();
}

/** Versi ringkas — hanya nama, kategori, 1 baris deskripsi. Dipakai untuk destinasi pendukung
 *  supaya AI tidak "keceplosan" mencampur detail lengkapnya dengan destinasi utama. */
function buildShortContextBlock(dest) {
  const shortDesc = (dest.description || "").split(".")[0];
  return `- ${dest.name} (${dest.category}, Kab./Kota ${dest.regency})${shortDesc ? `: ${shortDesc}.` : ""}`;
}

/** Susun ringkasan singkat riwayat percakapan (beberapa turn terakhir) untuk konteks model. */
function buildHistoryBlock(conversationHistory) {
  if (!Array.isArray(conversationHistory) || conversationHistory.length === 0) return "";
  const recent = conversationHistory.slice(-4);
  return recent
    .map((h) => `Pengguna: ${h.question}\nAsisten: ${h.answer}`)
    .join("\n\n");
}

/**
 * Fungsi utama: terima pertanyaan bebas dari user (+ opsional lokasi user, nama
 * destinasi spesifik, filter kabupaten, dan riwayat percakapan), rakit konteks
 * dari MongoDB, lalu tanya ke Ollama supaya jawabannya grounded di data kita
 * dan tetap konsisten di kabupaten/topik yang sama sampai pengguna eksplisit
 * pindah topik. Destinasi utama yang ditanya dipisahkan tegas dari destinasi
 * lain sekabupaten yang cuma jadi rekomendasi tambahan, supaya AI tidak
 * mencampur fakta dari tempat yang berbeda jadi satu narasi.
 */
async function askAI({ question, userLocation, destinationName, regency, conversationHistory }) {
  const catalog = await getCatalog();

  // --- Tentukan kabupaten yang "aktif" untuk pertanyaan ini -----------------
  let activeRegency = regency || null;
  let switchedByUser = false;

  if (!activeRegency) {
    const mentioned = detectExplicitRegency(question, catalog.regencies);
    if (mentioned) {
      activeRegency = mentioned;
      switchedByUser = true;
    }
  }

  let activeDestinationName = destinationName || null;
  if (!activeDestinationName) {
    const mentionedDest = detectExplicitDestination(question, catalog.destinations);
    if (mentionedDest) {
      activeDestinationName = mentionedDest.name;
      if (!activeRegency) {
        activeRegency = mentionedDest.regency;
        switchedByUser = true;
      }
    }
  }

  if (!activeRegency && Array.isArray(conversationHistory) && conversationHistory.length > 0) {
    const lastWithRegency = [...conversationHistory].reverse().find((h) => h.regency);
    if (lastWithRegency) activeRegency = lastWithRegency.regency;
  }

  // --- Ambil destinasi: pisahkan UTAMA vs PENDUKUNG -------------------------
  let mainDestination = null;
  let supportingDestinations = [];
  let fallbackDestinations = []; // dipakai HANYA kalau benar-benar tidak ada destinasi spesifik yang bisa ditentukan

  if (activeDestinationName) {
    // Kasus paling percaya diri: nama destinasi persis disebut/di-set eksplisit.
    mainDestination = await findMainDestination(activeDestinationName, activeRegency);
  }

  if (!mainDestination) {
    const continuationName = lastActiveDestinationFromHistory(conversationHistory);
    if (continuationName && !wantsDifferentPlace(question)) {
      // Pengguna tidak menyebut destinasi baru secara eksplisit dan tidak
      // minta "tempat lain" — anggap ini masih pertanyaan lanjutan soal
      // destinasi yang sama seperti turn sebelumnya. Ini yang mencegah AI
      // "lompat" ke destinasi lain hanya karena kebetulan skor text search-nya
      // lebih tinggi untuk kata-kata di pertanyaan lanjutan yang generik.
      mainDestination = await findMainDestination(continuationName, activeRegency);
    }
  }

  if (!mainDestination) {
    // Nama yang disebut user (mis. "Tanjung Bira") mungkin bukan nama persis
    // destinasi di DB, tapi cocok lewat text search (mis. muncul di deskripsi
    // destinasi "Puncak Pua Janggo"). Ambil hasil dengan skor relevansi
    // tertinggi sebagai destinasi utama, BUKAN digabung rata dengan hasil lain.
    const ranked = await searchDestinationsRanked(question, activeRegency, 5);
    if (ranked.length > 0) {
      mainDestination = ranked[0];
    }
  }

  if (mainDestination) {
    if (!activeRegency) {
      activeRegency = mainDestination.regency;
      switchedByUser = switchedByUser || !destinationName;
    }
    supportingDestinations = await findSupportingDestinations(activeRegency, mainDestination._id, 3);
  } else {
    // Benar-benar tidak ada satupun destinasi yang relevan lewat text search —
    // kalau kabupatennya sudah diketahui, tampilkan destinasi populer di sana
    // (masing-masing tetap dibahas terpisah), kalau tidak, biarkan kosong.
    fallbackDestinations = await findRelevantDestinations(question, activeRegency, 4);
  }

  const mainContextBlock = mainDestination ? buildContextBlock(mainDestination, userLocation) : "";
  const supportingContextText = supportingDestinations.length
    ? supportingDestinations.map(buildShortContextBlock).join("\n")
    : "";
  const fallbackContextBlock = fallbackDestinations.map((d) => buildContextBlock(d, userLocation)).join("\n\n---\n\n");

  const historyBlock = buildHistoryBlock(conversationHistory);
  const availableRegenciesText = catalog.regencies.sort().join(", ");

  const systemPrompt = `Kamu adalah "Sulsel Guide", asisten AI ramah untuk aplikasi wisata "Wisata Sulsel". Kamu
seperti pemandu wisata lokal yang hangat, antusias, dan membantu — bukan robot yang kaku. Sapa
pengguna secara natural, boleh pakai emoji sesekali kalau cocok dengan suasana, tapi tetap informatif
dan tidak bertele-tele.

CAKUPAN DATA: Kamu punya akses ke destinasi wisata di kabupaten/kota berikut di Sulawesi Selatan:
${availableRegenciesText}.
Kamu HANYA boleh menjawab berdasarkan data konteks yang diberikan di bawah — jangan pernah mengarang
harga, fakta, atau detail yang tidak ada di sana. Jika data yang ditanyakan tidak tersedia, katakan
dengan jujur dan ramah bahwa datanya belum ada, lalu sarankan verifikasi langsung ke pengelola tempat.

ATURAN PENTING — TETAP FOKUS DI SATU KOTA/KABUPATEN:
${
  activeRegency
    ? `- Percakapan ini SEDANG FOKUS di kabupaten/kota: **${activeRegency}**.
- Jawab pertanyaan pengguna dalam konteks kabupaten ini KECUALI pengguna secara eksplisit menyebut
  nama kabupaten/kota lain, atau eksplisit minta rekomendasi/destinasi baru di tempat lain.
- JANGAN tiba-tiba merekomendasikan atau membahas destinasi di kabupaten lain tanpa diminta.`
    : `- Belum ada kabupaten/kota spesifik yang dibahas di percakapan ini. Jika pertanyaan pengguna
  tidak menyebut kabupaten/kota tertentu, boleh tanyakan dengan ramah kabupaten mana yang mereka
  minati (dari daftar cakupan di atas), alih-alih langsung menebak.`
}

ATURAN PENTING — JANGAN CAMPUR DESTINASI YANG BERBEDA:
- Bagian "DESTINASI UTAMA" di bawah adalah SATU-SATUNYA destinasi yang sedang ditanyakan pengguna.
  Semua fakta spesifik (harga, jam buka, spot foto, sejarah, dsb) yang kamu sebutkan sebagai bagian
  dari tempat ini HARUS berasal dari blok tersebut SAJA.
- Bagian "DESTINASI LAIN DI KABUPATEN YANG SAMA" hanya daftar NAMA singkat untuk kamu tawarkan sebagai
  REKOMENDASI TAMBAHAN jika relevan (misal pengguna tanya "ada tempat lain yang bagus?"). JANGAN
  pernah menggabungkan detail dari daftar ini seolah itu bagian dari destinasi utama, dan jangan
  menyebutkan detail (harga/jam buka/dsb) untuk tempat-tempat ini karena detailnya tidak diberikan.
- Kalau tidak ada destinasi utama yang jelas (pengguna tanya umum soal kabupaten/kategori), pakai
  blok "DESTINASI (UMUM)" di bawah — setiap destinasi di situ tetap harus dibahas terpisah, jangan
  digabung jadi satu narasi seolah itu satu tempat yang sama.

ATURAN SUMBER DATA:
- Setiap fakta yang kamu sebutkan (harga, jam buka, jarak, dsb) HARUS berasal dari blok DATA KONTEKS
  di bawah. Jangan campur dengan pengetahuan umum di luar data ini.
- Kalau blok DATA KONTEKS kosong atau tidak relevan dengan pertanyaan, katakan terus terang bahwa kamu
  belum menemukan destinasi yang cocok di database untuk pertanyaan itu.

ATURAN KHUSUS ESTIMASI JARAK/WAKTU TEMPUH:
- HANYA sebutkan estimasi jarak, waktu tempuh, atau rekomendasi kendaraan JIKA angka tersebut
  benar-benar tertulis di bagian "Estimasi jarak dari lokasi pengguna" pada data konteks di bawah.
- Jika tidak ada baris tersebut untuk destinasi yang ditanyakan, JANGAN membuat angka sendiri.
  Katakan estimasi jarak belum bisa dihitung karena lokasi pengguna belum diketahui.
- Jangan pernah menyebut dua angka waktu tempuh berbeda untuk destinasi yang sama dalam satu jawaban.

${historyBlock ? `RIWAYAT PERCAKAPAN SEBELUMNYA (untuk konteks, jangan diulang mentah-mentah):\n${historyBlock}\n` : ""}
${
  mainDestination
    ? `DESTINASI UTAMA (satu-satunya sumber fakta detail untuk tempat yang ditanyakan):
${mainContextBlock}

DESTINASI LAIN DI KABUPATEN YANG SAMA (hanya nama, HANYA untuk rekomendasi tambahan, JANGAN campur detailnya dengan destinasi utama):
${supportingContextText || "(tidak ada destinasi lain yang tercatat di kabupaten ini)"}`
    : `DESTINASI (UMUM — bahas masing-masing terpisah, JANGAN digabung jadi satu narasi):
${fallbackContextBlock || "(Tidak ada destinasi yang cocok ditemukan di database untuk pertanyaan ini.)"}`
}
`;

  const fullPrompt = `${systemPrompt}\n\nPERTANYAAN PENGGUNA: ${question}\n\nJAWABAN:`;

  const response = await fetch(OLLAMA_URL(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: OLLAMA_MODEL(),
      prompt: fullPrompt,
      stream: false,
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    throw new Error(`Ollama API error ${response.status}: ${errText}`);
  }

  const data = await response.json();

  const sourcesUsed = mainDestination
    ? [{ id: mainDestination._id, name: mainDestination.name, regency: mainDestination.regency }]
    : fallbackDestinations.map((d) => ({ id: d._id, name: d.name, regency: d.regency }));

  return {
    answer: data.response || "(AI tidak mengembalikan jawaban)",
    sourcesUsed,
    activeRegency,
    activeDestination: mainDestination ? mainDestination.name : null,
    topicSwitched: switchedByUser,
  };
}

module.exports = {
  askAI,
  findRelevantDestinations,
  findMainDestination,
  findSupportingDestinations,
  searchDestinationsRanked,
  buildContextBlock,
  getCatalog,
};
