const mongoose = require("mongoose");

const PhotoSpotSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    // "Sangat populer" | "Populer" | "Cukup populer"
    popularity: { type: String, default: "Populer" },
    image: { type: String },
  },
  { _id: false }
);

const LodgingSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: { type: String, enum: ["Hotel", "Villa", "Homestay", "Resort", "Penginapan"], default: "Penginapan" },
    priceRange: { type: String, example: "Rp250.000 - Rp500.000 / malam" },
    distanceFromSpotKm: { type: Number },
    contact: { type: String },
    notes: { type: String },
  },
  { _id: false }
);

const EaterySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: { type: String, enum: ["Resto", "Cafe", "Warung"], default: "Resto" },
    priceRange: { type: String, example: "Rp20.000 - Rp75.000 / porsi" },
    distanceFromSpotKm: { type: Number },
    specialty: { type: String },
  },
  { _id: false }
);

const DestinationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },
    category: {
      type: String,
      enum: ["Pantai", "Pegunungan", "Air Terjun", "Budaya/Sejarah", "Pulau", "Taman/Kota", "Danau", "Karst/Goa"],
      required: true,
    },
    regency: { type: String, required: true }, // Kabupaten/Kota, misal "Bulukumba"
    description: { type: String, required: true },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    images: [{ type: String }], // object name / URL dari MinIO
    instagramUrl: { type: String, default: "" }, // link akun/postingan IG destinasi
    entryFee: { type: String, default: "Belum ada data, mohon verifikasi ke pengelola" },
    openHours: { type: String, default: "06.00 - 18.00" },
    bestVehicle: {
      type: [String],
      default: ["Motor", "Mobil"],
    },
    accessNotes: {
      type: String,
      default: "Jalan aspal, dapat diakses kendaraan roda dua maupun roda empat.",
    },
    photoSpots: [PhotoSpotSchema],
    lodgings: [LodgingSchema],
    eateries: [EaterySchema],
    tags: [{ type: String }],
  },
  { timestamps: true }
);

DestinationSchema.index({ name: "text", regency: "text", description: "text", tags: "text" });

module.exports = mongoose.model("Destination", DestinationSchema);
