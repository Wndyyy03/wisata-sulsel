"use client";

import { useEffect, useState } from "react";
import { getDestinations } from "../lib/api";
import DestinationCard from "../components/DestinationCard";

export default function HomePage() {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (q) params.q = q;
      if (category) params.category = category;
      const data = await getDestinations(params);
      setDestinations(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <section className="hero container">
        <div className="hero-eyebrow">Sulawesi Selatan · Direktori Wisata</div>
        <h1>Karst, laut toska, dan ukiran Toraja — satu peta perjalanan.</h1>
        <p className="lede">
          Jelajahi destinasi wisata di seluruh Sulawesi Selatan lengkap dengan penginapan &amp; villa
          terdekat, resto/cafe pilihan, spot foto favorit, dan estimasi waktu tempuh — dibantu asisten AI.
        </p>
        <div className="hero-actions">
          <a href="/asisten-ai" className="btn btn-primary">Tanya Asisten AI</a>
          <a href="/rekomendasi" className="btn btn-secondary">Rekomendasi per Area</a>
        </div>
      </section>

      <div className="karst-divider" aria-hidden="true" />

      <section className="container">
        <form
          className="filter-bar"
          onSubmit={(e) => {
            e.preventDefault();
            load();
          }}
        >
          <input
            type="text"
            placeholder="Cari destinasi, kabupaten, atau kata kunci…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">Semua kategori</option>
            <option value="Pantai">Pantai</option>
            <option value="Pegunungan">Pegunungan</option>
            <option value="Air Terjun">Air Terjun</option>
            <option value="Budaya/Sejarah">Budaya/Sejarah</option>
            <option value="Pulau">Pulau</option>
            <option value="Taman/Kota">Taman/Kota</option>
            <option value="Danau">Danau</option>
            <option value="Karst/Goa">Karst/Goa</option>
          </select>
          <button type="submit" className="btn btn-teal">Cari</button>
        </form>

        {loading && <p>Memuat destinasi…</p>}
        {error && (
          <p style={{ color: "#A8402F" }}>
            Gagal memuat data ({error}). Pastikan backend & MongoDB berjalan, dan data sudah di-seed.
          </p>
        )}
        {!loading && !error && destinations.length === 0 && (
          <div className="empty-state">
            Belum ada destinasi. Jalankan <code>npm run seed</code> di backend untuk data contoh.
          </div>
        )}

        <div className="grid">
          {destinations.map((d) => (
            <DestinationCard key={d._id} dest={d} />
          ))}
        </div>
      </section>
    </>
  );
}
