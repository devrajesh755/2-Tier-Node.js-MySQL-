// src/models/init.js — Creates DB schema on first run
require("dotenv").config();
const mysql = require("mysql2/promise");

async function init() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });

  const db = process.env.DB_NAME || "twotier_db";

  await conn.execute(`CREATE DATABASE IF NOT EXISTS \`${db}\``);
  await conn.execute(`USE \`${db}\``);

  // Users table
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id          INT AUTO_INCREMENT PRIMARY KEY,
      name        VARCHAR(100) NOT NULL,
      email       VARCHAR(150) NOT NULL UNIQUE,
      password    VARCHAR(255) NOT NULL,
      role        ENUM('admin','user') DEFAULT 'user',
      created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tasks / Notes table
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS tasks (
      id          INT AUTO_INCREMENT PRIMARY KEY,
      user_id     INT NOT NULL,
      title       VARCHAR(255) NOT NULL,
      description TEXT,
      status      ENUM('todo','in_progress','done') DEFAULT 'todo',
      created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  console.log("✅  Database & tables initialized successfully");
  await conn.end();
}

init().catch((err) => {
  console.error("❌  Init failed:", err.message);
  process.exit(1);
});
