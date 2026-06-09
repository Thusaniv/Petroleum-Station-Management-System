const mysql = require("mysql2/promise");
require("dotenv").config(); // Make sure .env is loaded

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306, // 👈 Add this line
  waitForConnections: true,
  connectionLimit: 10,
});

module.exports = pool;
