"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAdminSettings, updateAdminSettings } from "../../../lib/api";

export default function AdminSettingsPage() {
  const router = useRouter();
  const [token, setToken] = useState(null);
  const [fonnteToken, setFonnteToken] = useState("");
  const [whatsappTarget, setWhatsappTarget] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("admin_token");
    if (!stored) {
      router.push("/admin/login");
      return;
    }
    setToken(stored);
    getAdminSettings(stored)
      .then((data) => {
        setFonnteToken(data.fonnteToken || "");
        setWhatsappTarget(data.whatsappTarget || "");
      })
      .catch((e) => {
        if (e.message.includes("Token")) {
          localStorage.removeItem("admin_token");
          router.push("/admin/login");
        } else {
          setError(e.message);
        }
      })
      .finally(() => setLoading(false));
  }, [router]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      await updateAdminSettings(token, { fonnteToken, whatsappTarget });
      setMessage("Berhasil disimpan.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_username");
    router.push("/admin/login");
  }

  if (loading) return <div className="container empty-state">Memuat…</div>;

  return (
    <div className="container" style={{ maxWidth: 480, marginTop: 60 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Pengaturan WhatsApp</h1>
        <button onClick={handleLogout} style={{ background: "none", border: "none", color: "#A8402F", cursor: "pointer" }}>
          Logout
        </button>
      </div>
      <p style={{ opacity: 0.75, marginTop: 8 }}>
        Isi token Fonnte dan nomor WhatsApp tujuan untuk menerima log percakapan AI Asisten.
      </p>
      <form onSubmit={handleSubmit} style={{ marginTop: 24 }}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", marginBottom: 6 }}>Fonnte API Token</label>
          <input
            type="text"
            value={fonnteToken}
            onChange={(e) => setFonnteToken(e.target.value)}
            placeholder="Token dari dashboard Fonnte"
            style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", marginBottom: 6 }}>Nomor WhatsApp Tujuan</label>
          <input
            type="text"
            value={whatsappTarget}
            onChange={(e) => setWhatsappTarget(e.target.value)}
            placeholder="628xxxxxxxxxx"
            style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
          />
        </div>
        {message && <p style={{ color: "green", marginBottom: 16 }}>{message}</p>}
        {error && <p style={{ color: "#A8402F", marginBottom: 16 }}>{error}</p>}
        <button className="btn btn-primary" type="submit" disabled={saving} style={{ width: "100%" }}>
          {saving ? "Menyimpan..." : "Simpan"}
        </button>
      </form>
    </div>
  );
}