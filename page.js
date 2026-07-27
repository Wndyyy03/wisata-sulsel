"use client";

import { useState, useRef, useEffect } from "react";
import { askAI } from "../../lib/api";

const SUGGESTIONS = [
  "Berapa jam perjalanan ke Tanjung Bira dan kendaraan apa yang cocok?",
  "Rekomendasikan wisata di Maros yang cocok untuk keluarga",
  "Spot foto paling favorit di Kete Kesu apa saja?",
  "Berapa kira-kira harga penginapan dekat Malino?",
];

// Berapa banyak turn terakhir yang dikirim balik ke backend sebagai konteks.
// Samakan dengan yang dipakai backend (buildHistoryBlock ambil 4 turn terakhir).
const MAX_HISTORY_TURNS = 4;

export default function AsistenAIPage() {
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "Halo! Saya asisten wisata Sulawesi Selatan. Tanyakan apa saja: harga penginapan, resto/cafe terdekat, spot foto favorit, estimasi waktu tempuh, jalur & kendaraan yang cocok, atau minta rekomendasi wisata di area tertentu.",
    },
  ]);
  const [input, setInput] = useState("");
  const [destinationName, setDestinationName] = useState("");
  const [regency, setRegency] = useState(""); // input manual (override), tetap dari user
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const logRef = useRef(null);

  // --- "Memori" percakapan, otomatis dari response backend, TIDAK diketik user ---
  // activeRegencyRef: kabupaten yang sedang dibahas (dari activeRegency response terakhir)
  // conversationHistoryRef: {question, answer, regency} dari beberapa turn terakhir
  const activeRegencyRef = useRef(null);
  const conversationHistoryRef = useRef([]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setLocation(null)
      );
    }
  }, []);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function send(question) {
    const text = question || input;
    if (!text.trim()) return;

    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setLoading(true);

    // Kabupaten yang dipakai untuk request ini:
    // 1) kalau user isi manual di kotak "Kabupaten/kota" → itu yang menang (override eksplisit)
    // 2) kalau tidak, pakai kabupaten yang sedang aktif dari percakapan sebelumnya (memori otomatis)
    const effectiveRegency = regency || activeRegencyRef.current || undefined;

    try {
      const result = await askAI({
        question: text,
        userLocation: location,
        destinationName: destinationName || undefined,
        regency: effectiveRegency,
        conversationHistory: conversationHistoryRef.current,
      });

      setMessages((m) => [
        ...m,
        {
          role: "ai",
          text: result.answer,
          sources: result.sourcesUsed?.map((s) => s.name).join(", "),
        },
      ]);

      // Update memori otomatis untuk pertanyaan lanjutan berikutnya.
      activeRegencyRef.current = result.activeRegency || activeRegencyRef.current;
      conversationHistoryRef.current = [
        ...conversationHistoryRef.current,
        {
          question: text,
          answer: result.answer,
          regency: result.activeRegency,
          destination: result.activeDestination || undefined,
        },
      ].slice(-MAX_HISTORY_TURNS);
    } catch (err) {
      setMessages((m) => [
        ...m,
        { role: "ai", text: `Maaf, gagal menghubungi asisten AI: ${err.message}` },
      ]);
    } finally {
      setLoading(false);
    }
  }

  // Reset memori percakapan kalau user secara eksplisit ganti kabupaten/destinasi
  // lewat kotak input manual — supaya benar-benar pindah topik, bukan malah
  // "terkunci" ke kabupaten lama karena riwayat lama masih terbawa.
  function handleManualRegencyChange(value) {
    setRegency(value);
    if (value) {
      activeRegencyRef.current = value;
      conversationHistoryRef.current = [];
    }
  }

  function handleManualDestinationChange(value) {
    setDestinationName(value);
    if (value) {
      conversationHistoryRef.current = [];
    }
  }

  return (
    <section className="container ai-page">
      <div className="hero-eyebrow">Asisten AI</div>
      <h1 style={{ fontSize: "2.2rem" }}>Tanya apa saja soal wisata Sulsel</h1>
      <p className="lede">
        Jawaban dirangkai dari data destinasi di database kami (harga, spot foto, penginapan, resto)
        {location ? " dan lokasimu saat ini" : ""}, lalu diproses lewat AI kampus (Ollama).
      </p>

      <div className="ai-quickfields">
        <input
          placeholder="Nama destinasi spesifik (opsional)"
          value={destinationName}
          onChange={(e) => handleManualDestinationChange(e.target.value)}
        />
        <input
          placeholder="Kabupaten/kota (opsional)"
          value={regency}
          onChange={(e) => handleManualRegencyChange(e.target.value)}
        />
        <span style={{ fontSize: "0.78rem", color: "var(--stone)", alignSelf: "center" }}>
          {location ? "📍 Lokasi terdeteksi" : "📍 Lokasi tidak diizinkan/tersedia"}
        </span>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
        {SUGGESTIONS.map((s) => (
          <button key={s} className="btn btn-secondary" style={{ fontSize: "0.78rem", padding: "8px 14px" }} onClick={() => send(s)}>
            {s}
          </button>
        ))}
      </div>

      <div className="chat-shell">
        <div className="chat-log" ref={logRef}>
          {messages.map((m, i) => (
            <div className={`msg ${m.role}`} key={i}>
              {m.text}
              {m.sources && <div className="src">Sumber data: {m.sources}</div>}
            </div>
          ))}
          {loading && <div className="msg ai">Sedang berpikir…</div>}
        </div>
        <form
          className="chat-form"
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
        >
          <input
            placeholder="Tulis pertanyaan…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit" className="btn btn-primary" disabled={loading}>Kirim</button>
        </form>
      </div>
    </section>
  );
}
