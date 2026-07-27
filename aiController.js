const { askAI } = require("../services/aiService");

async function chat(req, res) {
  try {
    const { question, userLocation, destinationName, regency, conversationHistory } = req.body;
    if (!question) return res.status(400).json({ message: "Field 'question' wajib diisi" });

    const result = await askAI({
      question,
      userLocation,
      destinationName,
      regency,
      conversationHistory,
    });
    res.json(result);
  } catch (err) {
    res.status(502).json({
      message: "Gagal menghubungi layanan AI (Ollama). Pastikan endpoint dapat diakses dari server.",
      error: err.message,
    });
  }
}

module.exports = { chat };
