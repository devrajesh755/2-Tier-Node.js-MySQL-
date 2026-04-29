// src/controllers/taskController.js
const db = require("../models/db");

// GET /api/tasks
exports.getAll = async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC",
      [req.session.userId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/tasks/:id
exports.getOne = async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT * FROM tasks WHERE id = ? AND user_id = ?",
      [req.params.id, req.session.userId]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Task not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/tasks
exports.create = async (req, res) => {
  try {
    const { title, description, status } = req.body;
    if (!title) return res.status(400).json({ error: "Title is required" });

    const [result] = await db.execute(
      "INSERT INTO tasks (user_id, title, description, status) VALUES (?, ?, ?, ?)",
      [req.session.userId, title, description || null, status || "todo"]
    );

    const [rows] = await db.execute("SELECT * FROM tasks WHERE id = ?", [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/tasks/:id
exports.update = async (req, res) => {
  try {
    const { title, description, status } = req.body;
    const [existing] = await db.execute(
      "SELECT id FROM tasks WHERE id = ? AND user_id = ?",
      [req.params.id, req.session.userId]
    );
    if (existing.length === 0) return res.status(404).json({ error: "Task not found" });

    await db.execute(
      "UPDATE tasks SET title = ?, description = ?, status = ? WHERE id = ?",
      [title, description, status, req.params.id]
    );

    const [rows] = await db.execute("SELECT * FROM tasks WHERE id = ?", [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/tasks/:id
exports.remove = async (req, res) => {
  try {
    const [existing] = await db.execute(
      "SELECT id FROM tasks WHERE id = ? AND user_id = ?",
      [req.params.id, req.session.userId]
    );
    if (existing.length === 0) return res.status(404).json({ error: "Task not found" });

    await db.execute("DELETE FROM tasks WHERE id = ?", [req.params.id]);
    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
