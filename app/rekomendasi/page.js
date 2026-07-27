"use client";

import { useState } from "react";
import { getRecommendations } from "../../lib/api";
import DestinationCard from "../../components/DestinationCard";

const KABUPATEN = [
  "Kota Makassar", "Bulukumba", "Toraja Utara", "Tana Toraja", "Maros", "Gowa",
  "Pangkajene dan Kepulauan", "Bantaeng", "Jeneponto", "Wajo", "Soppeng", "Bone",
];

export default function RekomendasiPage() {
  const [regency, setRegency] = useState("");
  const [category, setCategory] = useState("");
  const [useLocation, setUseLocation] = useState(false);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSearch(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (regency) params.regency = regency;
      if (category) params.category = category;

      if (useLocation && navigator.geolocation) {
        await new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              params.lat = pos.coords.latitude;
              params.lng = pos.coords.longitude;
              resolve();
            },
            () => resolve()
          );
        });
      }

      const data = await getRecommendations(params);
      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="container" style={{ paddingTop: 48, paddingBottom: 80 }}>
      <div className="hero-eyebrow">Rekomendasi</div>
      <h1 style={{ fontSize: "2.2rem" }}>Mau wisata di area mana?</h1>
      <p className="lede">Pilih kabupaten/kota atau kategori, dan urutkan berdasarkan jarak dari lokasimu.</p>

      <form className="filter-bar" onSubmit={handleSearch} style={{ marginTop: 28 }}>
        <select value={regency} onChange={(e) => setRegency(e.target.value)}>
          <option value="">Semua Kabupaten/Kota</option>
          {KABUPATEN.map((k) => (
            <option key={k} value={k}>{k}</option>
          ))}
        </select>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Semua kategori</option>
          <option value="Pantai">Pantai</option>
          <option value="Pegunungan">Pegunungan</option>
          <option value="Air Terjun">Air Terjun</option>
          <option value="Budaya/Sejarah">Budaya/Sejarah</option>
          <option value="Pulau">Pulau</option>
          <option value="Karst/Goa">Karst/Goa</option>
        </select>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.88rem" }}>
          <input type="checkbox" checked={useLocation} onChange={(e) => setUseLocation(e.target.checked)} />
          Urutkan dari terdekat (pakai lokasi saya)
        </label>
        <button type="submit" className="btn btn-teal">Cari Rekomendasi</button>
      </form>

      {loading && <p style={{ marginTop: 24 }}>Mencari rekomendasi…</p>}
      {error && <p style={{ color: "#A8402F", marginTop: 24 }}>{error}</p>}
      {!loading && results.length === 0 && !error && (
        <div className="empty-state">Belum ada hasil. Coba pilih kabupaten atau kategori dulu.</div>
      )}

      <div className="grid" style={{ marginTop: 28 }}>
        {results.map((d) => (
          <div key={d._id}>
            <DestinationCard dest={d} />
            {d.roadEstimateKm && (
              <p style={{ fontSize: "0.8rem", color: "var(--stone)", marginTop: 6 }}>
                ~{d.roadEstimateKm} km dari lokasimu
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
