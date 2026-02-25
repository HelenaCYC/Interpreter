import express from "express";
import { createServer as createViteServer } from "vite";
import { supabase } from "./src/db/database";
import path from "path";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes

  // Get all categories
  app.get("/api/categories", async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      res.json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  // Get terms (optional filter by category)
  app.get("/api/terms", async (req, res) => {
    try {
      const { category_id, search } = req.query;

      let query = supabase
        .from('terms')
        .select('*, category_name:categories(name)');

      if (category_id) {
        query = query.eq('category_id', category_id);
      }

      if (search) {
        query = query.or(`english.ilike.%${search}%,cantonese.ilike.%${search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      const formatted = data.map(term => ({
        ...term,
        category_name: term.category_name?.name || null
      }));

      res.json(formatted);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch terms" });
    }
  });

  // Add a new term
  app.post("/api/terms", async (req, res) => {
    try {
      const { english, cantonese, pronunciation, category_id, example_english, example_cantonese, difficulty } = req.body;

      const { data, error } = await supabase
        .from('terms')
        .insert({
          english,
          cantonese,
          pronunciation,
          category_id,
          example_english,
          example_cantonese,
          difficulty: difficulty || 'Medium'
        })
        .select('id')
        .single();

      if (error) throw error;
      res.json({ id: data.id });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to add term" });
    }
  });

  // Toggle difficulty (mark as hard)
  app.post("/api/terms/:id/toggle-hard", async (req, res) => {
    try {
      const { id } = req.params;
      const { is_hard } = req.body;

      const { error } = await supabase
        .from('terms')
        .update({ is_hard })
        .eq('id', id);

      if (error) throw error;
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to update term" });
    }
  });

  // Report an error
  app.post("/api/reports", async (req, res) => {
    try {
      const { term_id, report_text } = req.body;

      const { error } = await supabase
        .from('reported_errors')
        .insert({ term_id, report_text });

      if (error) throw error;
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to report error" });
    }
  });

  // Get reports
  app.get("/api/reports", async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('reported_errors')
        .select(`
          *,
          terms (
            english,
            cantonese
          )
        `)
        .order('timestamp', { ascending: false });

      if (error) throw error;

      const formatted = data.map(report => ({
        ...report,
        english: report.terms?.english,
        cantonese: report.terms?.cantonese
      }));

      res.json(formatted);
    } catch (error) {
      console.error(error);
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
