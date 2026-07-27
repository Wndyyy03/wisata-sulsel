const hasilHapus = db.destinations.deleteMany({
  slug: {
    $in: [
      "pulau-samalona-makassar",
      "benteng-rotterdam-makassar",
      "rammang-rammang-maros",
      "pantai-losari-makassar",
      "tanjung-bira-bulukumba"
    ]
  }
});
printjson(hasilHapus);
