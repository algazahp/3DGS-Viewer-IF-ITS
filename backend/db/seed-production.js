const fs = require('fs');
const path = require('path');

try {
  const envFile = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envFile)) {
    for (const line of fs.readFileSync(envFile, 'utf8').split(/\r?\n/)) {
      const m = line.match(/^([^#=\s][^=]*?)=(.*)$/);
      if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].trim();
    }
  }
} catch { /* .env opsional */ }

const db = require('../database');

const R2_URL = 'https://assets.ifsplat.my.id';
const baseUrl = R2_URL;

const scenes = [
  {
    id: 'exterior',
    label: 'Gedung Teknik Informatika ITS',
    file_url: `${baseUrl}/GedungTCv4Clear.sog`,
    back_to: null,
    cam_pos_x: -0.074, cam_pos_y: -1.213, cam_pos_z: -3.167,
    cam_rot_x: 0, cam_rot_y: 0, cam_rot_z: 0,
    cam_yaw: 2.9796, cam_pitch: -0.0140,
    floor_map: 'assets/minimapinformatika.webp',
    display_order: 1,
  },
  {
    id: 'kelas-if112',
    label: 'Ruang Kelas IF-112',
    file_url: `${baseUrl}/IF112_7MeiClear.sog`,
    back_to: 'exterior',
    cam_pos_x: 2.403, cam_pos_y: 0.240, cam_pos_z: 2.042,
    cam_rot_x: 0, cam_rot_y: 0, cam_rot_z: 0,
    cam_yaw: 2.9796, cam_pitch: -0.0140,
    floor_map: 'assets/DenahLantai1.webp',
    display_order: 11,
  },
  {
    id: 'plaza-supenno',
    label: 'Plaza Supenno',
    file_url: `${baseUrl}/PlazaSupenoClear.sog`,
    back_to: 'exterior',
    cam_pos_x: 1.804, cam_pos_y: -0.220, cam_pos_z: 0.303,
    cam_rot_x: 0, cam_rot_y: 0, cam_rot_z: 0,
    cam_yaw: 2.1196, cam_pitch: 0.0220,
    floor_map: 'assets/DenahLantai1.webp',
    display_order: 2,
  },
  {
    id: 'aula',
    label: 'Aula',
    file_url: `${baseUrl}/Aulav1.sog`,
    back_to: 'exterior',
    cam_pos_x: -0.857, cam_pos_y: 0.474, cam_pos_z: -0.141,
    cam_rot_x: 0, cam_rot_y: 0, cam_rot_z: 0,
    cam_yaw: 6.0416, cam_pitch: -0.0940,
    floor_map: 'assets/DenahLantai2.webp',
    display_order: 3,
  },
  {
    id: 'kelas-if107',
    label: 'Smart Classroom IF-107',
    file_url: `${baseUrl}/IF107SmartClassroom.sog`,
    back_to: 'exterior',
    cam_pos_x: 0.923, cam_pos_y: 0.263, cam_pos_z: 4.066,
    cam_rot_x: 0, cam_rot_y: 0, cam_rot_z: 0,
    cam_yaw: 5.9696, cam_pitch: -0.0380,
    floor_map: 'assets/DenahLantai1.webp',
    display_order: 13,
  },
  {
    id: 'lab-kcv',
    label: 'Lab KCV',
    file_url: `${baseUrl}/LabKCV.sog`,
    back_to: 'exterior',
    cam_pos_x: 1.193, cam_pos_y: 0.292, cam_pos_z: 1.254,
    cam_rot_x: 0, cam_rot_y: 0, cam_rot_z: 0,
    cam_yaw: 0.7076, cam_pitch: -0.0800,
    floor_map: 'assets/DenahLantai3.webp',
    display_order: 8,
  },
  {
    id: 'ruang-rapat',
    label: 'Ruang Rapat',
    file_url: `${baseUrl}/RuangRapat.sog`,
    back_to: 'exterior',
    cam_pos_x: -0.044, cam_pos_y: 0.120, cam_pos_z: 2.820,
    cam_rot_x: 0, cam_rot_y: 0, cam_rot_z: 0,
    cam_yaw: 0.1616, cam_pitch: -0.0200,
    floor_map: 'assets/DenahLantai2.webp',
    display_order: 4,
  },
  {
    id: 'ruang-sidang',
    label: 'Ruang Sidang',
    file_url: `${baseUrl}/RuangSidang.sog`,
    back_to: 'exterior',
    cam_pos_x: 5.140, cam_pos_y: 0.067, cam_pos_z: -0.964,
    cam_rot_x: 0, cam_rot_y: 0, cam_rot_z: 0,
    cam_yaw: 1.7656, cam_pitch: -0.0240,
    floor_map: 'assets/DenahLantai2.webp',
    display_order: 5,
  },
  {
    id: 'lounge',
    label: 'Lounge',
    file_url: `${baseUrl}/Lounge.sog`,
    back_to: 'exterior',
    cam_pos_x: -4.323, cam_pos_y: 0.152, cam_pos_z: 0.317,
    cam_rot_x: 0, cam_rot_y: 0, cam_rot_z: 0,
    cam_yaw: 4.4216, cam_pitch: -0.0660,
    floor_map: 'assets/DenahLantai2.webp',
    display_order: 6,
  },
  {
    id: 'ruang-dosen-if227',
    label: 'Ruang Dosen IF-227',
    file_url: `${baseUrl}/RuangDosenv1.sog`,
    back_to: 'exterior',
    cam_pos_x: -0.702, cam_pos_y: 0.534, cam_pos_z: -3.037,
    cam_rot_x: 0, cam_rot_y: 0, cam_rot_z: 0,
    cam_yaw: 4.4216, cam_pitch: -0.0660,
    floor_map: 'assets/DenahLantai2.webp',
    display_order: 7,
  },
  {
    id: 'lab-pascasarjana',
    label: 'Lab Pascasarjana',
    file_url: `${baseUrl}/LabPascasarjana.sog`,
    back_to: 'exterior',
    cam_pos_x: -0.980, cam_pos_y: -0.278, cam_pos_z: 5.010,
    cam_rot_x: 0, cam_rot_y: 0, cam_rot_z: 0,
    cam_yaw: 0.3016, cam_pitch: 0.0820,
    floor_map: 'assets/DenahLantai1.webp',
    display_order: 9,
  },
  {
    id: 'loby-pascasarjana',
    label: 'Loby Pascasarjana',
    file_url: `${baseUrl}/LobyPascasarjana.sog`,
    back_to: 'exterior',
    cam_pos_x: 2.851, cam_pos_y: 0.161, cam_pos_z: 4.158,
    cam_rot_x: 0, cam_rot_y: 0, cam_rot_z: 0,
    cam_yaw: 1.0676, cam_pitch: -0.0480,
    floor_map: 'assets/DenahLantai2.webp',
    display_order: 10,
  },
  {
    id: 'kelas-if105',
    label: 'Kelas IF-105',
    file_url: `${baseUrl}/IF105.sog`,
    back_to: 'exterior',
    cam_pos_x: 4.995, cam_pos_y: 0.513, cam_pos_z: 0.244,
    cam_rot_x: 0, cam_rot_y: 0, cam_rot_z: 0,
    cam_yaw: 1.4976, cam_pitch: -0.0640,
    floor_map: 'assets/DenahLantai1.webp',
    display_order: 12,
  },
];

const roomInfos = [
  {
    scene_id: 'exterior',
    floor_number: null, room_type: 'eksterior', capacity: null,
    description: 'Tampilan eksterior keseluruhan Gedung Teknik Informatika ITS',
    splat_count: '18.100.000', train_time: '64 jam 50 menit', image_count: 2800, splat_type: 'Splat3',
    psnr: 10.90, ssim: 0.3134,
  },
  {
    scene_id: 'kelas-if112',
    floor_number: 1, room_type: 'kelas', capacity: 40,
    description: 'Ruang kelas IF-112, lantai 1 Gedung Teknik Informatika ITS',
    splat_count: '5.000.000', train_time: '1 jam 16 menit', image_count: 700, splat_type: 'Splat MCMC',
    psnr: 12.28, ssim: 0.7075,
  },
  {
    scene_id: 'plaza-supenno',
    floor_number: null, room_type: 'plaza', capacity: null,
    description: 'Plaza Supenno, area terbuka di depan Gedung Teknik Informatika ITS',
    splat_count: '8.000.000', train_time: '53 menit 14 detik', image_count: 800, splat_type: 'Splat MCMC',
    psnr: 13.26, ssim: 0.6036,
  },
  {
    scene_id: 'aula',
    floor_number: null, room_type: 'aula', capacity: null,
    description: 'Aula Gedung Teknik Informatika ITS',
    splat_count: '8.000.0000', train_time: '1 Jam 26 Menit', image_count: '1000', splat_type: 'Splat MCMC',
    psnr: 13.61, ssim: 0.5230,
  },
  {
    scene_id: 'kelas-if107',
    floor_number: null, room_type: 'kelas', capacity: null,
    description: 'Smart Classroom IF-107, Gedung Teknik Informatika ITS',
    splat_count: '8.000.000', train_time: '1 Jam 47 Menit', image_count: '889', splat_type: 'Splat MCMC',
    psnr: 10.08, ssim: 0.5214,
  },
  {
    scene_id: 'lab-kcv',
    floor_number: null, room_type: 'lab', capacity: null,
    description: 'Lab KCV, Gedung Teknik Informatika ITS',
    splat_count: '8.000.000', train_time: '1 Jam 54 Menit', image_count: '800', splat_type: 'Splat3',
    psnr: 9.68, ssim: 0.5514,
  },
  {
    scene_id: 'ruang-rapat',
    floor_number: null, room_type: 'ruang-rapat', capacity: null,
    description: 'Ruang Rapat, Gedung Teknik Informatika ITS',
    splat_count: '5.000.000', train_time: '26 Menit 20 Detik', image_count: '500', splat_type: 'Splat MCMC',
    psnr: 10.80, ssim: 0.6521,
  },
  {
    scene_id: 'ruang-sidang',
    floor_number: null, room_type: 'ruang-sidang', capacity: null,
    description: 'Ruang Sidang, Gedung Teknik Informatika ITS',
    splat_count: '8.000.000', train_time: '58 Menit 51 Detik', image_count: '800', splat_type: 'Splat MCMC',
    psnr: 11.18, ssim: 0.5543,
  },
  {
    scene_id: 'lounge',
    floor_number: null, room_type: 'lounge', capacity: null,
    description: 'Lounge, Gedung Teknik Informatika ITS',
    splat_count: '8.000.000', train_time: '1 Jam 50 Menit', image_count: '1000', splat_type: 'Splat MCMC',
    psnr: 12.82, ssim: 0.6024,
  },
  {
    scene_id: 'ruang-dosen-if227',
    floor_number: null, room_type: 'ruang-dosen', capacity: null,
    description: 'Ruang Dosen IF-227, Gedung Teknik Informatika ITS',
    splat_count: '8.000.000', train_time: '34 Menit 9 Detik', image_count: '600', splat_type: 'Splat MCMC',
    psnr: 10.98, ssim: 0.6057,
  },
  {
    scene_id: 'lab-pascasarjana',
    floor_number: null, room_type: 'lab', capacity: null,
    description: 'Lab Pascasarjana, Gedung Teknik Informatika ITS',
    splat_count: '8.000.000', train_time: '52 Menit 44 Detik', image_count: '1000', splat_type: 'Splat MCMC',
    psnr: 11.48, ssim: 0.5936,
  },
  {
    scene_id: 'loby-pascasarjana',
    floor_number: null, room_type: 'lobby', capacity: null,
    description: 'Loby Pascasarjana, Gedung Teknik Informatika ITS',
    splat_count: '5.000.000', train_time: '1 Jam 10 Menit', image_count: '600', splat_type: 'Splat MCMC',
    psnr: 12.33, ssim: 0.6421,
  },
  {
    scene_id: 'kelas-if105',
    floor_number: null, room_type: 'kelas', capacity: null,
    description: 'Kelas IF-105, Gedung Teknik Informatika ITS',
    splat_count: '8.000.000', train_time: '54 Menit 18 Detik', image_count: '800', splat_type: 'Splat MCMC',
    psnr: 12.05, ssim: 0.5292,
  },
];

const photoRefs = [
  { scene_id: 'exterior', photo_url: 'assets/photos/exterior/foto1.jpg', display_order: 1 },
  { scene_id: 'exterior', photo_url: 'assets/photos/exterior/foto2.jpg', display_order: 2 },
  { scene_id: 'exterior', photo_url: 'assets/photos/exterior/foto3.jpg', display_order: 3 },
  { scene_id: 'kelas-if112', photo_url: 'assets/photos/kelas-if112/foto1.jpg', display_order: 1 },
  { scene_id: 'kelas-if112', photo_url: 'assets/photos/kelas-if112/foto2.jpg', display_order: 2 },
  { scene_id: 'plaza-supenno', photo_url: 'assets/photos/plaza-supenno/foto1.jpg', display_order: 1 },
  { scene_id: 'plaza-supenno', photo_url: 'assets/photos/plaza-supenno/foto2.jpg', display_order: 2 },
  { scene_id: 'aula', photo_url: 'assets/photos/aula/foto1.jpg', display_order: 1 },
  { scene_id: 'aula', photo_url: 'assets/photos/aula/foto2.jpg', display_order: 2 },
  { scene_id: 'kelas-if107', photo_url: 'assets/photos/kelas-if107/foto1.jpg', display_order: 1 },
  { scene_id: 'kelas-if107', photo_url: 'assets/photos/kelas-if107/foto2.jpg', display_order: 2 },
  { scene_id: 'lab-kcv', photo_url: 'assets/photos/lab-kcv/foto1.jpg', display_order: 1 },
  { scene_id: 'lab-kcv', photo_url: 'assets/photos/lab-kcv/foto2.jpg', display_order: 2 },
  { scene_id: 'ruang-rapat', photo_url: 'assets/photos/ruang-rapat/foto1.jpg', display_order: 1 },
  { scene_id: 'ruang-rapat', photo_url: 'assets/photos/ruang-rapat/foto2.jpg', display_order: 2 },
  { scene_id: 'ruang-sidang', photo_url: 'assets/photos/ruang-sidang/foto1.jpg', display_order: 1 },
  { scene_id: 'ruang-sidang', photo_url: 'assets/photos/ruang-sidang/foto2.jpg', display_order: 2 },
  { scene_id: 'lounge', photo_url: 'assets/photos/lounge/foto1.jpg', display_order: 1 },
  { scene_id: 'lounge', photo_url: 'assets/photos/lounge/foto2.jpg', display_order: 2 },
  { scene_id: 'ruang-dosen-if227', photo_url: 'assets/photos/ruang-dosen-if227/foto1.jpg', display_order: 1 },
  { scene_id: 'ruang-dosen-if227', photo_url: 'assets/photos/ruang-dosen-if227/foto2.jpg', display_order: 2 },
  { scene_id: 'lab-pascasarjana', photo_url: 'assets/photos/lab-pascasarjana/foto1.jpg', display_order: 1 },
  { scene_id: 'lab-pascasarjana', photo_url: 'assets/photos/lab-pascasarjana/foto2.jpg', display_order: 2 },
  { scene_id: 'loby-pascasarjana', photo_url: 'assets/photos/loby-pascasarjana/foto1.jpg', display_order: 1 },
  { scene_id: 'loby-pascasarjana', photo_url: 'assets/photos/loby-pascasarjana/foto2.jpg', display_order: 2 },
  { scene_id: 'kelas-if105', photo_url: 'assets/photos/kelas-if105/foto1.jpg', display_order: 1 },
  { scene_id: 'kelas-if105', photo_url: 'assets/photos/kelas-if105/foto2.jpg', display_order: 2 },
];

const hotspots = [
  { scene_id: 'exterior', label: 'Ruang Kelas IF-112', target_scene_id: 'kelas-if112', screen_x: 0.5088, screen_y: 0.5545 },
  { scene_id: 'exterior', label: 'Plaza Supenno', target_scene_id: 'plaza-supenno', screen_x: 0.5264, screen_y: 0.5926 },
];

const runSeed = db.transaction(() => {
  db.prepare('DELETE FROM photo_refs').run();
  db.prepare('DELETE FROM hotspots').run();
  db.prepare('DELETE FROM room_info').run();
  db.prepare('DELETE FROM scenes').run();

  const insertScene = db.prepare(`
    INSERT INTO scenes
      (id, label, file_url, back_to, cam_pos_x, cam_pos_y, cam_pos_z,
       cam_rot_x, cam_rot_y, cam_rot_z, cam_yaw, cam_pitch, floor_map, display_order)
    VALUES
      (@id, @label, @file_url, @back_to, @cam_pos_x, @cam_pos_y, @cam_pos_z,
       @cam_rot_x, @cam_rot_y, @cam_rot_z, @cam_yaw, @cam_pitch, @floor_map, @display_order)
  `);
  for (const s of scenes) insertScene.run(s);

  const insertRoomInfo = db.prepare(`
    INSERT INTO room_info
      (scene_id, floor_number, room_type, capacity, description,
       splat_count, train_time, image_count, splat_type, psnr, ssim)
    VALUES
      (@scene_id, @floor_number, @room_type, @capacity, @description,
       @splat_count, @train_time, @image_count, @splat_type, @psnr, @ssim)
  `);
  for (const r of roomInfos) insertRoomInfo.run(r);

  const insertHotspot = db.prepare(`
    INSERT INTO hotspots (scene_id, label, target_scene_id, screen_x, screen_y)
    VALUES (@scene_id, @label, @target_scene_id, @screen_x, @screen_y)
  `);
  for (const h of hotspots) insertHotspot.run(h);

  const insertPhotoRef = db.prepare(`
    INSERT INTO photo_refs (scene_id, photo_url, display_order)
    VALUES (@scene_id, @photo_url, @display_order)
  `);
  for (const p of photoRefs) insertPhotoRef.run(p);
});

runSeed();

console.log(`\nSeed production berhasil — R2: ${R2_URL}`);
console.log(`  ${scenes.length} scenes`);
console.log(`  ${roomInfos.length} room_info`);
console.log(`  ${hotspots.length} hotspots`);
console.log(`  ${photoRefs.length} photo_refs\n`);
