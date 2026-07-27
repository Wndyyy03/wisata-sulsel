/**
 * apply_updates.js
 *
 * Jalankan SETELAH Anda review review_output.json secara manual.
 *
 * Cara pakai:
 *   1. Buka review_output.json
 *   2. Untuk setiap entri yang mau Anda terapkan, tambahkan field: "approve": true
 *      (biarkan entri yang raguan / salah tangkap lokasi TIDAK punya field ini,
 *       atau set "approve": false)
 *   3. Simpan filenya
 *   4. node apply_updates.js
 *
 * Script ini HANYA akan mengupdate _id yang punya approve: true — supaya
 * tidak ada update massal yang tidak sengaja menimpa data yang salah geocode.
 */

const { MongoClient, ObjectId } = require("mongodb");
const fs = require("fs");

const MONGO_URI = "mongodb://root:rootpass@mongo:27017/wisata_sulsel?authSource=admin";
const DB_NAME = "wisata_sulsel";
const COLLECTION = "destinations";

async function main() {
  const raw = fs.readFileSync("review_output.json", "utf-8");
  const results = JSON.parse(raw);

  const approved = results.filter((r) => r.approve === true && r.new_location);

  if (approved.length === 0) {
    console.log(
      "Tidak ada entri dengan approve: true. Edit review_output.json dulu sebelum jalankan script ini."
    );
    return;
  }

  console.log(`Akan mengupdate ${approved.length} destinasi:\n`);
  approved.forEach((r) =>
    console.log(`  - ${r.name} (${r.regency}): ${JSON.stringify(r.old_location)} -> ${JSON.stringify(r.new_location)}`)
  );

  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const col = client.db(DB_NAME).collection(COLLECTION);

  let updated = 0;
  for (const r of approved) {
    const res = await col.updateOne(
      { _id: new ObjectId(r._id) },
      { $set: { location: r.new_location, updatedAt: new Date() } }
    );
    if (res.modifiedCount === 1) updated++;
  }

  console.log(`\nSelesai. ${updated} dokumen berhasil diupdate.`);
  await client.close();
}

main().catch(console.error);
