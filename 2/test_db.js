const pool = require('./js/db');

async function test() {
    try {
        const res = await pool.query("SELECT column_name, is_nullable, column_default FROM information_schema.columns WHERE table_name = 'usuarios'");
        console.log("Columns:", res.rows);
    } catch(e) {
        console.error("DB Error:", e.message);
    } finally {
        pool.end();
    }
}
test();
