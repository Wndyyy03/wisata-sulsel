db.destinations.aggregate([
  { $group: {
      _id: "$name",
      count: { $sum: 1 },
      slugs: { $push: "$slug" },
      regencies: { $push: "$regency" },
      ids: { $push: "$_id" }
  }},
  { $match: { count: { $gt: 1 } } }
]).forEach(printjson)
