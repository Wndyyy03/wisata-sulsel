const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

async function handle(res) {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || "Terjadi kesalahan");
  }
  return res.json();
}

export async function getDestinations(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${API_URL}/api/destinations${qs ? `?${qs}` : ""}`, { cache: "no-store" });
  return handle(res);
}

export async function getDestinationById(id) {
  const res = await fetch(`${API_URL}/api/destinations/${id}`, { cache: "no-store" });
  return handle(res);
}

export async function getTravelEstimate(id, lat, lng) {
  const res = await fetch(`${API_URL}/api/destinations/${id}/travel-estimate?lat=${lat}&lng=${lng}`, {
    cache: "no-store",
  });
  return handle(res);
}

export async function getRecommendations(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${API_URL}/api/destinations/recommend${qs ? `?${qs}` : ""}`, { cache: "no-store" });
  return handle(res);
}

export async function askAI(payload) {
  const res = await fetch(`${API_URL}/api/ai/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handle(res);
}

export { API_URL };


export async function adminLogin(username, password) {
  const res = await fetch(`${API_URL}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  return handle(res);
}

export async function getAdminSettings(token) {
  const res = await fetch(`${API_URL}/api/admin/settings`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  return handle(res);
}

export async function updateAdminSettings(token, data) {
  const res = await fetch(`${API_URL}/api/admin/settings`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return handle(res);
}