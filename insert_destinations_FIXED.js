// Insert 7 destinasi baru untuk kabupaten yang belum punya data
// === DIPERBAIKI: koordinat & regency (lihat catatan verifikasi di setiap entri) ===
db.destinations.insertMany([
  {
    name: "Kete Kesu",
    slug: "kete-kesu-tana-toraja",
    category: "Budaya/Sejarah",
    // FIX: regency lama "Tana Toraja" SALAH -> lokasi asli ada di kab. Toraja Utara
    regency: "Toraja Utara",
    description: "Desa wisata ikon budaya Toraja dengan rumah adat Tongkonan yang masih berdiri kokoh, lumbung padi khas, serta situs pemakaman kuno di tebing batu berusia ratusan tahun.",
    // FIX: koordinat lama (-3.0450, 119.8667) tidak akurat.
    // Terverifikasi via Wikidata (Q15905339): 3°0'5.292"S, 119°54'43.020"E
    location: { lat: -3.0015, lng: 119.9120 }, // sumber: wikidata.org/wiki/Q15905339
    images: [],
    entryFee: "Rp15.000 per orang, mohon verifikasi ke pengelola",
    openHours: "08.00 - 17.00",
    bestVehicle: ["Motor", "Mobil"],
    accessNotes: "Berlokasi di Kelurahan Panta'nakan Lolo, Kecamatan Kesu, sekitar 10-15 km dari Rantepao. Jalan aspal mulus, dapat diakses kendaraan roda dua maupun roda empat.",
    photoSpots: [
      { name: "Deretan Tongkonan", description: "Rumah adat Toraja berjejer dengan lumbung padi", popularity: "Sangat populer" },
      { name: "Kuburan tebing batu", description: "Situs pemakaman kuno di belakang desa", popularity: "Populer" }
    ],
    lodgings: [
      { name: "Toraja Heritage Hotel", type: "Hotel", priceRange: "Rp400.000 - Rp800.000 / malam", distanceFromSpotKm: 5, notes: "Berlokasi di Rantepao" }
    ],
    eateries: [
      { name: "RM Rachmat", type: "Resto", priceRange: "Rp25.000 - Rp60.000 / porsi", distanceFromSpotKm: 4, specialty: "Masakan khas Toraja" }
    ],
    tags: ["budaya", "tongkonan", "sejarah", "toraja"]
  },
  {
    name: "Pulau Kapoposang",
    slug: "pulau-kapoposang-pangkep",
    category: "Pulau",
    regency: "Pangkajene dan Kepulauan",
    description: "Pulau di gugusan Kepulauan Spermonde dengan terumbu karang dan biota laut yang kaya, populer untuk snorkeling dan diving, bagian dari Taman Wisata Perairan Kapoposang.",
    // BELUM DIVERIFIKASI - koordinat lama dipertahankan, perlu cek manual Google Maps
    location: { lat: -4.6667, lng: 118.9667 }, // TODO: verifikasi manual
    images: [],
    entryFee: "Belum ada data, mohon verifikasi ke pengelola",
    openHours: "06.00 - 18.00",
    bestVehicle: ["Kapal/Speedboat"],
    accessNotes: "Diakses menggunakan kapal atau speedboat sewaan dari Pelabuhan Kayu Bangkoa atau Paotere, Makassar, sekitar 2-3 jam perjalanan laut.",
    photoSpots: [
      { name: "Spot snorkeling terumbu karang", description: "Area terumbu karang jernih di sekitar pulau", popularity: "Sangat populer" }
    ],
    lodgings: [
      { name: "Homestay Kapoposang", type: "Homestay", priceRange: "Rp150.000 - Rp300.000 / malam", distanceFromSpotKm: 0, notes: "Penginapan sederhana milik warga pulau" }
    ],
    eateries: [
      { name: "Warung Nelayan Kapoposang", type: "Warung", priceRange: "Rp20.000 - Rp50.000 / porsi", distanceFromSpotKm: 0, specialty: "Seafood segar" }
    ],
    tags: ["pulau", "snorkeling", "diving", "spermonde"]
  },
  {
    name: "Pantai Seruni",
    slug: "pantai-seruni-bantaeng",
    category: "Pantai",
    regency: "Bantaeng",
    description: "Pantai ikon Kabupaten Bantaeng yang terletak di pusat kota, populer untuk menikmati sunset dengan fasilitas tempat duduk tembok di sepanjang pantai serta area bermain anak.",
    // BELUM DIVERIFIKASI
    location: { lat: -5.5386, lng: 119.9647 }, // TODO: verifikasi manual
    images: [],
    entryFee: "Belum ada data, mohon verifikasi ke pengelola",
    openHours: "06.00 - 21.00",
    bestVehicle: ["Motor", "Mobil"],
    accessNotes: "Jalan aspal, berada di Kelurahan Tappanjeng, sekitar 5 menit dari pusat Kota Bantaeng melalui jalan poros.",
    photoSpots: [
      { name: "Spot sunset tepi pantai", description: "Area tembok duduk menghadap laut untuk menikmati matahari terbenam", popularity: "Sangat populer" }
    ],
    lodgings: [
      { name: "Hotel Same Bantaeng", type: "Hotel", priceRange: "Rp250.000 - Rp500.000 / malam", distanceFromSpotKm: 1, notes: "Hotel terdekat di pusat kota Bantaeng" }
    ],
    eateries: [
      { name: "Warung Seruni", type: "Warung", priceRange: "Rp15.000 - Rp40.000 / porsi", distanceFromSpotKm: 0, specialty: "Jajanan dan makanan ringan pantai" }
    ],
    tags: ["pantai", "sunset", "bantaeng"]
  },
  {
    name: "Batu Siping",
    slug: "batu-siping-jeneponto",
    category: "Pantai",
    regency: "Jeneponto",
    description: "Formasi batuan unik hasil abrasi laut alami di pesisir Jeneponto, menjadi spot foto instagramable yang populer bagi wisatawan pecinta fotografi.",
    // BELUM DIVERIFIKASI
    location: { lat: -5.6333, lng: 119.6833 }, // TODO: verifikasi manual
    images: [],
    entryFee: "Belum ada data, mohon verifikasi ke pengelola",
    openHours: "06.00 - 18.00",
    bestVehicle: ["Motor", "Mobil"],
    accessNotes: "Terletak di Desa Garassikang, Kecamatan Bangkala Barat, dapat diakses kendaraan roda dua maupun roda empat.",
    photoSpots: [
      { name: "Formasi Batu Siping", description: "Bebatuan hasil abrasi laut dengan bentuk unik", popularity: "Sangat populer" }
    ],
    lodgings: [],
    eateries: [
      { name: "Warung Pesisir Bangkala", type: "Warung", priceRange: "Rp15.000 - Rp35.000 / porsi", distanceFromSpotKm: 2, specialty: "Ikan bakar" }
    ],
    tags: ["pantai", "bebatuan", "jeneponto", "fotografi"]
  },
  {
    name: "Danau Tempe",
    slug: "danau-tempe-wajo",
    category: "Danau",
    regency: "Wajo",
    description: "Salah satu danau terbesar di Sulawesi Selatan dengan pemandangan rumah terapung khas Bugis dan aktivitas nelayan setempat, jadi primadona wisata alam Kabupaten Wajo.",
    // BELUM DIVERIFIKASI
    location: { lat: -4.0833, lng: 119.9167 }, // TODO: verifikasi manual
    images: [],
    entryFee: "Belum ada data, mohon verifikasi ke pengelola",
    openHours: "06.00 - 18.00",
    bestVehicle: ["Motor", "Mobil"],
    accessNotes: "Berjarak sekitar 225 km dari Makassar (4-5 jam), area parkir tersedia, dilanjutkan dengan perahu sewaan untuk berkeliling danau.",
    photoSpots: [
      { name: "Rumah terapung Danau Tempe", description: "Perkampungan nelayan dengan rumah apung khas Bugis", popularity: "Sangat populer" }
    ],
    lodgings: [
      { name: "Hotel Al-Mubarak Sengkang", type: "Hotel", priceRange: "Rp200.000 - Rp450.000 / malam", distanceFromSpotKm: 7, notes: "Berlokasi di Kota Sengkang" }
    ],
    eateries: [
      { name: "Warung Apung Danau Tempe", type: "Warung", priceRange: "Rp20.000 - Rp50.000 / porsi", distanceFromSpotKm: 0, specialty: "Ikan bakar air tawar" }
    ],
    tags: ["danau", "wajo", "sengkang", "rumah apung"]
  },
  {
    name: "Taman Kalong",
    slug: "taman-kalong-soppeng",
    category: "Taman/Kota",
    regency: "Soppeng",
    description: "Taman kota ikon Watansoppeng yang menjadi rumah bagi ribuan kelelawar (kalong) bergelantungan di pepohonan raksasa, fenomena unik yang jadi daya tarik utama kota ini.",
    // BELUM DIVERIFIKASI
    location: { lat: -4.3667, lng: 119.9167 }, // TODO: verifikasi manual
    images: [],
    entryFee: "Belum ada data, mohon verifikasi ke pengelola",
    openHours: "06.00 - 21.00",
    bestVehicle: ["Motor", "Mobil"],
    accessNotes: "Terletak di jantung Kota Watansoppeng, jalan aspal, mudah diakses kendaraan roda dua maupun roda empat.",
    photoSpots: [
      { name: "Pohon kalong bergelantungan", description: "Ribuan kelelawar bergelantungan di pepohonan besar taman kota", popularity: "Sangat populer" }
    ],
    lodgings: [
      { name: "Hotel Botto Permai", type: "Hotel", priceRange: "Rp200.000 - Rp400.000 / malam", distanceFromSpotKm: 1, notes: "Berlokasi di pusat Kota Watansoppeng" }
    ],
    eateries: [
      { name: "RM Bumi Latemmamala", type: "Resto", priceRange: "Rp20.000 - Rp50.000 / porsi", distanceFromSpotKm: 1, specialty: "Masakan khas Bugis Soppeng" }
    ],
    tags: ["taman kota", "kalong", "soppeng", "watansoppeng"]
  },
  {
    name: "Tanjung Pallette",
    slug: "tanjung-pallette-bone",
    category: "Pantai",
    regency: "Bone",
    description: "Pantai favorit di Kabupaten Bone dengan fasilitas lengkap termasuk waterpark, villa, dan cafe, menawarkan pemandangan laut yang eksotis di dekat Kota Watampone.",
    // FIX BUG: sebelumnya identik dengan "Bola Soba" (-4.5333, 120.3333).
    // Tanjung Pallette ada di pesisir timur Watampone (~13km), bukan di pusat kota. Estimasi diperbaiki, TODO verifikasi presisi.
    location: { lat: -4.5280, lng: 120.3980 },
    images: [],
    entryFee: "Belum ada data, mohon verifikasi ke pengelola",
    openHours: "06.00 - 18.00",
    bestVehicle: ["Motor", "Mobil"],
    accessNotes: "Berjarak sekitar 13 km dari Kota Watampone (sekitar 25 menit), jalan aspal, dapat diakses kendaraan roda dua maupun roda empat.",
    photoSpots: [
      { name: "Tepi pantai Tanjung Pallette", description: "Garis pantai dengan gazebo dan waterpark", popularity: "Sangat populer" }
    ],
    lodgings: [
      { name: "Villa Tanjung Pallette", type: "Villa", priceRange: "Rp350.000 - Rp700.000 / malam", distanceFromSpotKm: 0, notes: "Tersedia langsung di kawasan wisata" }
    ],
    eateries: [
      { name: "Cafe Tanjung Pallette", type: "Cafe", priceRange: "Rp20.000 - Rp60.000 / porsi", distanceFromSpotKm: 0, specialty: "Seafood dan minuman segar" }
    ],
    tags: ["pantai", "bone", "watampone", "waterpark"]
  }
]);
