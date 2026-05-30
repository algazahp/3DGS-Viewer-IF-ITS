const db = require('../database');

const count = db.prepare('SELECT COUNT(*) as c FROM scenes').get();

if (count.c === 0) {
  console.log('Database kosong, menjalankan seed...');
  require('./seed-production');
} else {
  console.log(`Database sudah ada ${count.c} scenes.`);
}
