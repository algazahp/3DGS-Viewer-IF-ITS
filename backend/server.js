const fs      = require('fs');
const path    = require('path');
const express = require('express');
const cors    = require('cors');

// Load .env dari direktori backend jika ada — tanpa dotenv
try {
  const envFile = path.join(__dirname, '.env');
  if (fs.existsSync(envFile)) {
    for (const line of fs.readFileSync(envFile, 'utf8').split(/\r?\n/)) {
      const m = line.match(/^([^#=\s][^=]*?)=(.*)$/);
      if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].trim();
    }
  }
} catch { /* .env opsional */ }

const scenesRouter = require('./routes/scenes');

// Auto-seed database jika kosong (production)
if (process.env.NODE_ENV === 'production') {
  require('./db/init');
}

const app  = express();
const PORT = process.env.PORT || 3000;

// FRONTEND_ORIGIN: tambahkan lebih dari satu dengan koma, contoh:
// FRONTEND_ORIGIN=http://127.0.0.1:5500,https://username.github.io
const extraOrigins = (process.env.FRONTEND_ORIGIN || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

const ALLOWED_ORIGINS = [
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'http://localhost:3000',
  'http://localhost:3001',
  'https://algazahp.github.io',
  'https://ifsplat.my.id',
  ...extraOrigins,
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // curl, Postman, file://
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    callback(new Error(`CORS blocked: ${origin}`));
  },
}));

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/scenes', scenesRouter);

// TEMPORARY: serve file .sog dari storage lokal untuk testing
// Hapus atau nonaktifkan setelah setup Cloudflare R2
if (process.env.LOCAL_SPLAT_DIR) {
  const splatDir = path.resolve(process.env.LOCAL_SPLAT_DIR);
  app.use('/local-splats', express.static(splatDir, {
    setHeaders(res) {
      // Izinkan browser baca file dari origin yang berbeda (frontend dev server)
      res.set('Access-Control-Allow-Origin', '*');
      res.set('Accept-Ranges', 'bytes');
    },
  }));
  console.log(`[local-splats] Serving .sog dari: ${splatDir}`);
} else {
  console.log('[local-splats] LOCAL_SPLAT_DIR tidak di-set — endpoint /local-splats tidak aktif');
}

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`CORS allowed origins: ${ALLOWED_ORIGINS.join(', ')}`);
});
