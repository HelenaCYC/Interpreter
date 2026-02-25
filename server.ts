import express from "express";
import { createServer as createViteServer } from "vite";
import db from "./src/db/database";
import path from "path";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  
  // Get all categories
  app.get("/api/categories", (req, res) => {
    try {
      const categories = db.prepare("SELECT * FROM categories").all();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  // Get terms (optional filter by category)
  app.get("/api/terms", (req, res) => {
    try {
      const { category_id, search } = req.query;
      let query = "SELECT t.*, c.name as category_name FROM terms t LEFT JOIN categories c ON t.category_id = c.id";
      const params: any[] = [];
      const conditions: string[] = [];

      if (category_id) {
        conditions.push("t.category_id = ?");
        params.push(category_id);
      }

      if (search) {
        conditions.push("(t.english LIKE ? OR t.cantonese LIKE ?)");
        params.push(`%${search}%`, `%${search}%`);
      }

      if (conditions.length > 0) {
        query += " WHERE " + conditions.join(" AND ");
      }

      const terms = db.prepare(query).all(...params);
      res.json(terms);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch terms" });
    }
  });

  // Add a new term
  app.post("/api/terms", (req, res) => {
    try {
      const { english, cantonese, pronunciation, category_id, example_english, example_cantonese, difficulty } = req.body;
      const stmt = db.prepare(`
        INSERT INTO terms (english, cantonese, pronunciation, category_id, example_english, example_cantonese, difficulty)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      const info = stmt.run(english, cantonese, pronunciation, category_id, example_english, example_cantonese, difficulty || 'Medium');
      res.json({ id: info.lastInsertRowid });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to add term" });
    }
  });

  // Toggle difficulty (mark as hard) - In a real app this would be user-specific
  app.post("/api/terms/:id/toggle-hard", (req, res) => {
    try {
      const { id } = req.params;
      const { is_hard } = req.body;
      const stmt = db.prepare("UPDATE terms SET is_hard = ? WHERE id = ?");
      stmt.run(is_hard ? 1 : 0, id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update term" });
    }
  });

  // Report an error
  app.post("/api/reports", (req, res) => {
    try {
      const { term_id, report_text } = req.body;
      const stmt = db.prepare("INSERT INTO reported_errors (term_id, report_text) VALUES (?, ?)");
      stmt.run(term_id, report_text);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to report error" });
    }
  });

  // Get reports
  app.get("/api/reports", (req, res) => {
    try {
      const reports = db.prepare(`
        SELECT r.*, t.english, t.cantonese 
        FROM reported_errors r 
        LEFT JOIN terms t ON r.term_id = t.id
        ORDER BY r.timestamp DESC
      `).all();
      res.json(reports);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch reports" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production: Serve static files
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve("dist/index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
