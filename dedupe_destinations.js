// Cek dan bersihkan duplikat destinasi berdasarkan field "slug"
// Menyisakan HANYA 1 dokumen per slug (yang paling lama dibuat / _id terkecil), sisanya dihapus.

print("=== Mencari slug yang duplikat ===");

const duplicates = db.destinations.aggregate([
  { $group: { _id: "$slug", count: { $sum: 1 }, ids: { $push: "$_id" } } },
  { $match: { count: { $gt: 1 } } }
]).toArray();

print("Jumlah slug yang punya duplikat: " + duplicates.length);

let totalDeleted = 0;

duplicates.forEach(function (dup) {
  // Urutkan id, simpan yang pertama (paling lama), hapus sisanya
  const sortedIds = dup.ids.sort(); // ObjectId string-sortable secara kronologis
  const idsToDelete = sortedIds.slice(1); // buang semua kecuali yang pertama

  print("Slug: " + dup._id + " -> total " + dup.count + " dokumen, menghapus " + idsToDelete.length);

  const result = db.destinations.deleteMany({ _id: { $in: idsToDelete } });
  totalDeleted += result.deletedCount;
});

print("=== Selesai ===");
print("Total dokumen duplikat yang dihapus: " + totalDeleted);
print("Total dokumen tersisa di collection: " + db.destinations.countDocuments());

print("\n=== Verifikasi ulang (harus kosong kalau semua sudah bersih) ===");
const stillDup = db.destinations.aggregate([
  { $group: { _id: "$slug", count: { $sum: 1 } } },
  { $match: { count: { $gt: 1 } } }
]).toArray();
printjson(stillDup);
