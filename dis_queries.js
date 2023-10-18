import pg from "pg";
const { Pool } = pg;
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "db_movies",
  password: "Beauty6969",
  port: 5432,
});

export default pool;
