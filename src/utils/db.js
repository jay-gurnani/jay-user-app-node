import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.PG_URI,
});

async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      user_id TEXT PRIMARY KEY,
      name TEXT,
      gender TEXT,
      height TEXT,
      bio TEXT,
      dob TEXT
    )
  `);
}

await initDB();

const db = {
  query: pool.query.bind(pool),

  async getProfile(userId) {
    const result = await pool.query('SELECT * FROM users WHERE user_id = $1', [userId]);
    return result.rows[0];
  },
  
  async saveOrUpdateProfile(profile) {
    const { user_id, name, gender, height, bio, dob } = profile;

    return await pool.query(
      `
      INSERT INTO users (user_id, name, gender, height, bio, dob)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (user_id)
      DO UPDATE SET name = $2, gender = $3, height = $4, bio = $5, dob = $6
      `,
      [user_id, name, gender, height, bio, dob]
    );
  }
};

export default db;
