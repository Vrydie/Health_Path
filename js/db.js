// health-path-api/db.js
const { Pool } = require('pg');

// Usamos la URL que obtuviste de Render
const connectionString = 'postgresql://healthpath_db_user:RZlOkACAx3Rx2DEuBMarbua3cqHHNtex@dpg-d7t9inl7vvec73ff6eeg-a.oregon-postgres.render.com/healthpath_db?ssl=true';

const pool = new Pool({
  connectionString: connectionString,
});

module.exports = pool;