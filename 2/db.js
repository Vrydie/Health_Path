// health-path-api/db.js
const { Pool } = require('pg');

// Usamos la variable de entorno DATABASE_URL en producción, o la URL directa en local
const connectionString = process.env.DATABASE_URL || 'postgresql://healthpath_db_user:RZlOkACAx3Rx2DEuBMarbua3cqHHNtex@dpg-d7t9inl7vvec73ff6eeg-a.oregon-postgres.render.com/healthpath_db?ssl=true';

const pool = new Pool({
  connectionString: connectionString,
});

module.exports = pool;