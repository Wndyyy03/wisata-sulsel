db.destinations.find({}, {name: 1, regency: 1, location: 1, _id: 0}).forEach(printjson)
