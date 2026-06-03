# Web Viewer 3D Gaussian Splatting — Gedung Teknik Informatika ITS

Aplikasi web untuk visualisasi rekonstruksi 3D berbasis 3D Gaussian Splatting dari 13 lokasi di Gedung Teknik Informatika Institut Teknologi Sepuluh Nopember. Viewer berjalan langsung di browser tanpa plugin menggunakan PlayCanvas Engine sebagai renderer WebGL/WebGPU.

---

## Tautan Langsung

| | URL |
|---|---|
| Web Viewer | https://ifsplat.my.id |
| Repository | https://github.com/algazahp/3DGS-Viewer-IF-ITS |
| Backend API | https://3dgs-viewer-if-its-production.up.railway.app |

---

## Tentang Proyek

Penelitian ini merekonstruksi Gedung Teknik Informatika ITS secara tiga dimensi menggunakan metode 3D Gaussian Splatting, sebuah teknik representasi radiance field berbasis point cloud terstruktur yang memungkinkan rendering real-time dengan kualitas visual tinggi. Data akuisisi dilakukan menggunakan drone untuk area eksterior dan iPhone 15 Pro Max dengan aplikasi Blackmagic Camera untuk seluruh ruangan interior, kemudian diproses menggunakan Postshot sebagai software training. Model yang dihasilkan disimpan dalam format `.sog` (Spatially Ordered Gaussians), format terkompresi milik PlayCanvas yang rata-rata 95% lebih kecil dibanding format `.ply` standar.

Proyek ini dikerjakan sebagai Tugas Akhir S1 Teknik Informatika ITS dan mencakup 13 scene dari berbagai area gedung, mulai dari eksterior hingga ruang kelas, laboratorium, dan ruang penunjang.

---

## Stack Teknologi

| Komponen | Teknologi | Keterangan |
|----------|-----------|------------|
| Frontend | HTML + Vanilla JS (ES Modules) | Tidak memerlukan build tool, deploy langsung ke GitHub Pages |
| Renderer | PlayCanvas Engine 2.18.1 | Satu-satunya engine yang mendukung format `.sog` secara native via `GSplatComponent` |
| Backend | Node.js + Express.js | REST API untuk menyajikan metadata scene dari SQLite |
| Database | SQLite (better-sqlite3) | Sinkronus, zero-config, sesuai untuk data scene statis |
| Storage | Cloudflare R2 | 13 file `.sog`, zero egress fee, kapasitas 10 GB gratis |
| CDN | Cloudflare (`assets.ifsplat.my.id`) | Edge cache Singapore, TTL 1 tahun, cache HIT terkonfirmasi |
| Deploy Frontend | GitHub Pages | Custom domain `ifsplat.my.id` via GitHub Actions |
| Deploy Backend | Railway | Auto-deploy saat push ke `main`, auto-seed DB saat cold start |

---

## Daftar Scene

| No | Scene | Lantai | Kamera | Jumlah Splat |
|----|-------|--------|--------|--------------|
| 1 | Gedung Teknik Informatika ITS | Eksterior | Free | 18.100.000 |
| 2 | Plasa Prof. Supeno | Lantai 1 | Free | 8.000.000 |
| 3 | Aula | Lantai 2 | Free | 8.000.000 |
| 4 | Ruang Rapat | Lantai 2 | Orbit | 5.000.000 |
| 5 | Ruang Sidang | Lantai 2 | Free | 8.000.000 |
| 6 | Lounge | Lantai 2 | Free | 8.000.000 |
| 7 | Ruang Dosen IF-227 | Lantai 2 | Orbit | 8.000.000 |
| 8 | Lab KCV | Lantai 3 | Free | 8.000.000 |
| 9 | Lab Pascasarjana | Lantai 1 | Free | 8.000.000 |
| 10 | Loby Pascasarjana | Lantai 2 | Free | 5.000.000 |
| 11 | Ruang Kelas IF-112 | Lantai 1 | Orbit | 5.000.000 |
| 12 | Kelas IF-105 | Lantai 1 | Free | 8.000.000 |
| 13 | Smart Classroom IF-107 | Lantai 1 | Free | 8.000.000 |

Mode **Free**: kontrol WASD + mouse look (pointer lock), Q/E naik turun, Shift sprint. Mode **Orbit**: drag untuk rotasi, scroll untuk zoom.

---

## Arsitektur Sistem

```
Browser
  ├── GET /api/scenes*    →  Railway (Express + SQLite)
  │
  └── Download .sog       →  Cloudflare CDN  →  R2 Bucket
                              assets.ifsplat.my.id
```

Backend menyajikan metadata scene (label, posisi kamera, data rekonstruksi) melalui REST API. File model `.sog` disimpan di Cloudflare R2 dan diakses langsung oleh browser melalui CDN, sehingga tidak membebani server backend.

---

## Struktur Folder

```
3dgs-viewer/
├── index.html              # copy dari frontend/ — diperlukan GitHub Pages
├── style.css               # copy dari frontend/
├── scene-manager.js        # copy dari frontend/
├── assets/                 # copy dari frontend/assets/
├── lib/                    # copy dari frontend/lib/
│
├── frontend/               # source utama
│   ├── index.html
│   ├── style.css
│   ├── scene-manager.js
│   ├── CNAME               # ifsplat.my.id
│   └── assets/
│       ├── minimapinformatika.webp
│       ├── DenahLantai1.webp
│       ├── DenahLantai2.webp
│       ├── DenahLantai3.webp
│       └── photos/         # foto referensi COLMAP per scene
│
├── backend/
│   ├── server.js
│   ├── database.js
│   ├── package.json
│   ├── .env.example
│   ├── routes/
│   │   └── scenes.js
│   └── db/
│       ├── seed.js             # seed lokal atau R2
│       ├── seed-production.js  # seed CDN URL hardcoded
│       └── init.js             # auto-seed jika DB kosong
│
├── .github/
│   └── workflows/
│       └── deploy.yml      # GitHub Actions: frontend → gh-pages
│
├── tools/
│   ├── compress-denah.js
│   ├── compress-minimap.js
│   └── calc_metrics.py     # hitung PSNR dan SSIM
│
└── docs/
    ├── PROJECT_CONTEXT.md
    └── NEXT_STEPS.md
```

---

## Cara Menjalankan Lokal

### 1. Clone repository

```bash
git clone https://github.com/algazahp/3DGS-Viewer-IF-ITS.git
cd 3DGS-Viewer-IF-ITS
```

### 2. Install dependencies backend

```bash
cd backend
npm install
```

### 3. Setup file .env

Buat file `backend/.env` berdasarkan `.env.example`:

```env
PORT=3001
LOCAL_SPLAT_DIR=path/ke/folder/file-sog
FRONTEND_ORIGIN=http://localhost:5500
```

`LOCAL_SPLAT_DIR` harus menunjuk ke folder yang berisi file-file `.sog`. Jika tidak di-set, endpoint `/local-splats` tidak akan aktif.

### 4. Seed database lokal

```bash
node db/seed.js --local
```

### 5. Jalankan backend

```bash
node server.js
```

Server berjalan di `http://localhost:3001`.

### 6. Jalankan frontend

Buka folder `frontend/` menggunakan Live Server (VS Code) atau:

```bash
npx serve frontend -p 5500
```

Akses `http://localhost:5500` di browser.

> **Catatan:** File `.sog` tidak disertakan di repository karena ukurannya yang besar (53–256 MB per file). Untuk pengujian dengan data production, jalankan `node db/seed.js --r2 https://assets.ifsplat.my.id` sebagai pengganti langkah 4.

---

## API Endpoints

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/health` | Status server |
| GET | `/api/scenes` | Daftar semua scene |
| GET | `/api/scenes/:id` | Detail scene beserta hotspot dan data rekonstruksi |
| GET | `/api/scenes/:id/photos` | Daftar foto referensi untuk scene tertentu |

Contoh response `GET /api/scenes/exterior`:

```json
{
  "id": "exterior",
  "label": "Gedung Teknik Informatika ITS",
  "file_url": "https://assets.ifsplat.my.id/GedungTCv4Clear.sog",
  "back_to": null,
  "cam_pos": { "x": -0.074, "y": -1.213, "z": -3.167 },
  "cam_yaw": 2.9796,
  "cam_pitch": -0.014,
  "floor_map": "assets/minimapinformatika.webp",
  "hotspots": [],
  "room_info": {
    "room_type": "eksterior",
    "splat_count": "18.100.000",
    "train_time": "64 jam 50 menit",
    "image_count": 2800,
    "splat_type": "Splat3",
    "psnr": 10.9,
    "ssim": 0.3134
  }
}
```

---

## Deployment

**Frontend** di-deploy secara otomatis melalui GitHub Actions. Setiap push ke branch `main` memicu workflow `.github/workflows/deploy.yml` yang menyalin isi folder `frontend/` ke branch `gh-pages`. GitHub Pages kemudian menyajikan konten tersebut di domain `ifsplat.my.id`.

**Backend** berjalan di Railway dengan auto-deploy dari branch `main`. Database SQLite di-seed ulang secara otomatis saat cold start jika kosong, menggunakan URL CDN `https://assets.ifsplat.my.id` yang sudah di-hardcode di `seed-production.js`.

**Storage** dikelola secara manual. File `.sog` diunggah ke bucket Cloudflare R2 `3dgs-splats` dan diakses via CDN `assets.ifsplat.my.id` dengan cache edge TTL 1 tahun.

---

## Perangkat Akuisisi Data

| Perangkat | Digunakan untuk |
|-----------|-----------------|
| Drone | Rekonstruksi eksterior gedung |
| iPhone 15 Pro Max (Blackmagic Camera) | Rekonstruksi seluruh ruangan interior |

---

## Informasi Akademis

| | |
|---|---|
| Nama | Al Dhihya Gaza Halim Putra |
| NRP | 5025221288 |
| Program Studi | S1 Teknik Informatika |
| Institusi | Institut Teknologi Sepuluh Nopember |
| Tahun Angkatan | 2022 |
