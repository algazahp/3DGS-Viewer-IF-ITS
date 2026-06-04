# Next Steps — Web Viewer 3DGS

> Status per 2026-06-05. Diupdate: 2026-06-05.

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
PlayCanvas 2.19.0, `unified: true`, confirmed stabil.

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
- `assets/DenahLantai1.webp` → plaza-supenno, kelas-if112, kelas-if105, kelas-if107, lab-pascasarjana
- `assets/DenahLantai2.webp` → aula, ruang-sidang, lounge, ruang-rapat, ruang-dosen-if227, loby-pascasarjana
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

### [x] m. Mutual Close — Info Panel ↔ Scene List
Buka panel Info otomatis tutup Scene List, dan sebaliknya.
`sceneListToggle`: panggil `closeInfoPanel()` sebelum toggle.
`infoToggle`: set `sceneListEl.hidden = true` sebelum toggle.

### [x] n. Photo Refs untuk Semua 13 Scene
27 entri di tabel `photo_refs` — semua scene punya minimal 2 foto referensi.
exterior: 3 foto. Semua 12 scene interior: masing-masing 2 foto.

### [x] o. Isi Data Rekonstruksi Semua 13 Scene
Semua kolom `splat_count`, `train_time`, `image_count`, `splat_type` sudah terisi
di `seed.js` dan `seed-production.js` untuk semua 13 scene.

### [x] p. Setup Cloudflare R2 — Upload 13 File .sog
Bucket R2 aktif. Semua 13 file .sog sudah diupload.
CDN URL: `https://assets.ifsplat.my.id`
Public URL: `https://pub-ac5b32f0edac4a9fb2eaa996837e98be.r2.dev`
DB di-seed dengan CDN URL via `seed-production.js`.

### [x] q. Push ke GitHub Repository
Repo: `https://github.com/algazahp/3DGS-Viewer-IF-ITS`
Initial commit: 69 files. Commit kedua: workflow + frontend root copy (50 files).
`.gitignore` exclude: `.env`, `node_modules`, `viewer.db`, `*.sog`, `.claude/`.

### [x] r. Setup GitHub Pages — Frontend LIVE
GitHub Actions workflow `.github/workflows/deploy.yml` otomatis copy `frontend/` ke branch `gh-pages`.
Frontend live di: `https://algazahp.github.io/3DGS-Viewer-IF-ITS/`
File frontend juga ada di root project untuk GitHub Pages.

### [x] s. Deploy Backend ke Railway ✅
Backend LIVE di: `https://3dgs-viewer-if-its-production.up.railway.app`
Railway Hobby plan ($5/bulan). Auto-redeploy saat push ke `main`.
Auto-seed production dengan CDN URL `https://assets.ifsplat.my.id` saat cold start.
`NODE_ENV=production` diset di Railway environment variables.

### [x] t. Setup CDN Custom Domain assets.ifsplat.my.id ✅
Cloudflare R2 bucket `3dgs-splats` diakses via custom domain `assets.ifsplat.my.id`.
Cache Rule aktif: Edge TTL 1 year, Browser TTL 1 month.
`cf-cache-status: HIT` confirmed — file .sog di-serve dari edge server Singapore.
`seed-production.js` hardcode URL CDN baru.

### [x] u. Domain ifsplat.my.id Live ✅
Domain dibeli di Hostinger (ekstensi .my.id). Nameserver pindah ke Cloudflare.
DNS Records GitHub Pages: 4× A record (185.199.108–111.153), DNS only.
Frontend primary: `https://ifsplat.my.id`
Frontend fallback: `https://algazahp.github.io/3DGS-Viewer-IF-ITS/`

### [x] v. CORS R2 Dikonfigurasi untuk Semua Domain ✅
R2 bucket CORS rules mencakup `algazahp.github.io` dan `ifsplat.my.id`.
`ALLOWED_ORIGINS` backend mencakup: localhost:5500, 127.0.0.1:5500,
localhost:3000, localhost:3001, algazahp.github.io, ifsplat.my.id.

### [x] w. Test End-to-End di ifsplat.my.id ✅
Semua 13 scene bisa diakses online dari `https://ifsplat.my.id`.
Photo comparison, panel info rekonstruksi, minimap, back button — semua berfungsi.
Tidak ada CORS error di browser console.
CDN cache HIT confirmed setelah load pertama.

### [x] x. Script calc_metrics.py Dibuat dan Berjalan ✅
`tools/calc_metrics.py` — hitung PSNR dan SSIM via opencv-python + scikit-image.
Mode 1 (satu scene): `python calc_metrics.py <scene_id> <ref_folder> <render_folder>`
Mode 2 (semua scene): `python calc_metrics.py --all <base_ref> <base_render>`
Output: tabel per pasang gambar + rata-rata per scene + ringkasan dengan label kualitas.

### [x] y. Evaluasi PSNR/SSIM 12 Scene Interior Selesai ✅
Semua 12 scene interior sudah dievaluasi. Rata-rata: PSNR 11.71 dB, SSIM 0.5905.
SSIM tertinggi: kelas-if112 (0.7075). SSIM terendah: kelas-if107 (0.5214).
Scene exterior di-skip — background langit hitam akibat pruning tidak representatif.
Hasil lengkap di PROJECT_CONTEXT.md bagian 11.

### [x] z. Landing Page Live ✅
`index.html` + `landing.css` — hero section, about, statistik, grid 13 scene dengan foto.
Viewer dipindah ke `viewer.html`. Tombol "Mulai Jelajahi" mengarah ke `viewer.html`.
Setiap kartu scene dilengkapi foto thumbnail + deskripsi singkat.

### [x] aa. Deskripsi Scene di Kartu Landing Page ✅
13 kartu scene masing-masing memiliki `<p class="scene-card-desc">` di bawah nama scene.
Deskripsi bervariasi per scene — natural, tanpa em dash.
Styling: font-size 0.75rem, color var(--ink-muted), line-height 1.4.

### [x] ab. Loading Screen Interaktif ✅
Layout final: spinner → `#loading-main-text` (pesan dinamis) → progress bar → `#loading-percent` → `#loading-sub-text` (disclaimer).
Pesan berganti setiap 2.5 detik dengan fade opacity 0.4s.
Data pesan di `loadingMessages` object dengan field `subDelay` per tipe scene:
- Exterior (5 pesan): menyebut 18 juta splat, 262 MB, estimasi 1–3 menit. Disclaimer muncul setelah 3 detik (`subDelay: 3000`).
- Interior (4 pesan): keterangan singkat 3DGS. Disclaimer langsung tampil (`subDelay: 0`).
Fungsi: `startLoadingMessages(sceneId)`, `stopLoadingMessages()` di `scene-manager.js`.
Alignment disclaimer dipaksa rata tengah: `text-align: center !important` + style inline di `viewer.html`.

### [x] ac. Fix Tombol Kembali di Scene Exterior ✅
Sebelumnya `backBtn.hidden = true` saat scene exterior.
Sekarang tombol selalu tampil di semua scene dan selalu mengarah ke `index.html`.
Fix di `scene-manager.js:updateUI()`.

### [x] ad. Landing Page Live ✅
`index.html` + `landing.css` — hero section, about, statistik, grid 13 scene dengan foto.
Viewer dipindah ke `viewer.html`. Tombol "Mulai Jelajahi" mengarah ke `viewer.html`.

### [x] ae. Deskripsi Scene di Kartu Landing Page ✅
13 kartu scene masing-masing memiliki `<p class="scene-card-desc">` di bawah nama scene.
Deskripsi bervariasi per scene — natural, tanpa em dash.

### [x] af. Deskripsi About Section Landing Page ✅
Paragraf about section sudah diperbarui dengan deskripsi lengkap gedung dan virtual tour.

---

## YANG PERLU DILAKUKAN

### PRIORITAS SEKARANG

**[ ] BUKU TA — prioritas utama**
- Revisi Bab 1–3 (di Project Claude)
- Tulis Bab 4 — Hasil & Analisis
  - Masukkan tabel PSNR/SSIM yang sudah ada (12 scene interior, rata-rata 11.71 dB / 0.5905)
  - Tambah perbandingan visual foto vs render (pakai fitur Photo Comparison)
  - Analisis kualitas per scene: SSIM lebih representatif dari PSNR untuk kondisi ini
  - Sertakan screenshot viewer per scene
  - Tambahkan hasil exterior setelah evaluasi selesai
- Tulis Bab 5 — Kesimpulan & Saran
  - Saran pengembangan: lihat bagian OPSIONAL di bawah
- **Deadline: 22 Juni 2026**

**[ ] Setup UptimeRobot untuk Railway keep-alive**
Railway Hobby plan sleep setelah ~30 menit tidak ada traffic.
- Daftar di https://uptimerobot.com (free)
- Monitor URL: `https://3dgs-viewer-if-its-production.up.railway.app/api/scenes`
- Interval: setiap 5 menit
- Tanpa ini, cold start menyebabkan request API pertama lambat ~5–10 detik.

---

### SETELAH BIMBINGAN DOSBING

**[ ] Fix navigasi WASD sejajar horizontal**
Saat ini WASD bergerak mengikuti arah hadap kamera termasuk pitch.
Perlu dikunci agar gerak horizontal selalu sejajar lantai.

**[ ] Scroll wheel untuk maju/mundur**
Saat ini scroll mengubah kecepatan (moveSpeed).
Opsi: ganti atau tambah mode scroll untuk maju/mundur langsung.

**[ ] Indikator sensitivitas kecepatan gerak kamera**
Slider atau indikator visual yang menunjukkan kecepatan gerak kamera saat ini.

**[ ] Vision cone / arah hadap di minimap eksterior**
Tambah segitiga / cone di atas titik indikator minimap yang menunjukkan arah hadap kamera.

**[ ] Favicon menggunakan LogoInformatika.gif**
`<link rel="icon" href="assets/LogoInformatika.gif">` sudah ada di HTML tapi belum diverifikasi tampil.
Perlu test di browser dan pastikan file GIF berfungsi sebagai favicon.

**[ ] Tambah model ruangan baru jika diminta dosbing**
Jika ada scene tambahan yang diminta, ikuti alur: rekam → Postshot → convert ke .sog
→ upload ke R2 → seed.js → kalibrasi cam_pos/cam_yaw/cam_pitch.

---

### OPSIONAL (saran pengembangan Bab 5)

**[ ] Streamed LOD untuk eksterior (256 MB)**
File sudah ada di R2: `exterior-streamed/`. Butuh perubahan loader ke `GSplatLod` component.
Generate LOD rendah via splat-transform `--decimate`, load dulu ~20 MB lalu swap ke full res.

**[ ] Walk mode**
Mode berjalan di lantai — kamera dikunci di ketinggian tetap, tidak bisa terbang.
Cocok untuk interior agar terasa seperti menjelajahi ruangan sungguhan.

**[ ] Mobile responsiveness**
Touch controls sudah ada, tapi layout UI belum dioptimalkan untuk layar kecil.
Scene eksterior (256 MB) kemungkinan tidak akan bisa jalan di mobile.

**[ ] Cloudflare Smart Tiered Cache**
Aktifkan Tiered Cache di Cloudflare untuk mengurangi request ke R2 origin.
Berguna jika traffic meningkat signifikan.

**[ ] Splat budget / maxSplats**
PlayCanvas mendukung `maxSplats` di GSplatComponent.
Trade-off performa vs kualitas — diskusikan dengan dosbing sebelum diimplementasi.

---

## CATATAN PENTING

- `.env` ada di `.gitignore` — tidak pernah di-push ✅
- File `.sog` tidak di-push ke GitHub (terlalu besar, disimpan di R2) ✅
- `ALLOWED_ORIGINS` di `server.js` sudah include semua domain aktif ✅
- `BACKEND_URL` di `scene-manager.js` sudah dinamis — tidak perlu ganti manual ✅
- Railway auto-redeploy setiap push ke `main` — DB re-seed otomatis saat cold start ✅
- CDN `assets.ifsplat.my.id` aktif dengan cache 1 year — perubahan file .sog perlu cache purge manual ✅
- **Deadline sidang: 22 Juni 2026** — fokus ke buku TA
- **Loading lambat:** kemungkinan banyak tab browser — buka di Incognito atau tutup tab lain
