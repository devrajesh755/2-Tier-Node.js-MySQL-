// src/controllers/authController.js
const bcrypt = require("bcryptjs");
const db = require("../models/db");

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: "All fields are required" });

    const [existing] = await db.execute("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length > 0)
      return res.status(409).json({ error: "Email already registered" });

    const hash = await bcrypt.hash(password, 10);
    const [result] = await db.execute(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hash]
    );

    req.session.userId = result.insertId;
    req.session.userName = name;

    res.status(201).json({ message: "Registered successfully", user: { id: result.insertId, name, email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Email and password required" });

    const [rows] = await db.execute("SELECT * FROM users WHERE email = ?", [email]);
    if (rows.length === 0)
      return res.status(401).json({ error: "Invalid credentials" });

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Invalid credentials" });

    req.session.userId = user.id;
    req.session.userName = user.name;

    res.json({ message: "Login successful", user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/auth/logout
exports.logout = (req, res) => {
  req.session.destroy(() => res.json({ message: "Logged out" }));
};

// GET /api/auth/me
exports.me = async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: "Not authenticated" });
  const [rows] = await db.execute("SELECT id, name, email, role, created_at FROM users WHERE id = ?", [req.session.userId]);
  if (rows.length === 0) return res.status(404).json({ error: "User not found" });
  res.json(rows[0]);
};
