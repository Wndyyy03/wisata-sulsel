"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getDestinationById, getTravelEstimate } from "../../../lib/api";

export default function DestinationDetailPage() {
  const { id } = useParams();
  const [dest, setDest] = useState(null);
  const [error, setError] = useState(null);
  const [travel, setTravel] = useState(null);
  const [travelError, setTravelError] = useState(null);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    getDestinationById(id).then(setDest).catch((e) => setError(e.message));
  }, [id]);

  function handleGetTravelEstimate() {
    if (!navigator.geolocation) {
      setTravelError("Browser tidak mendukung geolokasi.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const result = await getTravelEstimate(id, pos.coords.latitude, pos.coords.longitude);
          setTravel(result);
          setTravelError(null);
        } catch (e) {
          setTravelError(e.message);
        } finally {
          setLocating(false);
        }
      },
      () => {
        setTravelError("Izin lokasi ditolak. Aktifkan lokasi untuk menghitung estimasi waktu tempuh.");
        setLocating(false);
      }
    );
  }

  if (error) return <div className="container empty-state">Gagal memuat: {error}</div>;
  if (!dest) return <div className="container empty-state">Memuat destinasi…</div>;

  return (
    <>
      <section className="detail-hero">
        <div className="container">
          <div className="card-eyebrow">{dest.regency} · {dest.category}</div>
          <h1>{dest.name}</h1>
          <p style={{ maxWidth: "60ch", opacity: 0.85 }}>{dest.description}</p>
        </div>
      </section>

      <div className="container">
        <section className="section">
          <h2>Info Praktis</h2>
          <ul className="info-list">
            <li><span className="label">Tiket masuk</span><span className="value">{dest.entryFee}</span></li>
            <li><span className="label">Jam buka</span><span className="value">{dest.openHours}</span></li>
            <li><span className="label">Kendaraan disarankan</span><span className="value">{dest.bestVehicle?.join(", ")}</span></li>
            <li><span className="label">Catatan akses jalan</span><span className="value">{dest.accessNotes}</span></li>
          </ul>
          {dest.instagramUrl && (
            
            <a
              href={dest.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
              style={{ marginTop: 16, display: "inline-block" }}
            >
              Lihat di Instagram
            </a>
          )}
        </section>

        <section className="section">
          <h2>Estimasi Waktu Tempuh</h2>
          <div className="travel-box">
            <p style={{ marginTop: 0, fontSize: "0.9rem", color: "#4b4d57" }}>
              Hitung estimasi jarak & waktu tempuh dari lokasi kamu sekarang ke {dest.name}.
            </p>
            <button className="btn btn-primary" onClick={handleGetTravelEstimate} disabled={locating}>
              {locating ? "Mengambil lokasi…" : "Gunakan lokasi saya"}
            </button>
            {travelError && <p style={{ color: "#A8402F", marginTop: 10 }}>{travelError}</p>}
            {travel && (
              <div style={{ marginTop: 16 }}>
                <p style={{ fontSize: "0.85rem", color: "var(--stone)" }}>
                  Jarak tempuh estimasi: ~{travel.roadEstimateKm} km
                </p>
                {travel.perVehicle.map((v) => (
                  <div className="vehicle-row" key={v.vehicle}>
                    <span>{v.vehicle}</span>
                    <strong>{v.estimatedDurationText}</strong>
                  </div>
                ))}
                <p style={{ marginTop: 12, fontSize: "0.88rem" }}>
                  <strong>Rekomendasi kendaraan:</strong> {travel.recommendedVehicle}
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="section">
          <h2>Spot Foto Favorit</h2>
          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px,1fr))" }}>
            {(dest.photoSpots || []).map((p, i) => (
              <div className="card" key={i}>
                <div className="card-body">
                  <span className="spot-badge">{p.popularity}</span>
                  <h3 style={{ fontSize: "1rem", marginTop: 8 }}>{p.name}</h3>
                  <p>{p.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="section">
          <h2>Penginapan &amp; Villa Terdekat</h2>
          <ul className="info-list">
            {(dest.lodgings || []).map((l, i) => (
              <li key={i}>
                <span className="label">{l.name} · {l.type} {l.distanceFromSpotKm ? `(±${l.distanceFromSpotKm} km)` : ""}</span>
                <span className="value">{l.priceRange}</span>
              </li>
            ))}
            {(!dest.lodgings || dest.lodgings.length === 0) && <li>Belum ada data penginapan.</li>}
          </ul>
        </section>

        <section className="section" style={{ borderBottom: "none" }}>
          <h2>Resto &amp; Cafe Terdekat</h2>
          <ul className="info-list">
            {(dest.eateries || []).map((e, i) => (
              <li key={i}>
                <span className="label">{e.name} · {e.type} {e.distanceFromSpotKm ? `(±${e.distanceFromSpotKm} km)` : ""}</span>
                <span className="value">{e.priceRange}</span>
              </li>
            ))}
            {(!dest.eateries || dest.eateries.length === 0) && <li>Belum ada data resto/cafe.</li>}
          </ul>
        </section>
      </div>
    </>
  );
}
