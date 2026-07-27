const Destination = require("../models/Destination");
const { estimate, recommendVehicle } = require("../services/distanceService");

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function getAllDestinations(req, res) {
  try {
    const { regency, category, q } = req.query;
    const filter = {};
    if (regency) filter.regency = new RegExp(regency, "i");
    if (category) filter.category = category;
    if (q) filter.$text = { $search: q };

    const destinations = await Destination.find(filter).sort({ name: 1 });
    res.json(destinations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function getDestinationById(req, res) {
  try {
    const dest = await Destination.findById(req.params.id);
    if (!dest) return res.status(404).json({ message: "Destinasi tidak ditemukan" });
    res.json(dest);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function createDestination(req, res) {
  try {
    const body = req.body;
    body.slug = body.slug ? slugify(body.slug) : slugify(body.name);
    const dest = await Destination.create(body);
    res.status(201).json(dest);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function updateDestination(req, res) {
  try {
    const dest = await Destination.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!dest) return res.status(404).json({ message: "Destinasi tidak ditemukan" });
    res.json(dest);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function deleteDestination(req, res) {
  try {
    const dest = await Destination.findByIdAndDelete(req.params.id);
    if (!dest) return res.status(404).json({ message: "Destinasi tidak ditemukan" });
    res.json({ message: "Destinasi dihapus" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/** Estimasi jarak & waktu tempuh dari lokasi user ke destinasi tertentu */
async function getTravelEstimate(req, res) {
  try {
    const { lat, lng } = req.query;
    if (!lat || !lng) return res.status(400).json({ message: "Query lat & lng wajib diisi" });

    const dest = await Destination.findById(req.params.id);
    if (!dest) return res.status(404).json({ message: "Destinasi tidak ditemukan" });

    const est = estimate({ lat: parseFloat(lat), lng: parseFloat(lng) }, dest.location);
    const vehicle = recommendVehicle(est.roadEstimateKm, dest.accessNotes);

    res.json({
      destination: dest.name,
      ...est,
      recommendedVehicle: vehicle,
      accessNotes: dest.accessNotes,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/** Rekomendasi destinasi di area/kabupaten tertentu, diurutkan dari terdekat jika lat/lng diberikan */
async function recommendByArea(req, res) {
  try {
    const { regency, lat, lng, category } = req.query;
    const filter = {};
    if (regency) filter.regency = new RegExp(regency, "i");
    if (category) filter.category = category;

    let destinations = await Destination.find(filter).lean();

    if (lat && lng) {
      const origin = { lat: parseFloat(lat), lng: parseFloat(lng) };
      destinations = destinations
        .map((d) => ({ ...d, ...estimate(origin, d.location) }))
        .sort((a, b) => a.roadEstimateKm - b.roadEstimateKm);
    }

    res.json(destinations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = {
  getAllDestinations,
  getDestinationById,
  createDestination,
  updateDestination,
  deleteDestination,
  getTravelEstimate,
  recommendByArea,
};
