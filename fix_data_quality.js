// ============================================================
// KOREKSI 1: Kendaraan logis untuk destinasi berkategori Pulau
// (sebelumnya masih default "Motor, Mobil" - salah, seharusnya kapal/perahu)
// ============================================================
const pulauFix = [
  { slug: "pulau-kambing-bulukumba", catatan: "Diakses dengan perahu sewaan sekitar 20 menit dari Pantai Bira, tidak ada akses kendaraan darat ke pulau." },
  { slug: "pulau-camba-cambang-pangkep", catatan: "Diakses dengan perahu sewaan sekitar 10-15 menit dari Dermaga Maccini Baji, Labakkang, tidak ada akses kendaraan darat ke pulau." },
  { slug: "pulau-libukang-jeneponto", catatan: "Diakses dengan perahu kecil sekitar 15 menit menyeberang dari daratan Jeneponto, tidak ada akses kendaraan darat ke pulau." },
];

pulauFix.forEach(item => {
  const hasil = db.destinations.updateOne(
    { slug: item.slug },
    { $set: { bestVehicle: ["Kapal/Speedboat"], accessNotes: item.catatan } }
  );
  print("Update kendaraan " + item.slug + ": " + JSON.stringify(hasil));
});

// ============================================================
// KOREKSI 2: Kendaraan untuk destinasi yang butuh jalan kaki/trekking
// (kategori Pegunungan/Air Terjun dengan medan sulit tetap naik kendaraan darat
//  ke titik parkir, lalu jalan kaki - BUKAN kapal)
// ============================================================
const trekkingFix = [
  { slug: "air-terjun-parangloe-gowa", catatan: "Kendaraan darat sampai area parkir, dilanjutkan trekking jalan kaki sekitar 45-60 menit menembus jalur berbatu menuju air terjun." },
  { slug: "air-terjun-maddenge-maros", catatan: "Kendaraan darat sampai desa terdekat, dilanjutkan jalan kaki menyusuri jalur tebing menuju lokasi air terjun." },
  { slug: "bulu-sorongan-pangkep", catatan: "Kendaraan darat sampai titik awal pendakian di Desa Parenreng, dilanjutkan trekking mendaki sekitar 2-3 jam menuju puncak 731 mdpl." },
  { slug: "air-terjun-tamalulua-jeneponto", catatan: "Kendaraan darat sampai desa terdekat, dilanjutkan trekking jalan kaki dengan medan cukup terjal menuju air terjun." },
  { slug: "gua-passohara-bulukumba", catatan: "Kendaraan darat sampai Desa Wisata Ara, dilanjutkan jalan kaki menuju mulut gua; perlu penerangan (senter) untuk masuk ke dalam gua." },
  { slug: "batutumonga-toraja-utara", catatan: "Kendaraan darat menanjak dari Rantepao sekitar 1 jam melewati jalur pegunungan Sesean menuju lokasi." },
];

trekkingFix.forEach(item => {
  const hasil = db.destinations.updateOne(
    { slug: item.slug },
    { $set: { bestVehicle: ["Motor", "Mobil"], accessNotes: item.catatan } }
  );
  print("Update trekking " + item.slug + ": " + JSON.stringify(hasil));
});

// ============================================================
// KOREKSI 3: Tambahkan spot foto favorit untuk semua destinasi batch 2
// ============================================================
const photoSpotData = [
  { slug: "tanjung-bira-bulukumba", spot: "Dermaga kayu Tanjung Bira", desc: "Titik favorit wisatawan berfoto dengan latar laut biru jernih dan pasir putih, ramai saat sore menjelang sunset." },
  { slug: "pantai-apparalang-bulukumba", spot: "Tebing atas Apparalang", desc: "Spot foto paling populer, memotret gradasi warna laut dari atas tebing karang." },
  { slug: "pantai-bara-bulukumba", spot: "Gazebo tepi Pantai Bara", desc: "Spot favorit menikmati suasana pantai yang lebih sepi dibanding Bira." },
  { slug: "puncak-pua-janggo-bulukumba", spot: "Puncak batu berpagar kuning", desc: "Spot foto ikonik dengan latar rimbunnya pepohonan dan birunya laut Tanjung Bira." },
  { slug: "pulau-kambing-bulukumba", spot: "Area snorkeling terumbu karang", desc: "Spot favorit untuk foto bawah air dan momen naik perahu menuju pulau." },
  { slug: "gua-passohara-bulukumba", spot: "Danau jernih dalam gua", desc: "Spot foto favorit di dalam gua, memotret pantulan cahaya senter di air jernih." },

  { slug: "malino-highland-gowa", spot: "Kebun teh hijau Malino", desc: "Spot foto paling populer, hamparan kebun teh dengan kabut pagi khas dataran tinggi." },
  { slug: "air-terjun-takapala-gowa", spot: "Jembatan pandang air terjun", desc: "Titik foto favorit dengan latar air terjun setinggi 109 meter dan kabut yang menyembur." },
  { slug: "bendungan-bili-bili-gowa", spot: "Bebatuan tepi bendungan", desc: "Spot favorit berfoto dengan latar air jernih dan bebatuan eksotis saat musim kemarau." },
  { slug: "air-terjun-parangloe-gowa", spot: "Kolam alami di bawah air terjun", desc: "Spot foto favorit sekaligus tempat bermain air setelah trekking." },
  { slug: "danau-tanralili-gowa", spot: "Tepi Danau Tanralili", desc: "Spot foto favorit dengan pantulan perbukitan hijau di permukaan danau yang tenang." },
  { slug: "masjid-katangka-gowa", spot: "Halaman depan Masjid Katangka", desc: "Spot foto favorit dengan latar arsitektur masjid tertua bergaya khas Gowa." },

  { slug: "pantai-losari-makassar", spot: "Anjungan Pantai Losari", desc: "Spot foto paling populer di Makassar saat golden hour menjelang matahari terbenam." },
  { slug: "benteng-rotterdam-makassar", spot: "Gerbang utama benteng", desc: "Spot foto favorit dengan latar arsitektur kolonial dan halaman rumput benteng." },
  { slug: "pulau-samalona-makassar", spot: "Dermaga kayu Pulau Samalona", desc: "Spot foto favorit dengan air laut jernih dan pemandangan skyline Makassar dari kejauhan." },
  { slug: "masjid-99-kubah-makassar", spot: "Area Center Point of Indonesia", desc: "Spot foto favorit terutama malam hari saat kubah masjid menyala bercahaya." },
  { slug: "trans-studio-makassar", spot: "Lobi utama Trans Studio", desc: "Spot foto favorit keluarga sebelum dan sesudah menaiki wahana." },
  { slug: "pantai-akkarena-makassar", spot: "Dermaga kayu Akkarena", desc: "Spot foto favorit menjelang senja dengan deretan lampu restoran di tepi pantai." },

  { slug: "rammang-rammang-maros", spot: "Kampung Berua di tengah karst", desc: "Spot foto paling ikonik, perkampungan kecil dikelilingi tebing karst dan sawah hijau." },
  { slug: "tn-bantimurung-maros", spot: "Kolam alami dekat air terjun utama", desc: "Spot foto favorit dengan latar air terjun dan kupu-kupu beterbangan di sekitarnya." },
  { slug: "leang-leang-maros", spot: "Mulut gua dengan lukisan purba", desc: "Spot foto favorit bagi yang tertarik sejarah, dengan latar dinding gua prasejarah." },
  { slug: "air-terjun-maddenge-maros", spot: "Celah tebing air terjun", desc: "Spot foto favorit karena bentuk air terjun yang unik terhimpit dua tebing." },
  { slug: "air-panas-rea-toa-maros", spot: "Kolam air panas alami", desc: "Spot foto favorit sambil berendam menikmati pemandangan pegunungan." },

  { slug: "londa-toraja-utara", spot: "Dinding tebing peti mati Londa", desc: "Spot foto favorit (dengan tetap menghormati situs pemakaman), memotret susunan peti dan tau-tau di tebing." },
  { slug: "danau-limbong-toraja-utara", spot: "Tepi Danau Limbong", desc: "Spot foto favorit dengan air hijau tenang dan pegunungan sebagai latar." },
  { slug: "museum-ne-gandeng-toraja-utara", spot: "Halaman pondok Tongkonan museum", desc: "Spot foto favorit dengan latar rumah adat mini dan koleksi menhir." },
  { slug: "bukit-singki-toraja-utara", spot: "Area salib raksasa", desc: "Spot foto favorit dengan latar salib 30 meter dan panorama Kota Rantepao dari atas." },
  { slug: "batutumonga-toraja-utara", spot: "Titik pandang lereng Gunung Sesean", desc: "Spot foto favorit terutama pagi hari saat sunrise di atas hamparan sawah terasering." },

  { slug: "lembah-kendenan-tana-toraja", spot: "Puncak pandang Lembah Kendenan", desc: "Spot foto favorit dengan latar perbukitan hijau berkabut mirip dataran tinggi Eropa." },
  { slug: "makam-lemo-tana-toraja", spot: "Deretan tau-tau di tebing Lemo", desc: "Spot foto favorit (dengan tetap menghormati situs pemakaman), memotret patung tau-tau yang menjaga makam." },
  { slug: "suaya-tana-toraja", spot: "Kompleks makam bangsawan Suaya", desc: "Spot foto favorit bagi peminat sejarah keluarga bangsawan Toraja." },
  { slug: "buntu-burake-tana-toraja", spot: "Area patung Yesus Buntu Burake", desc: "Spot foto favorit dengan latar patung raksasa dan panorama Kota Makale dari ketinggian." },

  { slug: "sumpang-bita-pangkep", spot: "Mulut Gua Sumpang Bita", desc: "Spot foto favorit dengan latar gua terbesar di Sulsel dan area purbakala sekitarnya." },
  { slug: "leang-lonrong-pangkep", spot: "Kolam pemandian dalam gua", desc: "Spot foto favorit dengan latar stalaktit dan air jernih pegunungan." },
  { slug: "air-terjun-cambang-cui-pangkep", spot: "Kolam alami di bawah air terjun", desc: "Spot foto favorit sambil bermain air di kaki Gunung Bulu Saraung." },
  { slug: "bulu-sorongan-pangkep", spot: "Puncak Bulu Sorongan", desc: "Spot foto favorit dengan panorama hijau 731 mdpl setelah pendakian." },
  { slug: "pulau-camba-cambang-pangkep", spot: "Dermaga kayu Pulau Camba-Cambang", desc: "Spot foto favorit dengan air laut jernih dan penginapan kecil khas pulau." },

  { slug: "pantai-marina-bantaeng", spot: "Tembok duduk tepi Pantai Marina", desc: "Spot foto favorit dengan latar laut lepas, ramai saat sore hari." },
  { slug: "air-terjun-bissappu-bantaeng", spot: "Gazebo pandang air terjun", desc: "Spot foto favorit dengan latar air terjun setinggi 80 meter." },
  { slug: "bukit-rumbia-bantaeng", spot: "Pohon besar di puncak Bukit Rumbia", desc: "Spot foto favorit dengan latar hamparan rumput hijau luas." },
  { slug: "balla-lompoa-bantaeng", spot: "Halaman depan Rumah Adat Balla Lompoa", desc: "Spot foto favorit dengan latar arsitektur atap perahu terbalik khas Bantaeng." },

  { slug: "pantai-tamarunang-jeneponto", spot: "Tepi Pantai Tamarunang", desc: "Spot foto favorit menjelang sunset, mirip suasana Pantai Losari." },
  { slug: "pantai-garassikang-jeneponto", spot: "Gugusan batu karang Garassikang", desc: "Spot foto favorit bagi pecinta fotografi, terutama saat sunrise/sunset." },
  { slug: "air-terjun-tamalulua-jeneponto", spot: "Kolam alami air terjun Tama'lulua", desc: "Spot foto favorit setelah trekking, dengan latar air terjun tersembunyi." },
  { slug: "pulau-libukang-jeneponto", spot: "Pantai pasir putih Pulau Libukang", desc: "Spot foto favorit dengan latar pohon kelapa dan air laut jernih." },
  { slug: "danau-bulu-jaya-jeneponto", spot: "Tepi Danau Bulu Jaya", desc: "Spot foto favorit dengan pemandangan danau dari perbukitan sekitar." },

  { slug: "air-terjun-sumpang-puli-wajo", spot: "Kolam alami air terjun Sumpang Puli", desc: "Spot foto favorit sambil berendam di tengah Pegunungan Keera yang asri." },
  { slug: "rumah-adat-attakkae-wajo", spot: "Depan Rumah Adat Saoraja Tenri Bali", desc: "Spot foto favorit dengan latar 1.001 tiang penyangga rumah adat terbesar di Wajo." },
  { slug: "museum-saoraja-mallangga-wajo", spot: "Ruang koleksi utama museum", desc: "Spot foto favorit dengan latar arsitektur istana bertingkat khas Bugis." },
  { slug: "masjid-ummul-qura-wajo", spot: "Halaman depan Masjid Ummul Qura", desc: "Spot foto favorit terutama saat sholat Jumat atau Ramadan." },
  { slug: "desa-sutera-pakkana-wajo", spot: "Area pemintalan benang sutera", desc: "Spot foto favorit sambil menyaksikan proses tenun sutera langsung." },

  { slug: "air-panas-lejja-soppeng", spot: "Kolam utama Pemandian Lejja", desc: "Spot foto favorit sambil berendam air panas alami 60 derajat celcius." },
  { slug: "puncak-gunung-sewo-soppeng", spot: "Puncak Gunung Sewo", desc: "Spot foto favorit dengan panorama Kota Soppeng dari ketinggian 450 mdpl." },
  { slug: "rumah-adat-sao-mario-soppeng", spot: "Kompleks Rumah Adat Sao Mario", desc: "Spot foto favorit dengan latar beragam rumah adat Nusantara dalam satu kawasan." },
  { slug: "pemandian-ompo-soppeng", spot: "Kolam jernih Pemandian Ompo", desc: "Spot foto favorit dengan air sangat jernih dan sejuk khas pegunungan." },

  { slug: "goa-mampu-bone", spot: "Mulut Goa Mampu", desc: "Spot foto favorit dengan latar stalaktit-stalagmit dan legenda kutukan kerajaan." },
  { slug: "puncak-lima-jari-bone", spot: "Ayunan akar pohon Puncak Lima Jari", desc: "Spot foto paling ikonik dan populer di Bone, ayunan dengan latar pegunungan hijau." },
  { slug: "hutan-pinus-bulu-tanah-bone", spot: "Hammock di antara pohon pinus", desc: "Spot foto favorit komunitas motor dan pecinta alam." },
  { slug: "bola-soba-bone", spot: "Halaman depan Bola Soba", desc: "Spot foto favorit dengan latar rumah adat Bugis peninggalan Raja Bone." },
  { slug: "pantai-togeo-tonra-bone", spot: "Deretan pohon kelapa Togeo Tonra", desc: "Spot foto favorit dengan latar laut biru jernih dan pasir halus." },
];

photoSpotData.forEach(item => {
  const hasil = db.destinations.updateOne(
    { slug: item.slug },
    { $set: { photoSpots: [{ name: item.spot, description: item.desc, popularity: "Sangat populer" }] } }
  );
  print("Update photoSpot " + item.slug + ": " + JSON.stringify(hasil));
});

print("SELESAI. Total photoSpot diproses: " + photoSpotData.length);
