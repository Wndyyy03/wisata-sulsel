# Wisata Sulsel — Aplikasi Pariwisata Sulawesi Selatan

Aplikasi full-stack untuk eksplorasi destinasi wisata di Sulawesi Selatan, lengkap dengan
asisten AI (via Ollama kampus) yang bisa menjawab soal harga penginapan/villa, resto & cafe
terdekat, spot foto favorit, estimasi waktu tempuh, jalur & kendaraan yang cocok, sampai
rekomendasi wisata per area.

## Stack (sesuai daftar tugas)

| Kebutuhan          | Implementasi                                      |
|---------------------|----------------------------------------------------|
| Database            | MongoDB                                            |
| RESTful API          | Express JS + Swagger (`/api-docs`)                 |
| Web FE               | Next.js (App Router)                                |
| Gambar               | MinIO (object storage, S3-compatible)               |
| AI                   | `https://ollama.if.unismuh.ac.id/api/generate` (RAG dari data destinasi di MongoDB) |
| Container            | Docker + docker-compose                             |
| Deploy               | Harus online (lihat catatan deploy di bawah)        |
| Dev env              | GitHub Codespaces (`.devcontainer/devcontainer.json`)|

## Struktur folder

```
wisata-sulsel/
├── docker-compose.yml
├── .devcontainer/devcontainer.json
├── backend/            # Express API
│   └── src/
│       ├── config/     # koneksi db, minio, swagger
│       ├── models/     # schema mongoose
│       ├── controllers/
│       ├── routes/
│       ├── services/   # aiService (Ollama), distanceService (haversine)
│       ├── middleware/ # upload (multer -> minio)
│       └── seed/       # data awal destinasi Sulsel
└── frontend/           # Next.js
    ├── app/
    ├── components/
    └── lib/
```

## Cara Menjalankan (lokal / Codespace)

1. Copy env:
   ```bash
   cp backend/.env.example backend/.env
   ```
2. Jalankan semua service:
   ```bash
   docker compose up --build
   ```
3. Akses:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Swagger docs: http://localhost:5000/api-docs
   - MinIO console: http://localhost:9001 (user/pass di `.env`)
4. Seed data destinasi contoh:
   ```bash
   docker compose exec backend node src/seed/seedData.js
   ```

## Cara Kerja AI

Backend TIDAK mengirim pertanyaan mentah ke Ollama. Alurnya (RAG sederhana):

1. User bertanya lewat frontend (`/asisten-ai`), sertakan lokasi user (lat/lng) & opsional nama destinasi.
2. Backend (`aiController` + `aiService`) mengambil data relevan dari MongoDB: destinasi, penginapan/villa
   terdekat, resto/cafe terdekat, spot foto favorit — plus menghitung estimasi jarak & waktu tempuh
   (`distanceService`, formula haversine + asumsi kecepatan per moda transportasi).
3. Semua data itu dirangkai jadi **konteks** dalam prompt, lalu dikirim ke
   `https://ollama.if.unismuh.ac.id/api/generate` supaya jawaban AI akurat berdasar data kita sendiri,
   bukan halusinasi model.
4. AI mengembalikan jawaban natural language: rekomendasi, estimasi harga, spot foto, rute, kendaraan.

> Catatan: endpoint Ollama ini ada di jaringan kampus UNISMUH, jadi hanya bisa diakses saat online
> di jaringan kampus/VPN kampus atau saat endpoint tersebut expose ke publik. Set base URL di
> `backend/.env` (`OLLAMA_BASE_URL`).

## Catatan "Harus Online"

- Untuk deploy publik: backend bisa naik ke VPS/Railway/Render, MongoDB pakai Atlas, MinIO pakai
  server sendiri atau ganti ke layanan S3-compatible yang online, frontend ke Vercel.
- Untuk kebutuhan tugas kuliah yang "harus online" tapi sederhana: cukup jalankan
  `docker compose up -d` di VPS kampus/pribadi, lalu buka port 3000 & 5000 (atau taruh di belakang Nginx + domain).
- Semua konfigurasi URL (Mongo, MinIO, Ollama, frontend->backend) diambil dari environment variable,
  jadi tinggal ganti `.env` saat pindah dari lokal ke server online.
