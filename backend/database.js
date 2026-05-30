const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'db', 'viewer.db');

const db = new Database(DB_PATH);

// WAL mode: lebih cepat untuk read-heavy workload
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS scenes (
      id             TEXT PRIMARY KEY,
      label          TEXT NOT NULL,
      file_url       TEXT NOT NULL,
      back_to        TEXT REFERENCES scenes(id),
      cam_pos_x      REAL NOT NULL DEFAULT 0,
      cam_pos_y      REAL NOT NULL DEFAULT 0,
      cam_pos_z      REAL NOT NULL DEFAULT 5,
      cam_rot_x      REAL NOT NULL DEFAULT 0,
      cam_rot_y      REAL NOT NULL DEFAULT 0,
      cam_rot_z      REAL NOT NULL DEFAULT 0,
      display_order  INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS hotspots (
      id               INTEGER PRIMARY KEY AUTOINCREMENT,
      scene_id         TEXT NOT NULL REFERENCES scenes(id),
      label            TEXT NOT NULL,
      target_scene_id  TEXT NOT NULL REFERENCES scenes(id),
      screen_x         REAL NOT NULL,
      screen_y         REAL NOT NULL,
      is_active        INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS room_info (
      scene_id      TEXT PRIMARY KEY REFERENCES scenes(id),
      floor_number  INTEGER,
      room_type     TEXT NOT NULL,
      capacity      INTEGER,
      description   TEXT
    );

    CREATE TABLE IF NOT EXISTS photo_refs (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      scene_id      TEXT NOT NULL REFERENCES scenes(id),
      photo_url     TEXT NOT NULL,
      display_order INTEGER NOT NULL DEFAULT 0
    );
  `);

  const addColIfNotExists = (table, col, type) => {
    const cols = db.prepare(`PRAGMA table_info(${table})`).all().map(c => c.name);
    if (!cols.includes(col)) {
      db.prepare(`ALTER TABLE ${table} ADD COLUMN ${col} ${type}`).run();
    }
  };

  addColIfNotExists('room_info', 'splat_count', 'TEXT');
  addColIfNotExists('room_info', 'train_time',  'TEXT');
  addColIfNotExists('room_info', 'image_count', 'INTEGER');
  addColIfNotExists('room_info', 'splat_type',  'TEXT');

  addColIfNotExists('scenes', 'cam_yaw',   'REAL');
  addColIfNotExists('scenes', 'cam_pitch', 'REAL');
  addColIfNotExists('scenes', 'floor_map', 'TEXT');
}

initDb();

module.exports = db;
