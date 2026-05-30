# Web Viewer 3D Gaussian Splatting — Gedung Teknik Informatika ITS

Tugas Akhir S1 Teknik Informatika ITS
Menampilkan model 3DGS gedung dan ruangan kelas secara interaktif di browser.

## Stack
- **Frontend**: HTML + Vanilla JS + PlayCanvas Engine (WebGL/WebGPU)
- **Backend**: Node.js + Express + SQLite (better-sqlite3)
- **Storage**: Cloudflare R2 (file .sog)
- **Deploy**: GitHub Pages (frontend) + Render.com (backend)

## Struktur Folder
```
3dgs-viewer/
├── frontend/
│   ├── index.html        # Entry point, canvas + UI overlay
│   ├── style.css         # Fullscreen canvas, hotspot, loading screen
│   ├── scene-manager.js  # PlayCanvas init, scene loading, transisi
│   └── lib/
│       └── playcanvas.mjs  # PlayCanvas Engine (download dari CDN)
├── backend/
│   ├── server.js         # Express app + CORS + health check
│   ├── database.js       # SQLite singleton + schema init
│   ├── routes/
│   │   └── scenes.js     # GET /api/scenes, GET /api/scenes/:id
│   ├── db/
│   │   ├── viewer.db     # SQLite database (auto-generated)
│   │   └── seed.js       # Populate data awal
│   └── package.json
└── docs/                 # Dokumentasi untuk laporan TA
```

## Setup

### Backend
```bash
cd backend
npm install
node db/seed.js   # isi data awal
npm start         # jalankan server di port 3000
```

### Frontend
Buka `frontend/index.html` di browser, atau serve via HTTP server lokal.

## Scenes yang Tersedia
| ID | Label | File |
|----|-------|------|
| exterior | Gedung Teknik Informatika ITS | GedungTCv4Clear.sog |
| kelas-if112 | Ruang Kelas IF-112 | IF112_7MeiClear.sog |
| plaza-supenno | Plaza Supenno | PlazaSupenoClear.sog |

## Catatan
- URL file .sog di Cloudflare R2 perlu dikonfigurasi di `backend/db/seed.js`
- Posisi hotspot (screen_x, screen_y) dikalibrasi manual di viewer setelah model ter-render
