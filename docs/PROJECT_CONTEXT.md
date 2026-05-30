# Project Context — Web Viewer 3DGS Gedung Teknik Informatika ITS

> Dibuat: 2026-05-12. Diupdate: 2026-05-29.

---

## 1. Tech Stack dan Alasan Pemilihan

| Layer | Teknologi | Alasan |
|-------|-----------|--------|
| Renderer | PlayCanvas Engine (WebGL/WebGPU) | Satu-satunya engine yang support format .sog secara native via `GSplatComponent`. |
| Format model | `.sog` (Spatially Ordered Gaussians) | Format compressed PlayCanvas, ~95% lebih kecil dari .ply. |
| Frontend | HTML + Vanilla JS (ES Modules) | Tidak butuh build tool, deploy langsung ke GitHub Pages. |
| Backend | Node.js + Express | REST API ringan untuk serve metadata scene dari SQLite. |
| Database | SQLite (better-sqlite3) | Sinkronus, zero-config, cukup untuk data scene statis. |
| Storage file | Cloudflare R2 | Free 10 GB, zero egress fee. **Belum dikonfigurasi** — saat ini pakai local static via Express `/local-splats`. |
| Deploy frontend | GitHub Pages (rencana) | Static hosting gratis. |
| Deploy backend | Render.com free tier (rencana) | Belum di-deploy. |

**File .sog lokal:** `G:/TugasAkhir/ScriptConvert/`
- `GedungTCv4Clear.sog` — 256 MB
- `IF112_7MeiClear.sog` — 53 MB
- `PlazaSupenoClear.sog` — 103 MB
- `Aulav1.sog`
- `IF107SmartClassroom.sog`
- `LabKCV.sog`
- `RuangRapat.sog`
- `RuangSidang.sog`
- `Lounge.sog`
- `RuangDosenv1.sog`
- `LabPascasarjana.sog`
- `LobyPascasarjana.sog`
- `IF105.sog`

---

## 2. Struktur Folder

```
G:/TugasAkhir/Projects/3dgs-viewer/
├── frontend/
│   ├── index.html          ✅ canvas, overlay, minimap (#minimap-img-wrapper),
│   │                          loading screen, photo comparison,
│   │                          reconstruction info panel, fps counter
│   ├── style.css           ✅ dark theme, minimap (normal + fullscreen + interior),
│   │                          retry btn, camera hint, photo comparison,
│   │                          reconstruction panel, fps counter
│   ├── scene-manager.js    ✅ PlayCanvas init (WebGPU+WebGL2), dual-mode camera,
│   │                          minimap (eksterior affine + interior statis),
│   │                          transitions, photo comparison,
│   │                          reconstruction info panel, fps counter,
│   │                          cam_yaw/cam_pitch per scene
│   └── assets/
│       ├── minimapinformatika.png   ✅ citra satelit gedung IF ITS (original)
│       ├── minimapinformatika.webp  ✅ citra satelit gedung IF ITS (compressed)
│       ├── DenahLantai1.webp        ✅ denah lantai 1 (compressed WebP, 800px)
│       ├── DenahLantai2.webp        ✅ denah lantai 2 (compressed WebP, 800px)
│       ├── DenahLantai3.webp        ✅ denah lantai 3 (compressed WebP, 800px)
│       └── photos/                  ✅ foto referensi COLMAP per scene
│           ├── exterior/             ✅ 3 foto
│           ├── plaza-supenno/        ✅ 2 foto
│           ├── aula/                 ✅ 2 foto
│           ├── lab-kcv/              ✅ 2 foto
│           ├── kelas-if112/          ✅ 2 foto
│           ├── kelas-if107/          ✅ 2 foto
│           ├── ruang-rapat/          🕐 .gitkeep (foto belum diisi)
│           ├── ruang-sidang/         🕐 .gitkeep (foto belum diisi)
│           ├── lounge/               🕐 .gitkeep (foto belum diisi)
│           ├── ruang-dosen-if227/    🕐 .gitkeep (foto belum diisi)
│           ├── lab-pascasarjana/     🕐 .gitkeep (foto belum diisi)
│           ├── loby-pascasarjana/    🕐 .gitkeep (foto belum diisi)
│           └── kelas-if105/          🕐 .gitkeep (foto belum diisi)
│
├── backend/
│   ├── server.js           ✅ Express + CORS + /health + /local-splats static
│   ├── database.js         ✅ SQLite singleton + schema init (WAL mode)
│   │                          + addColIfNotExists() untuk migrasi idempoten
│   │                          + kolom cam_yaw, cam_pitch, floor_map di tabel scenes
│   ├── .env                ✅ PORT=3001, LOCAL_SPLAT_DIR, FRONTEND_ORIGIN
│   ├── .env.example        ✅ template konfigurasi
│   ├── .gitignore          ✅ node_modules, .env, db/viewer.db
│   ├── package.json        ✅ deps: express, cors, better-sqlite3
│   ├── routes/
│   │   └── scenes.js       ✅ GET /api/scenes + GET /api/scenes/:id
│   │                          + GET /api/scenes/:id/photos
│   │                          + cam_yaw, cam_pitch, floor_map di response
│   └── db/
│       ├── viewer.db       ✅ SQLite database (auto-generated, tidak di-commit)
│       └── seed.js         ✅ --local / --r2 / placeholder mode
│                              + 13 scenes terseed
│                              + cam_yaw, cam_pitch semua scene sudah dikalibrasi
│                              + floor_map per scene (WebP denah lantai)
│
├── media/
│   └── minimapinformatika.png  ✅ original resolusi tinggi
│
├── tools/
│   ├── compress-minimap.js ✅ script konversi minimapinformatika PNG → WebP
│   ├── compress-denah.js   ✅ script konversi DenahLantai1/2/3 PNG → WebP via sharp
│   └── calc_metrics.py     ✅ script hitung PSNR dan SSIM (belum dijalankan)
│
└── docs/
    ├── PROJECT_CONTEXT.md  ✅ file ini
    └── NEXT_STEPS.md       ✅ langkah selanjutnya
```

---

## 3. Status Fitur

### Backend — SELESAI ✅
| File | Status | Catatan |
|------|--------|---------|
| `server.js` | ✅ | .env loader manual, CORS multi-origin, /local-splats static |
| `database.js` | ✅ | WAL mode, FK on, tabel: scenes/hotspots/room_info/photo_refs; `addColIfNotExists()` untuk migrasi idempoten; kolom cam_yaw, cam_pitch, floor_map di tabel scenes |
| `routes/scenes.js` | ✅ | Prepared statements, flat response, endpoint /photos; select kolom rekonstruksi + cam_yaw + cam_pitch + floor_map |
| `db/seed.js` | ✅ | Flag --local, --r2, placeholder; 13 scenes terseed; semua cam_yaw dan cam_pitch terkalibrasi; floor_map per scene (path WebP denah lantai) |
| `.env` | ✅ | PORT=3001, LOCAL_SPLAT_DIR=G:/TugasAkhir/ScriptConvert |

### Frontend — SELESAI ✅
| Fitur | Status | Catatan |
|-------|--------|---------|
| PlayCanvas renderer | ✅ | GSplatComponent, ES module import dari CDN |
| WebGPU support | ✅ | `pc.createGraphicsDevice` dengan `deviceTypes: ['webgpu', 'webgl2']`; fallback otomatis ke WebGL2; confirmed webgpu di Chrome |
| Free camera | ✅ | WASD + mouse look + pointer lock, Q/E naik turun, Shift sprint |
| Orbit camera | ✅ | Drag rotate + scroll zoom |
| Camera mode per scene | ✅ | Berdasarkan `FREE_CAMERA_SCENES` array; 10 scene free, 3 scene orbit (kelas-if112, ruang-dosen-if227, ruang-rapat) |
| Kalibrasi cam_yaw/cam_pitch | ✅ | Kolom di tabel scenes; `initCameraFromPos(pos, yaw, pitch)`; semua 13 scene sudah dikalibrasi |
| Loading screen | ✅ | Progress bar, spinner, % text, retry button |
| Fade transition | ✅ | Fade to black 380ms antar scene |
| Scene list panel | ✅ | Toggle pojok kanan atas, highlight scene aktif |
| Info panel | ✅ | Nama scene + badge room type, pojok kiri bawah |
| Back button | ✅ | Muncul di scene interior, kembali ke eksterior |
| Camera hint UI | ✅ | Muncul 500ms saat idle, hilang saat ada aksi |
| Touch controls | ✅ | 1 jari = look/rotate, 2 jari = zoom/move |
| Minimap | ✅ | Tampil untuk SEMUA scene (termasuk orbit camera); citra satelit untuk eksterior; gambar denah lantai untuk interior; indikator dinamis (affine) eksterior / statis (SCENE_MARKER_POS) interior; collapsible; fullscreen mode (khusus interior) |
| Affine transform | ✅ | 6 titik kalibrasi, least squares solver |
| Retry button | ✅ | Muncul saat load gagal, trigger ulang transitionTo() |
| fetchWithRetry | ✅ | Max 2 retry dengan delay 1.5s per attempt |
| Console helpers | ✅ | getCamera() output cam_yaw/cam_pitch; setHome() output lengkap dengan yaw dan pitch; calibrateMinimap() |
| Photo Comparison | ✅ | Split-screen foto asli vs render 3DGS |
| Panel Informasi Rekonstruksi | ✅ | Tombol "Info" + SVG icon, pojok kanan atas sebelah kiri tombol Scene (top: 20px, right: 120px) |
| FPS Counter | ✅ | Tengah atas, update 500ms, warna hijau/kuning/merah |

### Photo Comparison — Detail ✅
| Sub-fitur | Status | Catatan |
|-----------|--------|---------|
| Toggle button | ✅ | "Foto vs 3DGS" + SVG icon kamera, pojok kiri atas di bawah back button |
| Split-screen panel | ✅ | Foto 40% kiri, canvas 3DGS 60% kanan (default) |
| Drag divider | ✅ | Slider vertikal bisa digeser 20%–80% |
| Navigasi foto | ✅ | Tombol ← → dengan counter "1 / N" |
| Tombol tutup | ✅ | Tombol ✕ pojok kanan atas panel foto |
| Auto-close saat ganti scene | ✅ | closeComparison() dipanggil di awal loadScene() |
| Preload foto | ✅ | Image() preload sebelum tampil, hindari flash kosong |
| Data dari DB | ✅ | Tabel photo_refs, endpoint GET /api/scenes/:id/photos |
| CSS visibility fix | ✅ | Pakai class .is-active bukan hidden attribute |

### Panel Informasi Rekonstruksi — Detail ✅
| Sub-fitur | Status | Catatan |
|-----------|--------|---------|
| Tombol toggle | ✅ | "Info" + SVG icon lingkaran-i, pojok kanan atas sebelah kiri tombol Scene (top: 20px, right: 120px) |
| Panel data | ✅ | Tipe Model, Jumlah Splat, Jumlah Citra, Waktu Training |
| Animasi | ✅ | CSS class `.panel-hidden`: opacity 0 + translateY(8px) |
| Auto-close saat ganti scene | ✅ | closeInfoPanel() dipanggil di awal loadScene() |
| Data dari DB | ✅ | Kolom baru di tabel room_info: splat_count, train_time, image_count, splat_type |

### Minimap Interior — Detail ✅
| Sub-fitur | Status | Catatan |
|-----------|--------|---------|
| Gambar denah per lantai | ✅ | floor_map kolom di DB; diperbarui saat loadScene() |
| Indikator statis per scene | ✅ | SCENE_MARKER_POS — 12 scene interior, posisi persentase (x, y) |
| Wrapper konsisten | ✅ | #minimap-indicator di dalam #minimap-img-wrapper (position: relative); persentase left/top selalu relatif terhadap gambar |
| Label header per lantai | ✅ | "Peta Lokasi" / "Lantai 1" / "Lantai 2" / "Lantai 3" sesuai scene |
| Tombol fullscreen ⛶ | ✅ | Hanya tampil untuk scene interior; minimize (−) disembunyikan saat fullscreen |
| Kelas is-interior | ✅ | width 280px untuk interior, width default untuk eksterior |
| Tampil semua scene | ✅ | Termasuk scene orbit camera (kelas-if112, ruang-rapat, ruang-dosen-if227) |
| Gambar dikompresi | ✅ | DenahLantai1/2/3 PNG → WebP via tools/compress-denah.js (sharp, 800px, quality 80) |

### Posisi Tombol UI
| Elemen | Posisi | CSS |
|--------|--------|-----|
| Scene list toggle | Pojok kanan atas | `top: 20px; right: 20px` |
| Info (Rekonstruksi) toggle | Pojok kanan atas, sebelah kiri Scene | `top: 20px; right: 120px` |
| Info panel | Di bawah tombol Info | `top: 56px; right: 120px` |
| Back button | Pojok kiri atas | `top: 20px; left: 20px` |
| Comparison toggle | Pojok kiri atas, bawah Back | `top: 56px; left: 20px` |
| Info panel scene (kiri bawah) | Pojok kiri bawah | `bottom: 20px; left: 20px` |
| Minimap | Pojok kanan bawah | `bottom: 24px; right: 24px` |

### Struktur Database
| Tabel | Kolom Utama | Catatan |
|-------|-------------|---------|
| `scenes` | id, label, file_url, back_to, cam_pos_*, cam_yaw, cam_pitch, floor_map, display_order | Data scene utama; floor_map = path gambar denah per scene untuk minimap interior |
| `hotspots` | scene_id, label, target_scene_id, screen_x, screen_y | Navigasi hotspot |
| `room_info` | scene_id, floor_number, room_type, capacity, description, splat_count, train_time, image_count, splat_type | Metadata ruangan + data rekonstruksi |
| `photo_refs` | id, scene_id, photo_url, display_order | Foto referensi per scene |

### Data Rekonstruksi di DB
| Scene | splat_count | train_time | image_count | splat_type |
|-------|-------------|------------|-------------|------------|
| exterior | 18.100.000 | 64 jam 50 menit | 2800 | Splat3 |
| plaza-supenno | 8.000.000 | 53 menit 14 detik | 800 | Splat MCMC |
| aula | 8.000.000 | 1 Jam 26 Menit | 1000 | Splat MCMC |
| lab-kcv | 8.000.000 | 34 Menit 18 detik | 500 | Splat3 |
| kelas-if112 | 5.000.000 | 1 jam 16 menit | 700 | Splat MCMC |
| kelas-if107 | 8.000.000 | 1 Jam 47 Menit | 889 | Splat MCMC |
| ruang-rapat | null | null | null | null |
| ruang-sidang | null | null | null | null |
| lounge | null | null | null | null |
| ruang-dosen-if227 | null | null | null | null |
| lab-pascasarjana | null | null | null | null |
| loby-pascasarjana | null | null | null | null |
| kelas-if105 | null | null | null | null |

### Scene Data
| # | Scene ID | Label | File .sog | cam_pos | cam_yaw | cam_pitch | camera | floor_map |
|---|----------|-------|-----------|---------|---------|-----------|--------|-----------|
| 1 | exterior | Gedung Teknik Informatika ITS | GedungTCv4Clear.sog | x=-0.074, y=-1.213, z=-3.167 | 2.9796 | -0.0140 | free | minimapinformatika.webp |
| 2 | plaza-supenno | Plaza Supenno | PlazaSupenoClear.sog | x=1.804, y=-0.220, z=0.303 | 2.1196 | 0.0220 | free | DenahLantai1.webp |
| 3 | aula | Aula | Aulav1.sog | x=-0.857, y=0.474, z=-0.141 | 6.0416 | -0.0940 | free | DenahLantai2.webp |
| 4 | ruang-rapat | Ruang Rapat | RuangRapat.sog | x=-0.044, y=0.120, z=2.820 | 0.1616 | -0.0200 | orbit | DenahLantai2.webp |
| 5 | ruang-sidang | Ruang Sidang | RuangSidang.sog | x=5.140, y=0.067, z=-0.964 | 1.7656 | -0.0240 | free | DenahLantai2.webp |
| 6 | lounge | Lounge | Lounge.sog | x=-4.323, y=0.152, z=0.317 | 4.4216 | -0.0660 | free | DenahLantai2.webp |
| 7 | ruang-dosen-if227 | Ruang Dosen IF-227 | RuangDosenv1.sog | x=-0.702, y=0.534, z=-3.037 | 4.4216 | -0.0660 | orbit | DenahLantai2.webp |
| 8 | lab-kcv | Lab KCV | LabKCV.sog | x=1.193, y=0.292, z=1.254 | 0.7076 | -0.0800 | free | DenahLantai3.webp |
| 9 | lab-pascasarjana | Lab Pascasarjana | LabPascasarjana.sog | x=-0.980, y=-0.278, z=5.010 | 0.3016 | 0.0820 | free | DenahLantai2.webp |
| 10 | loby-pascasarjana | Loby Pascasarjana | LobyPascasarjana.sog | x=2.851, y=0.161, z=4.158 | 1.0676 | -0.0480 | free | DenahLantai2.webp |
| 11 | kelas-if112 | Ruang Kelas IF-112 | IF112_7MeiClear.sog | x=2.403, y=0.240, z=2.042 | 2.9796 | -0.0140 | orbit | DenahLantai1.webp |
| 12 | kelas-if105 | Kelas IF-105 | IF105.sog | x=4.995, y=0.513, z=0.244 | 1.4976 | -0.0640 | free | DenahLantai1.webp |
| 13 | kelas-if107 | Smart Classroom IF-107 | IF107SmartClassroom.sog | x=0.923, y=0.263, z=4.066 | 5.9696 | -0.0380 | free | DenahLantai1.webp |

Total: 13 scenes, 13 photo_refs, 2 hotspots terseed.
R2 URL belum dikonfigurasi — semua pakai local-splats.

---

## 4. Bug yang Sudah Di-fix

| Bug | Gejala | Fix | Lokasi |
|-----|--------|-----|--------|
| Model terbalik | Model render terbalik 180° | `entity.setEulerAngles(180, 180, 0)` | `scene-manager.js:loadScene()` |
| Free camera spawn terbalik | Kamera menghadap arah berlawanan model | `yaw = Math.PI` di `initCameraFromPos()` → kini dikontrol via `cam_yaw` per scene | `scene-manager.js:initCameraFromPos()` |
| WASD terbalik | W mundur, S maju | Balik tanda `mulScalar` untuk semua arah | `scene-manager.js:app.on('update')` |
| Scroll zoom terbalik | Scroll down tambah speed | Tanda minus pada `e.deltaY * 0.001` | `scene-manager.js:wheel handler` |
| Port konflik | Project lain di port 3000 | Project ini pakai port 3001 | `backend/.env` |
| Memory leak | Model lama tidak di-unload | `asset.unload() + revokeObjectURL()` | `scene-manager.js:unloadCurrentScene()` |
| Out of Memory | Browser crash saat load ulang | Throttle minimap 100ms + lazy load img | `scene-manager.js`, `index.html` |
| Photo comparison panel tidak bisa disembunyikan | Panel tetap tampil meski `hidden = true` dipanggil | Ganti `hidden` attribute dengan CSS class `.is-active`; ID selector `#photo-comparison { display: flex }` mengalahkan `[hidden] { display: none }` bawaan browser | `style.css`, `scene-manager.js` |
| CSS specificity conflict fullscreen+interior | `#minimap.is-interior { width: 280px }` override `#minimap.is-fullscreen { width: min(90vw,900px) }` | Tambah `#minimap.is-fullscreen.is-interior { width: min(90vw,900px) }` — specificity 0,3,0 menang | `style.css` |
| Indikator tidak konsisten normal↔fullscreen | Posisi titik geser saat masuk fullscreen | Pindah `#minimap-indicator` ke dalam `#minimap-img-wrapper` (position:relative); persentase selalu relatif terhadap gambar | `index.html`, `style.css` |

---

## 5. Arsitektur Kamera

### Penentuan mode kamera
```javascript
// Berdasarkan scene ID, bukan room_type
const FREE_CAMERA_SCENES = [
  'exterior',
  'plaza-supenno',
  'aula',
  'kelas-if107',
  'kelas-if105',
  'lab-kcv',
  'ruang-sidang',
  'lounge',
  'lab-pascasarjana',
  'loby-pascasarjana',
];
cameraMode = FREE_CAMERA_SCENES.includes(sceneData.id) ? 'free' : 'orbit';
```

| Scene ID | cameraMode | Kontrol |
|----------|------------|---------|
| `exterior` | `free` | WASD gerak, mouse look (pointer lock), Q/E naik/turun, Shift sprint |
| `plaza-supenno` | `free` | sama |
| `aula` | `free` | sama |
| `ruang-sidang` | `free` | sama |
| `lounge` | `free` | sama |
| `lab-kcv` | `free` | sama |
| `lab-pascasarjana` | `free` | sama |
| `loby-pascasarjana` | `free` | sama |
| `kelas-if105` | `free` | sama |
| `kelas-if107` | `free` | sama |
| `kelas-if112` | `orbit` | Drag rotate, scroll zoom, touch pinch |
| `ruang-dosen-if227` | `orbit` | sama |
| `ruang-rapat` | `orbit` | sama |

Minimap tampil untuk **semua** scene — baik free camera maupun orbit camera.

### Inisialisasi free camera — cam_yaw dan cam_pitch per scene
```javascript
// initCameraFromPos() — yaw dan pitch diambil dari DB via API
function initCameraFromPos(camPos, camYaw, camPitch) {
  cameraEntity.setPosition(camPos.x, camPos.y, camPos.z);
  yaw   = camYaw   ?? Math.PI;   // fallback ke 180° jika null
  pitch = camPitch ?? 0;
  cameraEntity.setEulerAngles(
    pitch * pc.math.RAD_TO_DEG,
    yaw   * pc.math.RAD_TO_DEG,
    0,
  );
}

// Dipanggil dari loadScene():
initCameraFromPos(sceneData.cam_pos, sceneData.cam_yaw, sceneData.cam_pitch);
```

### Update loop — arah WASD
```javascript
// W: mulScalar(-speed*dt)   S: mulScalar(speed*dt)
// A: mulScalar(speed*dt)    D: mulScalar(-speed*dt)
```

### Rotasi model
```javascript
entity.setEulerAngles(180, 180, 0);  // wajib untuk semua .sog
```

### Inisialisasi WebGPU
```javascript
const gfxOptions = {
  deviceTypes: navigator.gpu ? ['webgpu', 'webgl2'] : ['webgl2'],
  antialias: true,
};
const device = await pc.createGraphicsDevice(canvas, gfxOptions);
app = new pc.Application(canvas, { graphicsDevice: device });
```

---

## 6. Arsitektur Minimap

### Minimap Eksterior
Menggunakan **affine transform** (bukan bounding-box sederhana) untuk mapping world coords → UV minimap.
Indikator posisi bergerak real-time mengikuti kamera (update setiap 100ms, throttled).

```javascript
// 6 titik kalibrasi (wx, wz) → (mu, mv)
const MINIMAP_POINTS = [
  { wx:  0.788, wz:  5.600, mu: 0.00, mv: 0.00 },  // pojok kiri atas
  { wx: -6.727, wz:  1.128, mu: 1.00, mv: 0.00 },  // pojok kanan atas
  { wx:  6.183, wz: -3.336, mu: 0.00, mv: 1.00 },  // pojok kiri bawah
  { wx: -1.294, wz: -8.315, mu: 1.00, mv: 1.00 },  // pojok kanan bawah
  { wx:  0.009, wz:  1.131, mu: 0.45, mv: 0.45 },  // titik interior 1
  { wx:  0.937, wz: -1.533, mu: 0.70, mv: 0.58 },  // titik interior 2
];

// AFFINE dihitung sekali saat load via least squares (normal equations)
const AFFINE = computeAffineTransform(MINIMAP_POINTS);

// Setiap frame (throttle 100ms):
const mu = AFFINE.a * pos.x + AFFINE.b * pos.z + AFFINE.c;
const mv = AFFINE.d * pos.x + AFFINE.e * pos.z + AFFINE.f;
```

### Minimap Interior
Setiap scene interior menampilkan gambar denah lantai yang sesuai via kolom `floor_map`.
Indikator posisi **statis** — set sekali saat `loadScene()` berdasarkan `SCENE_MARKER_POS`.

```javascript
const SCENE_MARKER_POS = {
  'plaza-supenno':     { x: 0.50, y: 0.78 },
  'kelas-if112':       { x: 0.12, y: 0.42 },
  'kelas-if105':       { x: 0.82, y: 0.72 },
  'kelas-if107':       { x: 0.45, y: 0.92 },
  'aula':              { x: 0.35, y: 0.88 },
  'ruang-sidang':      { x: 0.58, y: 0.88 },
  'lounge':            { x: 0.78, y: 0.88 },
  'ruang-rapat':       { x: 0.82, y: 0.68 },
  'ruang-dosen-if227': { x: 0.10, y: 0.58 },
  'lab-pascasarjana':  { x: 0.82, y: 0.20 },
  'loby-pascasarjana': { x: 0.82, y: 0.30 },
  'lab-kcv':           { x: 0.82, y: 0.45 },
};
```

Mapping scene → gambar denah:
| Gambar | Scene |
|--------|-------|
| `assets/DenahLantai1.webp` | plaza-supenno, kelas-if112, kelas-if105, kelas-if107 |
| `assets/DenahLantai2.webp` | aula, ruang-sidang, lounge, ruang-rapat, ruang-dosen-if227, lab-pascasarjana, loby-pascasarjana |
| `assets/DenahLantai3.webp` | lab-kcv |

Label header minimap per scene:
```javascript
const FLOOR_LABEL = {
  'exterior':          'Peta Lokasi',
  'plaza-supenno':     'Lantai 1',
  'kelas-if112':       'Lantai 1',
  'kelas-if105':       'Lantai 1',
  'kelas-if107':       'Lantai 1',
  'aula':              'Lantai 2',
  'ruang-sidang':      'Lantai 2',
  'lounge':            'Lantai 2',
  'ruang-rapat':       'Lantai 2',
  'ruang-dosen-if227': 'Lantai 2',
  'lab-pascasarjana':  'Lantai 2',
  'loby-pascasarjana': 'Lantai 2',
  'lab-kcv':           'Lantai 3',
};
```

### Struktur HTML Minimap
```html
<div id="minimap-body">
  <div id="minimap-img-wrapper">
    <img id="minimap-img" .../>
    <div id="minimap-indicator"></div>
  </div>
</div>
```

`#minimap-indicator` berada di dalam `#minimap-img-wrapper` (bukan `#minimap-body`) sehingga
persentase `left`/`top` selalu relatif terhadap gambar itu sendiri — konsisten di mode normal
maupun fullscreen.

### Fullscreen Mode
- Tombol ⛶ hanya tampil untuk scene **interior** (tersembunyi di eksterior)
- Tombol − (minimize) disembunyikan saat fullscreen aktif
- Fullscreen: `position: fixed; top/left: 50%; transform: translate(-50%,-50%); width: min(90vw,900px); max-height: 85vh`
- Body fullscreen: `max-height: calc(85vh - 40px); overflow-y: auto; overflow-x: hidden`
- Tutup: klik tombol ✕, klik overlay gelap, atau ganti scene

### Titik Indikator
- Warna oranye `#f6a629`, border putih 2px, border-radius 50%
- Animasi pulse 2s: box-shadow membesar/mengecil
- `transform: translate(-50%, -50%)` — pusat titik tepat di koordinat

---

## 7. API Reference

**Base URL (dev):** `http://localhost:3001`

### GET /health
```json
{ "status": "ok", "timestamp": "2026-05-29T..." }
```

### GET /api/scenes
```json
[
  { "id": "exterior",          "label": "Gedung Teknik Informatika ITS", "file_url": "...", "display_order": 1 },
  { "id": "plaza-supenno",     "label": "Plaza Supenno",                 "file_url": "...", "display_order": 2 },
  { "id": "aula",              "label": "Aula",                          "file_url": "...", "display_order": 3 },
  { "id": "ruang-rapat",       "label": "Ruang Rapat",                   "file_url": "...", "display_order": 4 },
  { "id": "ruang-sidang",      "label": "Ruang Sidang",                  "file_url": "...", "display_order": 5 },
  { "id": "lounge",            "label": "Lounge",                        "file_url": "...", "display_order": 6 },
  { "id": "ruang-dosen-if227", "label": "Ruang Dosen IF-227",            "file_url": "...", "display_order": 7 },
  { "id": "lab-kcv",           "label": "Lab KCV",                       "file_url": "...", "display_order": 8 },
  { "id": "lab-pascasarjana",  "label": "Lab Pascasarjana",              "file_url": "...", "display_order": 9 },
  { "id": "loby-pascasarjana", "label": "Loby Pascasarjana",             "file_url": "...", "display_order": 10 },
  { "id": "kelas-if112",       "label": "Ruang Kelas IF-112",            "file_url": "...", "display_order": 11 },
  { "id": "kelas-if105",       "label": "Kelas IF-105",                  "file_url": "...", "display_order": 12 },
  { "id": "kelas-if107",       "label": "Smart Classroom IF-107",        "file_url": "...", "display_order": 13 }
]
```

### GET /api/scenes/:id
```json
{
  "id": "exterior",
  "label": "Gedung Teknik Informatika ITS",
  "file_url": "http://localhost:3001/local-splats/GedungTCv4Clear.sog",
  "back_to": null,
  "cam_pos": { "x": -0.074, "y": -1.213, "z": -3.167 },
  "cam_rot": { "x": 0, "y": 0, "z": 0 },
  "cam_yaw": 2.9796,
  "cam_pitch": -0.014,
  "floor_map": "assets/minimapinformatika.webp",
  "display_order": 1,
  "hotspots": [],
  "room_info": {
    "floor_number": null,
    "room_type": "eksterior",
    "capacity": null,
    "description": "...",
    "splat_count": "18.100.000",
    "train_time": "64 jam 50 menit",
    "image_count": 2800,
    "splat_type": "Splat3"
  }
}
```

### GET /api/scenes/:id/photos
```json
[
  { "photo_url": "assets/photos/exterior/foto1.jpg" },
  { "photo_url": "assets/photos/exterior/foto2.jpg" },
  { "photo_url": "assets/photos/exterior/foto3.jpg" }
]
```
Diurutkan berdasarkan `display_order`. Kosong `[]` jika scene tidak punya foto.

---

## 8. Perintah Terminal yang Sering Dipakai

```bash
# Jalankan backend
cd G:/TugasAkhir/Projects/3dgs-viewer/backend
node server.js

# Seed database — mode lokal
node db/seed.js --local

# Seed database — mode R2 (setelah setup Cloudflare)
node db/seed.js --r2 https://pub-xxx.r2.dev

# Jalankan frontend
npx serve G:/TugasAkhir/Projects/3dgs-viewer/frontend -p 5500
# atau Live Server di VS Code → http://127.0.0.1:5500

# Compress minimap PNG → WebP
cd G:/TugasAkhir/Projects/3dgs-viewer
npm install sharp          # sekali saja
node tools/compress-minimap.js

# Compress denah lantai PNG → WebP
node tools/compress-denah.js

# Test endpoint
curl http://localhost:3001/health
curl http://localhost:3001/api/scenes
curl http://localhost:3001/api/scenes/exterior
curl http://localhost:3001/api/scenes/exterior/photos
```

### Console helpers (browser DevTools)
```javascript
getCamera()           // tampilkan cam_pos + cam_yaw + cam_pitch saat ini
setHome()             // print posisi + yaw + pitch lengkap untuk disalin ke seed.js
calibrateMinimap()    // tampilkan world coords + hasil mapping minimap
window.__app          // akses langsung ke PlayCanvas Application instance
window.__pc           // akses langsung ke PlayCanvas module
```

**Output `getCamera()`:**
```
cam_pos:  { x: -0.074, y: -1.213, z: -3.167 }
cam_yaw:   2.9796
cam_pitch: -0.0140
```

**Output `setHome()`:**
```
Update seed.js untuk scene 'exterior':
cam_pos_x: -0.074,
cam_pos_y: -1.213,
cam_pos_z: -3.167,
cam_yaw:   2.9796,
cam_pitch: -0.0140,

Jalankan: node db/seed.js --local
```

---

## 9. Catatan Teknis

### FPS dan Performa
- FPS lebih tinggi di scene terbuka (eksterior, plaza) bukan karena splat lebih sedikit,
  tapi karena kamera berada jauh dari model sehingga jumlah splat dalam field of view lebih sedikit.
- Eksterior: 18.1 juta splat. Kelas-if112: 5 juta splat. Sebagian besar scene: 8 juta splat.
- Scene baru (ruang-rapat, ruang-sidang, lounge, dll) belum diketahui jumlah splatnya.

### Splat Budget (maxSplats) — Belum Diimplementasi
- PlayCanvas GSplatComponent mendukung parameter `maxSplats` untuk membatasi jumlah splat yang dirender.
- Trade-off: performa lebih tinggi vs kualitas visual turun.
- **Perlu diskusi dengan dosbing** sebelum diimplementasi — apakah nilai tertentu acceptable untuk TA.

### Unified Rendering — Belum Diaktifkan
- PlayCanvas mendukung mode rendering unified untuk scene kompleks.
- **Perlu diskusi dengan dosbing** sebelum diaktifkan.

---

## 10. Konfigurasi yang Perlu Diganti Sebelum Deploy

| File | Nilai dev | Nilai prod |
|------|-----------|------------|
| `backend/.env` → `PORT` | `3001` | diset otomatis oleh Render.com |
| `backend/.env` → `LOCAL_SPLAT_DIR` | `G:/TugasAkhir/ScriptConvert` | tidak dipakai di prod |
| `backend/.env` → `FRONTEND_ORIGIN` | `http://127.0.0.1:5500` | `https://<username>.github.io` |
| `frontend/scene-manager.js` → `BACKEND_URL` | `http://localhost:3001` | URL Render.com |
| `backend/db/seed.js` → R2 URL | (pakai --r2 flag) | `https://pub-xxx.r2.dev` |
