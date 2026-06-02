const express = require('express');
const db = require('../database');

const router = express.Router();

const stmtListScenes = db.prepare(`
  SELECT id, label, file_url, display_order
  FROM scenes
  ORDER BY display_order ASC
`);

const stmtGetScene = db.prepare(`
  SELECT id, label, file_url, back_to,
         cam_pos_x, cam_pos_y, cam_pos_z,
         cam_rot_x, cam_rot_y, cam_rot_z,
         cam_yaw, cam_pitch,
         floor_map,
         display_order
  FROM scenes
  WHERE id = ?
`);

const stmtGetHotspots = db.prepare(`
  SELECT id, label, target_scene_id, screen_x, screen_y
  FROM hotspots
  WHERE scene_id = ? AND is_active = 1
`);

const stmtGetRoomInfo = db.prepare(`
  SELECT floor_number, room_type, capacity, description,
         splat_count, train_time, image_count, splat_type,
         psnr, ssim
  FROM room_info
  WHERE scene_id = ?
`);

const stmtGetPhotos = db.prepare(`
  SELECT photo_url
  FROM photo_refs
  WHERE scene_id = ?
  ORDER BY display_order ASC
`);

// GET /api/scenes
router.get('/', (req, res) => {
  const scenes = stmtListScenes.all();
  res.json(scenes);
});

// GET /api/scenes/:id
router.get('/:id', (req, res) => {
  const scene = stmtGetScene.get(req.params.id);
  if (!scene) {
    return res.status(404).json({ error: 'Scene not found' });
  }

  const hotspots = stmtGetHotspots.all(scene.id);
  const roomInfo = stmtGetRoomInfo.get(scene.id) || null;

  res.json({
    id: scene.id,
    label: scene.label,
    file_url: scene.file_url,
    back_to: scene.back_to,
    cam_pos: { x: scene.cam_pos_x, y: scene.cam_pos_y, z: scene.cam_pos_z },
    cam_rot: { x: scene.cam_rot_x, y: scene.cam_rot_y, z: scene.cam_rot_z },
    cam_yaw:   scene.cam_yaw   ?? Math.PI,
    cam_pitch: scene.cam_pitch ?? 0,
    floor_map: scene.floor_map ?? null,
    display_order: scene.display_order,
    hotspots,
    room_info: roomInfo,
  });
});

// GET /api/scenes/:id/photos
router.get('/:id/photos', (req, res) => {
  const scene = stmtGetScene.get(req.params.id);
  if (!scene) {
    return res.status(404).json({ error: 'Scene not found' });
  }
  const photos = stmtGetPhotos.all(req.params.id);
  res.json(photos);
});

module.exports = router;
