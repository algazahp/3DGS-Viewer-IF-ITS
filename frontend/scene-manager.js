import * as pc from 'https://cdn.jsdelivr.net/npm/playcanvas/build/playcanvas.mjs';
window.__pc = pc;

// ============================================================
// Konstanta
// ============================================================
const BACKEND_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:3001'
  : 'https://3dgs-viewer-if-its-production.up.railway.app';

// 6 titik kalibrasi: world coords (wx, wz) → minimap UV (mu, mv)
// mu=0 kiri, mu=1 kanan, mv=0 atas, mv=1 bawah
const MINIMAP_POINTS = [
  { wx: 0.788, wz: 5.600, mu: 0.00, mv: 0.00 },
  { wx: -6.727, wz: 1.128, mu: 1.00, mv: 0.00 },
  { wx: 6.183, wz: -3.336, mu: 0.00, mv: 1.00 },
  { wx: -1.294, wz: -8.315, mu: 1.00, mv: 1.00 },
  { wx: 0.009, wz: 1.131, mu: 0.45, mv: 0.45 },
  { wx: 0.937, wz: -1.533, mu: 0.70, mv: 0.58 },
];

function computeAffineTransform(pts) {
  // Least squares: minimise ||Ax - b|| for overdetermined system
  const AtA = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  const Atu = [0, 0, 0];
  const Atv = [0, 0, 0];

  for (const p of pts) {
    const row = [p.wx, p.wz, 1];
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) AtA[i][j] += row[i] * row[j];
      Atu[i] += row[i] * p.mu;
      Atv[i] += row[i] * p.mv;
    }
  }

  function det3(m) {
    return m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1])
      - m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0])
      + m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
  }

  function solve3(A, b) {
    const detA = det3(A);
    return [0, 1, 2].map(i => {
      const Ai = A.map((row, r) => row.map((v, c) => c === i ? b[r] : v));
      return det3(Ai) / detA;
    });
  }

  const [a, b, c] = solve3(AtA, Atu);
  const [d, e, f] = solve3(AtA, Atv);
  return { a, b, c, d, e, f };
}

const AFFINE = computeAffineTransform(MINIMAP_POINTS);

// Posisi titik marker statis per scene interior (fraksi 0–1 dari lebar/tinggi gambar denah)
const SCENE_MARKER_POS = {
  'plaza-supenno': { x: 0.50, y: 0.71 },
  'kelas-if112': { x: 0.12, y: 0.40 },
  'kelas-if105': { x: 0.84, y: 0.61 },
  'kelas-if107': { x: 0.45, y: 0.89 },
  'aula': { x: 0.53, y: 0.90 },
  'ruang-sidang': { x: 0.62, y: 0.88 },
  'lounge': { x: 0.76, y: 0.93 },
  'ruang-rapat': { x: 0.95, y: 0.69 },
  'ruang-dosen-if227': { x: 0.08, y: 0.49 },
  'lab-pascasarjana': { x: 0.12, y: 0.62 },
  'loby-pascasarjana': { x: 0.86, y: 0.69 },
  'lab-kcv': { x: 0.82, y: 0.49 },
};

// ============================================================
// State global
// ============================================================
let app;
let cameraEntity;
let currentAsset = null;
let currentSplatEntity = null;
let currentBlobUrl = null;
let currentSceneData = null;
let isTransitioning = false;
let lastMinimapUpdate = 0;
let infoPanelActive = false;

// Mode kamera aktif — ditentukan per-scene berdasarkan room_type
// 'free'  : eksterior → WASD + pointer lock mouse look
// 'orbit' : kelas / plaza → drag rotate + scroll zoom
let cameraMode = 'orbit';

// ── Orbit camera state ──────────────────────────────────────
let orbitRadius = 5;
let orbitTheta = 0;   // yaw, radian, bebas 360°
let orbitPhi = 0;   // pitch, radian, diklem ±86°
const orbitTarget = new pc.Vec3(0, 0, 0);

// ── Free camera state ────────────────────────────────────────
let yaw = 0;     // rotasi horizontal, radian
let pitch = 0;     // rotasi vertikal, radian
let moveSpeed = 5;     // unit/detik; scroll mengubah nilai ini
const keys = {};    // key codes yang sedang ditekan

// ============================================================
// DOM references
// ============================================================
const canvas = document.getElementById('splat-canvas');
const loadingScreen = document.getElementById('loading-screen');
const loadingText = document.getElementById('loading-text');
const loadingPercent = document.getElementById('loading-percent');
const progressBar = document.getElementById('progress-bar');
const sceneLabel = document.getElementById('scene-label');
const sceneTypeEl = document.getElementById('scene-type');
const backBtn = document.getElementById('back-btn');
const minimapEl = document.getElementById('minimap');
const minimapImg = document.getElementById('minimap-img');
const minimapIndicator = document.getElementById('minimap-indicator');
const minimapToggle = document.getElementById('minimap-toggle');
const minimapFullscreen = document.getElementById('minimap-fullscreen');
const minimapOverlay = document.getElementById('minimap-overlay');
const retryBtn = document.getElementById('retry-btn');
const sceneListEl = document.getElementById('scene-list');
const sceneListToggle = document.getElementById('scene-list-toggle');
const cameraHintEl = document.getElementById('camera-hint');
const comparisonToggle = document.getElementById('comparison-toggle');
const photoComparison = document.getElementById('photo-comparison');
const fpsCounter = document.getElementById('fps-counter');
const infoToggle = document.getElementById('info-toggle');
const reconstructionPanel = document.getElementById('reconstruction-panel');
const infoClose = document.getElementById('info-close');
const infoSplatType = document.getElementById('info-splat-type');
const infoSplatCount = document.getElementById('info-splat-count');
const infoImageCount = document.getElementById('info-image-count');
const infoTrainTime = document.getElementById('info-train-time');
const photoPanel = document.getElementById('photo-panel');
const comparisonPhoto = document.getElementById('comparison-photo');
const photoCounter = document.getElementById('photo-counter');
const photoPrev = document.getElementById('photo-prev');
const photoNext = document.getElementById('photo-next');
const divider = document.getElementById('comparison-divider');
const photoClose = document.getElementById('photo-close');
const guideToggle = document.getElementById('guide-toggle');
const guideModal = document.getElementById('guide-modal');
const guideOverlay = document.getElementById('guide-overlay');
const guideClose = document.getElementById('guide-close');

// ============================================================
// Loading screen helpers
// ============================================================

function showLoading(text = 'Memuat...') {
  if (document.pointerLockElement) document.exitPointerLock();
  clearTimeout(inactivityTimer);
  hideCameraHint();
  retryBtn.hidden = true;
  comparisonToggle.hidden = true;
  loadingText.textContent = text;
  updateProgress(0);
  loadingScreen.classList.add('is-visible');
}

async function hideLoading() {
  loadingScreen.classList.remove('is-visible');
  comparisonToggle.hidden = false;
  await delay(380);
}

function updateProgress(fraction) {
  const pct = Math.round(Math.max(0, Math.min(1, fraction)) * 100);
  progressBar.style.width = `${pct}%`;
  loadingPercent.textContent = `${pct}%`;
}

function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// ============================================================
// Camera hint — muncul saat 3 detik tidak ada aksi, hilang saat ada aksi
// ============================================================

let inactivityTimer = null;

function hideCameraHint() {
  cameraHintEl.style.opacity = '0';
  cameraHintEl.style.pointerEvents = 'none';
}

function showCameraHint(mode) {
  cameraHintEl.textContent = mode === 'free'
    ? 'WASD: Gerak  |  Mouse: Lihat  |  Scroll: Kecepatan  |  Shift: Sprint'
    : 'Drag: Putar  |  Scroll: Zoom';
  cameraHintEl.style.opacity = '1';
  cameraHintEl.style.pointerEvents = 'none';
}

function resetInactivityTimer() {
  hideCameraHint();
  clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(() => showCameraHint(cameraMode), 500);
}

// ============================================================
// Fetch file .sog dengan progress tracking via ReadableStream
// ============================================================

async function fetchWithProgress(url, onProgress) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Gagal mengunduh file: HTTP ${response.status}`);

  const contentLength = response.headers.get('Content-Length');
  const total = contentLength ? parseInt(contentLength, 10) : 0;
  const reader = response.body.getReader();
  const chunks = [];
  let received = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    received += value.length;
    onProgress(total > 0 ? (received / total) * 0.9 : 0.45);
  }

  onProgress(0.9);
  return URL.createObjectURL(new Blob(chunks));
}

async function fetchWithRetry(url, onProgress, maxRetry = 2) {
  let lastError;
  for (let i = 0; i <= maxRetry; i++) {
    try {
      return await fetchWithProgress(url, onProgress);
    } catch (err) {
      lastError = err;
      if (i < maxRetry) {
        loadingText.textContent = `Koneksi gagal, mencoba ulang (${i + 1}/${maxRetry})...`;
        await delay(1500);
      }
    }
  }
  throw lastError;
}

// ============================================================
// Unload scene aktif (cegah memory leak)
// ============================================================

function unloadCurrentScene() {
  if (currentSplatEntity) { currentSplatEntity.destroy(); currentSplatEntity = null; }
  if (currentAsset) { app.assets.remove(currentAsset); currentAsset.unload(); currentAsset = null; }
  if (currentBlobUrl) { URL.revokeObjectURL(currentBlobUrl); currentBlobUrl = null; }
  if (window.gc) window.gc();
}

// ============================================================
// Load scene — fetch metadata → download .sog → render
// ============================================================

async function loadScene(sceneId) {
  closeComparison();
  closeInfoPanel();
  closeGuide();
  if (isMinimapFullscreen) toggleMinimapFullscreen();

  // 1. Metadata dari backend
  const resp = await fetch(`${BACKEND_URL}/api/scenes/${sceneId}`);
  if (!resp.ok) throw new Error(`Scene tidak ditemukan: ${sceneId}`);
  const sceneData = await resp.json();

  // 2. Update loading text + download
  loadingText.textContent = `Memuat ${sceneData.label}...`;
  updateProgress(0);
  const blobUrl = await fetchWithRetry(sceneData.file_url, updateProgress);

  // 3. Bersihkan scene lama
  unloadCurrentScene();
  updateProgress(0.92);

  // 4. Asset PlayCanvas
  const asset = new pc.Asset(sceneId, 'gsplat', {
    url: blobUrl,
    filename: `${sceneId}.sog`,
  });
  app.assets.add(asset);

  await new Promise((resolve, reject) => {
    asset.on('error', (msg) => reject(new Error(`Asset error: ${msg}`)));
    asset.ready(() => { updateProgress(1); resolve(); });
    app.assets.load(asset);
  });

  // 5. Entity + rotasi fix (coordinate system .sog terbalik vs training)
  const entity = new pc.Entity('splat');
  entity.addComponent('gsplat', { asset });
  app.root.addChild(entity);
  entity.setEulerAngles(180, 180, 0);

  // 6. Simpan state
  currentAsset = asset;
  currentSplatEntity = entity;
  currentBlobUrl = blobUrl;
  currentSceneData = sceneData;

  // 7. Set mode kamera — free untuk scene tertentu, orbit untuk sisanya
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

  if (cameraMode === 'free') {
    initCameraFromPos(sceneData.cam_pos, sceneData.cam_yaw, sceneData.cam_pitch);
  } else {
    initOrbitFromCamPos(sceneData.cam_pos);
  }

  // 8. Update UI + mulai inactivity timer (hint muncul setelah 3 detik idle)
  updateUI(sceneData);
  resetInactivityTimer();

  // Update gambar minimap sesuai floor_map scene
  if (sceneData.floor_map) {
    minimapImg.src = sceneData.floor_map;
  }

  // Set posisi indikator
  const markerPos = SCENE_MARKER_POS[sceneData.id];
  if (markerPos) {
    // Interior: titik statis di posisi ruangan pada denah
    minimapIndicator.style.display = 'block';
    minimapIndicator.style.left = `${markerPos.x * 100}%`;
    minimapIndicator.style.top = `${markerPos.y * 100}%`;
    minimapIndicator.style.transition = 'none';
  } else if (sceneData.id === 'exterior') {
    // Eksterior: indikator dinamis via updateMinimapIndicator() — restore transition
    minimapIndicator.style.display = 'block';
    minimapIndicator.style.transition = 'left 0.3s ease, top 0.3s ease';
  }

  // Tandai interior/eksterior untuk styling
  if (sceneData.id === 'exterior') {
    minimapEl.classList.remove('is-interior');
  } else {
    minimapEl.classList.add('is-interior');
  }

  // Update label header minimap
  const FLOOR_LABEL = {
    'exterior': 'Peta Lokasi',
    'plaza-supenno': 'Lantai 1',
    'kelas-if112': 'Lantai 1',
    'kelas-if105': 'Lantai 1',
    'kelas-if107': 'Lantai 1',
    'aula': 'Lantai 2',
    'ruang-sidang': 'Lantai 2',
    'lounge': 'Lantai 2',
    'ruang-rapat': 'Lantai 2',
    'ruang-dosen-if227': 'Lantai 2',
    'lab-pascasarjana': 'Lantai 1',
    'loby-pascasarjana': 'Lantai 2',
    'lab-kcv': 'Lantai 3',
  };
  const headerSpan = minimapEl.querySelector('#minimap-header span');
  if (headerSpan) {
    headerSpan.textContent = FLOOR_LABEL[sceneData.id] ?? 'Peta Lokasi';
  }

  // Tombol fullscreen hanya untuk scene interior
  if (sceneData.id === 'exterior') {
    minimapFullscreen.style.display = 'none';
  } else {
    const isCollapsed = minimapEl.classList.contains('collapsed');
    minimapFullscreen.style.display = isCollapsed ? 'none' : 'inline';
  }

  minimapEl.style.display = 'block';

  if (!hasShownGuide && sceneData.id === 'exterior') {
    hasShownGuide = true;
    setTimeout(() => openGuide(), 800);
  }
}

// ============================================================
// Update UI
// ============================================================

const ROOM_TYPE_LABEL = { eksterior: 'Eksterior', kelas: 'Ruang Kelas', plaza: 'Plaza' };

function updateUI(sceneData) {
  sceneLabel.textContent = sceneData.label;
  const roomType = sceneData.room_info?.room_type ?? '';
  sceneTypeEl.textContent = ROOM_TYPE_LABEL[roomType] ?? roomType;

  if (sceneData.back_to) {
    backBtn.hidden = false;
    backBtn.onclick = () => transitionTo(sceneData.back_to);
  } else {
    backBtn.hidden = true;
    backBtn.onclick = null;
  }

  document.querySelectorAll('.scene-list-item').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.sceneId === sceneData.id);
  });

  updateReconstructionPanel(sceneData.room_info);
}

// ============================================================
// Transisi antar scene (fade to black)
// ============================================================

async function transitionTo(sceneId) {
  if (isTransitioning) return;
  isTransitioning = true;

  showLoading('Memuat...');
  await delay(380);

  try {
    await loadScene(sceneId);
  } catch (err) {
    console.error('[3DGS] Gagal load scene:', err);
    loadingText.textContent = 'Gagal memuat scene.';
    retryBtn.hidden = false;
    retryBtn.onclick = () => {
      retryBtn.hidden = true;
      transitionTo(sceneId);
    };
    isTransitioning = false;
    return;
  }

  await hideLoading();
  isTransitioning = false;
}

// ============================================================
// Orbit camera
// ============================================================

function initOrbitFromCamPos(camPos) {
  const { x, y, z } = camPos;
  orbitRadius = Math.sqrt(x * x + y * y + z * z) || 5;
  orbitTheta = Math.atan2(x, z);
  orbitPhi = Math.asin(Math.max(-0.99, Math.min(0.99, y / orbitRadius)));
  updateCameraFromOrbit();
}

function updateCameraFromOrbit() {
  const sinT = Math.sin(orbitTheta), cosT = Math.cos(orbitTheta);
  const sinP = Math.sin(orbitPhi), cosP = Math.cos(orbitPhi);
  cameraEntity.setPosition(
    orbitTarget.x + orbitRadius * sinT * cosP,
    orbitTarget.y + orbitRadius * sinP,
    orbitTarget.z + orbitRadius * cosT * cosP,
  );
  cameraEntity.lookAt(orbitTarget);
}

// ============================================================
// Free camera — inisialisasi posisi dan reset yaw/pitch
// ============================================================

function initCameraFromPos(camPos, camYaw, camPitch) {
  cameraEntity.setPosition(camPos.x, camPos.y, camPos.z);
  yaw = camYaw ?? Math.PI;
  pitch = camPitch ?? 0;
  cameraEntity.setEulerAngles(
    pitch * pc.math.RAD_TO_DEG,
    yaw * pc.math.RAD_TO_DEG,
    0,
  );
}

// ============================================================
// Controls — mouse, wheel, keyboard, touch
// Satu set listener per event, branching cameraMode di runtime.
// ============================================================

function initMouseControls() {
  // ── Orbit drag state ─────────────────────────────────────
  let isDragging = false;
  let lastX = 0, lastY = 0;

  // ── Mouse down ───────────────────────────────────────────
  canvas.addEventListener('mousedown', (e) => {
    resetInactivityTimer();
    if (e.button !== 0) return;
    if (cameraMode === 'free') {
      canvas.requestPointerLock();
    } else {
      isDragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
    }
  });

  // ── Mouse move ───────────────────────────────────────────
  window.addEventListener('mousemove', (e) => {
    resetInactivityTimer();
    if (cameraMode === 'free') {
      if (!document.pointerLockElement) return;
      yaw -= e.movementX * 0.002;
      pitch -= e.movementY * 0.002;
      pitch = Math.max(-Math.PI * 0.49, Math.min(Math.PI * 0.49, pitch));
      // euler angles diterapkan di update loop
    } else {
      if (!isDragging) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      orbitTheta -= dx * 0.008;   // bebas 360°, tidak di-clamp
      orbitPhi -= dy * 0.008;
      orbitPhi = Math.max(-Math.PI * 0.48, Math.min(Math.PI * 0.48, orbitPhi));
      updateCameraFromOrbit();
    }
  });

  window.addEventListener('mouseup', () => { isDragging = false; });
  window.addEventListener('mouseleave', () => { isDragging = false; });

  // ── Wheel ────────────────────────────────────────────────
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    resetInactivityTimer();
    if (cameraMode === 'free') {
      moveSpeed *= 1 - e.deltaY * 0.001;
      moveSpeed = Math.max(0.5, Math.min(50, moveSpeed));
    } else {
      orbitRadius *= 1 + e.deltaY * 0.001;
      orbitRadius = Math.max(0.5, Math.min(100, orbitRadius));
      updateCameraFromOrbit();
    }
  }, { passive: false });

  canvas.addEventListener('contextmenu', (e) => e.preventDefault());

  // ── Keyboard (WASD untuk free camera) ───────────────────
  window.addEventListener('keydown', (e) => {
    resetInactivityTimer();
    keys[e.code] = true;
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
      e.preventDefault();
    }
  });
  window.addEventListener('keyup', (e) => { keys[e.code] = false; });

  // ── Touch ────────────────────────────────────────────────
  let lastTouchX = 0, lastTouchY = 0, lastTouchDist = 0;

  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    resetInactivityTimer();
    if (e.touches.length === 1) {
      lastTouchX = e.touches[0].clientX;
      lastTouchY = e.touches[0].clientY;
    } else if (e.touches.length === 2) {
      if (cameraMode === 'orbit') {
        lastTouchDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY,
        );
      } else {
        // free: 2 jari — track center Y untuk swipe maju/mundur
        lastTouchY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      }
    }
  }, { passive: false });

  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    resetInactivityTimer();
    if (cameraMode === 'free') {
      if (e.touches.length === 1) {
        // 1 jari: look (yaw/pitch)
        const dx = e.touches[0].clientX - lastTouchX;
        const dy = e.touches[0].clientY - lastTouchY;
        lastTouchX = e.touches[0].clientX;
        lastTouchY = e.touches[0].clientY;
        yaw -= dx * 0.005;
        pitch -= dy * 0.005;
        pitch = Math.max(-Math.PI * 0.49, Math.min(Math.PI * 0.49, pitch));
      } else if (e.touches.length === 2) {
        // 2 jari swipe vertikal: gerak maju/mundur
        const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        const dy = lastTouchY - centerY; // positif = swipe ke atas = maju
        lastTouchY = centerY;
        const forward = new pc.Vec3(Math.sin(yaw), 0, Math.cos(yaw));
        const pos = cameraEntity.getPosition();
        const step = dy * 0.02 * moveSpeed;
        cameraEntity.setPosition(pos.x + forward.x * step, pos.y, pos.z + forward.z * step);
      }
    } else {
      // orbit mode
      if (e.touches.length === 1) {
        const dx = e.touches[0].clientX - lastTouchX;
        const dy = e.touches[0].clientY - lastTouchY;
        lastTouchX = e.touches[0].clientX;
        lastTouchY = e.touches[0].clientY;
        orbitTheta -= dx * 0.008;
        orbitPhi -= dy * 0.008;
        orbitPhi = Math.max(-Math.PI * 0.48, Math.min(Math.PI * 0.48, orbitPhi));
        updateCameraFromOrbit();
      } else if (e.touches.length === 2) {
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY,
        );
        orbitRadius *= 1 + (lastTouchDist - dist) * 0.005;
        orbitRadius = Math.max(0.5, Math.min(100, orbitRadius));
        lastTouchDist = dist;
        updateCameraFromOrbit();
      }
    }
  }, { passive: false });

  canvas.addEventListener('touchend', (e) => { e.preventDefault(); }, { passive: false });
}

// ============================================================
// Minimap
// ============================================================

function updateMinimapIndicator() {
  if (!cameraEntity) return;
  // Interior scenes: posisi titik sudah di-set statis di loadScene()
  if (currentSceneData?.id !== 'exterior') return;

  const pos = cameraEntity.getPosition();
  const mu = AFFINE.a * pos.x + AFFINE.b * pos.z + AFFINE.c;
  const mv = AFFINE.d * pos.x + AFFINE.e * pos.z + AFFINE.f;
  minimapIndicator.style.left = `${Math.max(0, Math.min(1, mu)) * 100}%`;
  minimapIndicator.style.top = `${Math.max(0, Math.min(1, mv)) * 100}%`;
}

// ============================================================
// Scene list sidebar
// ============================================================

async function initSceneList() {
  try {
    const resp = await fetch(`${BACKEND_URL}/api/scenes`);
    const scenes = await resp.json();
    sceneListEl.querySelectorAll('.scene-list-item').forEach(el => el.remove());
    for (const s of scenes) {
      const btn = document.createElement('button');
      btn.className = 'scene-list-item';
      btn.dataset.sceneId = s.id;
      btn.textContent = s.label;
      btn.addEventListener('click', () => { sceneListEl.hidden = true; transitionTo(s.id); });
      sceneListEl.appendChild(btn);
    }
  } catch (err) {
    console.warn('[3DGS] Gagal load scene list:', err);
  }
}

sceneListToggle.addEventListener('click', () => {
  closeInfoPanel();
  sceneListEl.hidden = !sceneListEl.hidden;
});

minimapToggle.addEventListener('click', () => {
  const isCollapsed = minimapEl.classList.toggle('collapsed');
  minimapToggle.textContent = isCollapsed ? '+' : '−';
  minimapFullscreen.style.display = isCollapsed ? 'none' : 'inline';
});

let isMinimapFullscreen = false;

function toggleMinimapFullscreen() {
  isMinimapFullscreen = !isMinimapFullscreen;
  minimapEl.classList.toggle('is-fullscreen', isMinimapFullscreen);
  minimapOverlay.classList.toggle('visible', isMinimapFullscreen);
  minimapFullscreen.textContent = isMinimapFullscreen ? '✕' : '⛶';
  minimapFullscreen.title = isMinimapFullscreen ? 'Tutup' : 'Perbesar peta';
  minimapToggle.style.display = isMinimapFullscreen ? 'none' : 'inline';
}

minimapFullscreen.addEventListener('click', toggleMinimapFullscreen);
minimapOverlay.addEventListener('click', () => {
  if (isMinimapFullscreen) toggleMinimapFullscreen();
});

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && isMinimapFullscreen) toggleMinimapFullscreen();
  if (e.key === 'Escape' && isGuideOpen) closeGuide();
});

document.addEventListener('click', (e) => {
  if (!sceneListEl.hidden && !sceneListEl.contains(e.target) && e.target !== sceneListToggle) {
    sceneListEl.hidden = true;
  }
});

// ============================================================
// Reconstruction Info Panel
// ============================================================

function updateReconstructionPanel(roomInfo) {
  infoSplatType.textContent = roomInfo?.splat_type ?? '—';
  infoSplatCount.textContent = roomInfo?.splat_count
    ? `${roomInfo.splat_count} splat`
    : '—';
  infoImageCount.textContent = roomInfo?.image_count ?? '—';
  infoTrainTime.textContent = roomInfo?.train_time ?? '—';
}

function openInfoPanel() {
  infoPanelActive = true;
  reconstructionPanel.classList.remove('panel-hidden');
  infoToggle.classList.add('active');
}

function closeInfoPanel() {
  infoPanelActive = false;
  reconstructionPanel.classList.add('panel-hidden');
  infoToggle.classList.remove('active');
}

infoToggle.addEventListener('click', () => {
  sceneListEl.hidden = true;
  if (infoPanelActive) closeInfoPanel();
  else openInfoPanel();
});

infoClose.addEventListener('click', closeInfoPanel);

// ============================================================
// PHOTO COMPARISON — implementasi bersih
// ============================================================

// State
let comparisonActive = false;
let currentPhotos = [];
let currentPhotoIdx = 0;

// Fetch foto dari API dan preload gambar pertama
async function loadComparisonPhotos(sceneId) {
  try {
    const resp = await fetch(`${BACKEND_URL}/api/scenes/${sceneId}/photos`);
    const data = await resp.json();
    currentPhotos = data.map(p => p.photo_url);
    currentPhotoIdx = 0;

    if (currentPhotos.length === 0) return;

    // Preload gambar pertama sebelum tampilkan
    await new Promise((resolve) => {
      const img = new Image();
      img.onload = resolve;
      img.onerror = resolve;
      img.src = currentPhotos[0];
    });

    comparisonPhoto.src = currentPhotos[0];
    photoCounter.textContent = `1 / ${currentPhotos.length}`;

  } catch (err) {
    console.warn('[comparison] Gagal load foto:', err);
    currentPhotos = [];
  }
}

// Update tampilan foto aktif
function updateComparisonPhoto() {
  if (!currentPhotos.length) return;
  comparisonPhoto.src = currentPhotos[currentPhotoIdx];
  photoCounter.textContent = `${currentPhotoIdx + 1} / ${currentPhotos.length}`;
}

// Buka comparison panel
async function openComparison() {
  comparisonActive = true;
  photoComparison.classList.add('is-active');
  comparisonToggle.classList.add('active');
  photoPanel.style.width = '40%';
  if (currentSceneData) {
    await loadComparisonPhotos(currentSceneData.id);
  }
}

// Tutup comparison panel
function closeComparison() {
  comparisonActive = false;
  photoComparison.classList.remove('is-active');
  comparisonToggle.classList.remove('active');
  comparisonPhoto.src = '';
  currentPhotos = [];
  currentPhotoIdx = 0;
}

// Toggle
comparisonToggle.addEventListener('click', () => {
  if (comparisonActive) {
    closeComparison();
  } else {
    openComparison();
  }
});

// Tombol X tutup panel
photoClose.addEventListener('click', closeComparison);

// Navigasi foto
photoPrev.addEventListener('click', () => {
  if (!currentPhotos.length) return;
  currentPhotoIdx = (currentPhotoIdx - 1 + currentPhotos.length) % currentPhotos.length;
  updateComparisonPhoto();
});

photoNext.addEventListener('click', () => {
  if (!currentPhotos.length) return;
  currentPhotoIdx = (currentPhotoIdx + 1) % currentPhotos.length;
  updateComparisonPhoto();
});

// Drag divider
let isDraggingDivider = false;
divider.addEventListener('mousedown', (e) => {
  isDraggingDivider = true;
  e.preventDefault();
});
window.addEventListener('mousemove', (e) => {
  if (!isDraggingDivider) return;
  const pct = Math.max(20, Math.min(80, (e.clientX / window.innerWidth) * 100));
  photoPanel.style.width = `${pct}%`;
});
window.addEventListener('mouseup', () => { isDraggingDivider = false; });

// ============================================================
// Navigation Guide
// ============================================================

let isGuideOpen = false;
let hasShownGuide = false;

function openGuide() {
  isGuideOpen = true;
  guideModal.classList.add('visible');
  guideOverlay.classList.add('visible');
}

function closeGuide() {
  isGuideOpen = false;
  guideModal.classList.remove('visible');
  guideOverlay.classList.remove('visible');
}

function toggleGuide() {
  isGuideOpen ? closeGuide() : openGuide();
}

guideToggle.addEventListener('click', toggleGuide);
guideClose.addEventListener('click', closeGuide);
guideOverlay.addEventListener('click', closeGuide);

// ============================================================
// PlayCanvas init
// ============================================================

async function initPlayCanvas() {
  const gfxOptions = {
    deviceTypes: navigator.gpu
      ? ['webgpu', 'webgl2']
      : ['webgl2'],
    antialias: true,
  };

  const device = await pc.createGraphicsDevice(canvas, gfxOptions);

  app = new pc.Application(canvas, {
    graphicsDevice: device,
  });

  window.__app = app;

  app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
  app.setCanvasResolution(pc.RESOLUTION_AUTO);

  cameraEntity = new pc.Entity('camera');
  cameraEntity.addComponent('camera', {
    clearColor: new pc.Color(0.05, 0.05, 0.05),
    farClip: 1000,
    nearClip: 0.01,
  });
  app.root.addChild(cameraEntity);

  window.addEventListener('resize', () => app.resizeCanvas());

  let fpsTimer = 0;
  let fpsFrames = 0;

  app.on('update', (dt) => {
    if (cameraMode === 'free') {
      const sinY = Math.sin(yaw);
      const cosY = Math.cos(yaw);
      const sinP = Math.sin(pitch);
      const cosP = Math.cos(pitch);

      const forward = new pc.Vec3(sinY * cosP, -sinP, cosY * cosP);
      const right = new pc.Vec3();
      right.cross(forward, pc.Vec3.UP).normalize();

      const speed = (keys['ShiftLeft'] || keys['ShiftRight'])
        ? moveSpeed * 3 : moveSpeed;

      const vel = new pc.Vec3();
      if (keys['KeyW'] || keys['ArrowUp']) vel.add(forward.clone().mulScalar(-speed * dt));
      if (keys['KeyS'] || keys['ArrowDown']) vel.add(forward.clone().mulScalar(speed * dt));
      if (keys['KeyA'] || keys['ArrowLeft']) vel.add(right.clone().mulScalar(speed * dt));
      if (keys['KeyD'] || keys['ArrowRight']) vel.add(right.clone().mulScalar(-speed * dt));
      if (keys['KeyQ']) vel.y -= speed * dt;
      if (keys['KeyE']) vel.y += speed * dt;

      if (vel.length() > 0) {
        const pos = cameraEntity.getPosition();
        cameraEntity.setPosition(pos.x + vel.x, pos.y + vel.y, pos.z + vel.z);
      }

      cameraEntity.setEulerAngles(
        pitch * pc.math.RAD_TO_DEG,
        yaw * pc.math.RAD_TO_DEG,
        0,
      );
    }

    lastMinimapUpdate += dt;
    if (lastMinimapUpdate >= 0.1) {
      updateMinimapIndicator();
      lastMinimapUpdate = 0;
    }

    fpsFrames++;
    fpsTimer += dt;
    if (fpsTimer >= 0.5) {
      const fps = Math.round(fpsFrames / fpsTimer);
      fpsCounter.textContent = `${fps} FPS`;
      if (fps >= 50) {
        fpsCounter.style.color = 'rgba(100,220,100,0.7)';
      } else if (fps >= 30) {
        fpsCounter.style.color = 'rgba(255,200,50,0.7)';
      } else {
        fpsCounter.style.color = 'rgba(255,80,80,0.7)';
      }
      fpsTimer = 0;
      fpsFrames = 0;
    }
  });

  app.start();
  initMouseControls();
}


// ============================================================
// Console helpers — kalibrasi cam_pos di browser DevTools
// ============================================================

window.getCamera = function () {
  const pos = cameraEntity.getPosition();
  console.log('cam_pos:', { x: +pos.x.toFixed(3), y: +pos.y.toFixed(3), z: +pos.z.toFixed(3) });
  console.log('cam_yaw:  ', yaw.toFixed(4));
  console.log('cam_pitch:', pitch.toFixed(4));
  return { pos, yaw, pitch };
};

window.setHome = function () {
  const pos = cameraEntity.getPosition();
  const sceneId = currentSceneData?.id ?? 'unknown';
  console.log(`\nUpdate seed.js untuk scene '${sceneId}':`);
  console.log(`cam_pos_x: ${pos.x.toFixed(3)},`);
  console.log(`cam_pos_y: ${pos.y.toFixed(3)},`);
  console.log(`cam_pos_z: ${pos.z.toFixed(3)},`);
  console.log(`cam_yaw:   ${yaw.toFixed(4)},`);
  console.log(`cam_pitch: ${pitch.toFixed(4)},`);
  console.log(`\nJalankan: node db/seed.js --local`);
};

window.calibrateMinimap = function () {
  const pos = cameraEntity.getPosition();
  const mu = AFFINE.a * pos.x + AFFINE.b * pos.z + AFFINE.c;
  const mv = AFFINE.d * pos.x + AFFINE.e * pos.z + AFFINE.f;
  console.log(`world:   x=${pos.x.toFixed(3)}, z=${pos.z.toFixed(3)}`);
  console.log(`minimap: left=${(mu * 100).toFixed(1)}%, top=${(mv * 100).toFixed(1)}%`);
};

// ============================================================
// Entry point
// ============================================================

document.addEventListener('DOMContentLoaded', async () => {
  await initPlayCanvas();
  initSceneList();

  try {
    await loadScene('exterior');
  } catch (err) {
    console.error('[3DGS] Gagal load scene awal:', err);
    loadingText.textContent = 'Gagal memuat scene. Pastikan backend berjalan dan URL R2 sudah dikonfigurasi.';
    return;
  }

  await hideLoading();
});
