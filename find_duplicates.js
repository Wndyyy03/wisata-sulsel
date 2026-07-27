db.destinations.aggregate([
  { $group: {
      _id: { name: "$name", regency: "$regency" },
      jumlah: { $sum: 1 },
      slugs: { $push: "$slug" },
      punyaGambar: { $push: { $cond: [{ $gt: [{ $size: { $ifNull: ["$images", []] } }, 0] }, true, false] } }
  }},
  { $match: { jumlah: { $gt: 1 } } }
]).forEach(printjson)
