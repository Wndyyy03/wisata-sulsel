const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Wisata Sulawesi Selatan API",
      version: "1.0.0",
      description:
        "RESTful API untuk data destinasi wisata, penginapan/villa, resto & cafe, spot foto, " +
        "serta asisten AI (Ollama) di Sulawesi Selatan.",
    },
    servers: [
      { url: "http://localhost:5000/api", description: "Local" },
    ],
    components: {
      schemas: {
        Destination: {
          type: "object",
          properties: {
            _id: { type: "string" },
            name: { type: "string", example: "Tanjung Bira" },
            category: { type: "string", example: "Pantai" },
            regency: { type: "string", example: "Bulukumba" },
            description: { type: "string" },
            location: {
              type: "object",
              properties: {
                lat: { type: "number", example: -5.5678 },
                lng: { type: "number", example: 120.4321 },
              },
            },
            images: { type: "array", items: { type: "string" } },
            entryFee: { type: "string", example: "Rp15.000 - Rp25.000 per orang (estimasi)" },
            openHours: { type: "string", example: "06.00 - 18.00" },
            photoSpots: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  popularity: { type: "string", example: "Sangat populer" },
                },
              },
            },
            lodgings: { type: "array", items: { type: "object" } },
            eateries: { type: "array", items: { type: "object" } },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.js"],
};

module.exports = swaggerJsdoc(options);
