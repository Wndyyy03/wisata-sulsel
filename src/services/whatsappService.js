const fetch = require("node-fetch");
const Settings = require("../models/Settings");

async function sendWhatsAppLog(question, answer) {
  let settings;
  try {
    settings = await Settings.findOne({ key: "whatsapp" });
  } catch (err) {
    console.error("Gagal ambil settings WhatsApp:", err.message);
    return;
  }

  if (!settings || !settings.fonnteToken || !settings.whatsappTarget) {
    console.warn("Nomor WA / token Fonnte belum diset di halaman admin, log WA dilewati.");
    return;
  }

  const message =
    `*Pertanyaan baru di AI Asisten*\n\n` +
    `*Q:* ${question}\n\n` +
    `*A:* ${answer}`;

  try {
    const response = await fetch("https://api.fonnte.com/send", {
      method: "POST",
      headers: {
        Authorization: settings.fonnteToken,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        target: settings.whatsappTarget,
        message: message,
      }),
    });
    const data = await response.json();
    if (!data.status) {
      console.error("Gagal kirim log ke WhatsApp:", data);
    }
  } catch (err) {
    console.error("Error saat kirim log ke WhatsApp:", err.message);
  }
}

module.exports = { sendWhatsAppLog };