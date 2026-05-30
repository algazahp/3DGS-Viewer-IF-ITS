# Next Steps — Web Viewer 3DGS

> Status per 2026-05-29.

---

## SELESAI ✅

### [x] a. Photo Comparison
Split-screen foto asli (COLMAP) vs render 3DGS. Toggle button pojok kiri atas,
drag slider divider, navigasi foto ← →, tombol ✕, auto-close saat ganti scene.
Data foto dari tabel `photo_refs` via `GET /api/scenes/:id/photos`.

### [x] b. Panel Informasi Rekonstruksi per Scene
Tombol "Info" + SVG icon lingkaran-i, pojok kanan atas sebelah kiri tombol Scene.
Panel menampilkan: Tipe Model, Jumlah Splat, Jumlah Citra, Waktu Training.
Data dari kolom baru di tabel `room_info`: splat_count, train_time,
image_count, splat_type. Animasi fade via CSS class `.panel-hidden`.
Auto-close saat ganti scene.

### [x] c. FPS Counter
Posisi tengah atas layar. Update setiap 500ms.
Warna hijau ≥50 FPS, kuning ≥30, merah <30.

### [x] d. WebGPU Support
`pc.createGraphicsDevice` dengan `deviceTypes: ['webgpu', 'webgl2']`.
Fallback otomatis ke WebGL2 jika browser tidak support.
Confirmed: deviceType = 'webgpu' aktif di Chrome.

### [x] e. Tambah Scene Baru
13 scene tersedia di DB, semua sudah dikalibrasi cam_pos, cam_yaw, dan cam_pitch:

| display_order | Scene | Label | Camera Mode |
|---------------|-------|-------|-------------|
| 1 | exterior | Gedung Teknik Informatika ITS | free |
| 2 | plaza-supenno | Plaza Supenno | free |
| 3 | aula | Aula | free |
| 4 | ruang-rapat | Ruang Rapat | orbit |
| 5 | ruang-sidang | Ruang Sidang | free |
| 6 | lounge | Lounge | free |
| 7 | ruang-dosen-if227 | Ruang Dosen IF-227 | orbit |
| 8 | lab-kcv | Lab KCV | free |
| 9 | lab-pascasarjana | Lab Pascasarjana | free |
| 10 | loby-pascasarjana | Loby Pascasarjana | free |
| 11 | kelas-if112 | Ruang Kelas IF-112 | orbit |
| 12 | kelas-if105 | Kelas IF-105 | free |
| 13 | kelas-if107 | Smart Classroom IF-107 | free |

FREE (10): exterior, plaza-supenno, aula, ruang-sidang, lounge, lab-kcv,
lab-pascasarjana, loby-pascasarjana, kelas-if105, kelas-if107.
ORBIT (3): kelas-if112, ruang-dosen-if227, ruang-rapat.

### [x] f. Kalibrasi cam_yaw dan cam_pitch per Scene
Kolom `cam_yaw` dan `cam_pitch` ditambahkan ke tabel `scenes`.
`initCameraFromPos(camPos, camYaw, camPitch)` membaca nilai dari API.
`getCamera()` dan `setHome()` di browser console sudah output yaw dan pitch.
Semua 13 scene sudah dikalibrasi.

### [x] g. Minimap Interior dengan Denah per Lantai
Kolom `floor_map TEXT` ditambahkan ke tabel `scenes` via `addColIfNotExists()`.
Setiap scene menyimpan path gambar denah:
- `assets/DenahLantai1.webp` → plaza-supenno, kelas-if112, kelas-if105, kelas-if107
- `assets/DenahLantai2.webp` → aula, ruang-sidang, lounge, ruang-rapat, ruang-dosen-if227, lab-pascasarjana, loby-pascasarjana
- `assets/DenahLantai3.webp` → lab-kcv
Header minimap menampilkan label lantai per scene (Lantai 1 / Lantai 2 / Lantai 3 / Peta Lokasi).

### [x] h. Indikator Titik Statis per Scene Interior
`SCENE_MARKER_POS` di `scene-manager.js` menyimpan posisi persentase (x, y) untuk 12 scene interior.
Posisi di-set sekali di `loadScene()`, tidak berubah saat kamera bergerak.
Titik oranye berpulse, posisi relatif terhadap `#minimap-img-wrapper` —
konsisten antara mode normal dan fullscreen.

### [x] i. Tombol Fullscreen Minimap
Tombol ⛶ di header minimap — hanya tampil untuk scene interior.
Membuka minimap ke tengah layar (min(90vw, 900px), max-height 85vh) dengan overlay gelap.
Tombol − (minimize) disembunyikan saat fullscreen aktif.
Tutup via tombol ✕, klik overlay, atau ganti scene.

### [x] j. Kompres Denah ke WebP
`tools/compress-denah.js` — konversi DenahLantai1/2/3 PNG → WebP via sharp (800px, quality 80).
Jalankan: `node tools/compress-denah.js`

### [x] k. Fix Posisi UI (Info pindah ke kanan atas)
Tombol Info dipindah ke pojok kanan atas, sebelah kiri tombol Scene
(top: 20px, right: 120px). Panel info menyesuaikan (top: 56px, right: 120px).

### [x] l. Minimap Tampil untuk Semua Scene termasuk Orbit Camera
`minimapEl.style.display = 'block'` tanpa syarat di akhir `loadScene()`.
Sebelumnya minimap hanya tampil untuk scene free camera.
Orbit camera scene (kelas-if112, ruang-rapat, ruang-dosen-if227) kini juga menampilkan denah.

---

## YANG PERLU DILAKUKAN

### SEGERA

**[ ] Kalibrasi posisi titik indikator interior (SCENE_MARKER_POS)**
Nilai saat ini di `scene-manager.js` adalah placeholder — perlu dikalibrasi secara visual.
Cara: buka scene interior → klik tombol ⛶ untuk fullscreen → lihat posisi titik pada denah
→ sesuaikan nilai `x` dan `y` di `SCENE_MARKER_POS` sampai titik tepat di posisi ruangan.

**[ ] Tambah foto referensi untuk scene baru yang masih kosong**
Folder sudah ada, isi dengan 2–3 foto COLMAP per scene, lalu update `seed.js` dan jalankan
`node db/seed.js --local`:
```
frontend/assets/photos/ruang-rapat/
frontend/assets/photos/ruang-sidang/
frontend/assets/photos/lounge/
frontend/assets/photos/ruang-dosen-if227/
frontend/assets/photos/lab-pascasarjana/
frontend/assets/photos/loby-pascasarjana/
frontend/assets/photos/kelas-if105/
```

**[ ] Isi data rekonstruksi di seed.js untuk scene baru**
7 scene masih null di kolom splat_count, train_time, image_count, splat_type:
ruang-rapat, ruang-sidang, lounge, ruang-dosen-if227, lab-pascasarjana,
loby-pascasarjana, kelas-if105.
Setelah training selesai: update `seed.js` → `node db/seed.js --local`.

**[ ] Hitung PSNR/SSIM semua scene**
Script `tools/calc_metrics.py` sudah ada.
Langkah: ambil render screenshot per scene → bandingkan dengan foto referensi COLMAP
→ masukkan hasil ke `seed.js` → tambah kolom `psnr REAL`, `ssim REAL` ke `room_info`
via `addColIfNotExists()` → tampilkan di panel rekonstruksi.

---

### DEPLOYMENT (setelah semua scene + data selesai)

**[ ] Setup Cloudflare R2 — upload semua 13 .sog**
1. Buat bucket R2 (misal: `3dgs-ifits`)
2. Upload semua file .sog dari `G:/TugasAkhir/ScriptConvert/`
3. Enable Public Access → dapat URL `https://pub-xxx.r2.dev`
4. Verifikasi header `Accept-Ranges: bytes` dari browser

**[ ] node db/seed.js --r2 https://[bucket].r2.dev**
Jalankan setelah R2 siap untuk update semua `file_url` di DB ke URL R2.

**[ ] Deploy backend ke Render.com**
1. Push repo ke GitHub (pastikan `.env`, `db/viewer.db`, `.sog` ada di `.gitignore`)
2. Buat Web Service → connect repo → build: `npm install`, start: `node server.js`
3. Set env vars: `NODE_ENV=production`, `FRONTEND_ORIGIN=https://<username>.github.io`
4. Seed DB via Render Shell: `node db/seed.js --r2 <R2_URL>`

**[ ] Deploy frontend ke GitHub Pages + test end-to-end**
1. Update `BACKEND_URL` di `scene-manager.js` ke URL Render.com
2. Push ke GitHub → aktifkan Pages (branch: main, folder: /frontend)
3. Test: semua 13 scene load dari R2, foto comparison, panel info, minimap, back button

---

### OPSIONAL (saran pengembangan Bab 5)

**[ ] Label "Anda di sini" di bawah titik indikator**
Tambah teks kecil di bawah `#minimap-indicator`. Tunggu masukan dosbing apakah diperlukan.

**[ ] Splat budget / unified rendering**
PlayCanvas mendukung `maxSplats` di GSplatComponent dan mode unified rendering.
Trade-off performa vs kualitas — diskusikan dengan dosbing sebelum diimplementasi.

**[ ] Streamed LOD untuk eksterior (256 MB)**
Generate LOD rendah via splat-transform `--decimate`, load dulu ~20 MB lalu swap ke full res.
Butuh perubahan loader ke `GSplatLod` component.

**[ ] Mobile responsiveness**
Touch controls sudah ada, tapi layout UI belum dioptimalkan untuk layar kecil.

---

## CATATAN PENTING SEBELUM DEPLOY

- Pastikan `.env` ada di `.gitignore` — jangan pernah push ke GitHub
- Pastikan file `.sog` tidak di-push ke GitHub (terlalu besar, simpan di R2)
- Update `FRONTEND_ORIGIN` di `backend/.env` dan Render dashboard dengan
  domain GitHub Pages yang sebenarnya sebelum deploy
- Jalankan `node db/seed.js --r2 [URL]` di Render Shell setelah deploy backend
- Test endpoint `/api/scenes/exterior/photos` dari browser setelah deploy
  untuk pastikan CORS dan path foto berjalan dengan benar
