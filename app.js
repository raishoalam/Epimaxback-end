const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");

const app = express();
const port = 3000;

// Initialize PostgreSQL connection pool
const pool = new Pool({
  user: "your_postgres_user",
  host: "localhost",
  database: "your_database_name",
  password: "your_postgres_password",
  port: 5432,
});

app.use(bodyParser.json());

// GET all tasks
app.get("/api/tasks", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM tasks");
    res.json(rows);
  } catch (err) {
    console.error("Error retrieving tasks:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// POST new task
app.post("/api/tasks", async (req, res) => {
  const { title, description, priority } = req.body;
  const query =
    "INSERT INTO tasks (title, description, priority) VALUES ($1, $2, $3) RETURNING *";
  const values = [title, description, priority];

  try {
    const { rows } = await pool.query(query, values);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("Error creating task:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// PUT update task
app.put("/api/tasks/:id", async (req, res) => {
  const taskId = req.params.id;
  const { title, description, priority, status, assigned_to } = req.body;
  const query =
    "UPDATE tasks SET title = $1, description = $2, priority = $3, status = $4, assigned_to = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING *";
  const values = [title, description, priority, status, assigned_to, taskId];

  try {
    const { rows } = await pool.query(query, values);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error("Error updating task:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// DELETE task
app.delete("/api/tasks/:id", async (req, res) => {
  const taskId = req.params.id;
  const query = "DELETE FROM tasks WHERE id = $1";
  const values = [taskId];

  try {
    const result = await pool.query(query, values);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.status(204).send();
  } catch (err) {
    console.error("Error deleting task:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
