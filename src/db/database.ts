import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Ensure the directory exists
const dbDir = path.resolve('data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir);
}

const db = new Database(path.join(dbDir, 'medical.db'));

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    parent_category_id INTEGER
  );

  CREATE TABLE IF NOT EXISTS terms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    english TEXT NOT NULL,
    cantonese TEXT NOT NULL,
    pronunciation TEXT,
    category_id INTEGER,
    example_english TEXT,
    example_cantonese TEXT,
    difficulty TEXT DEFAULT 'Medium',
    is_hard INTEGER DEFAULT 0,
    audio_url TEXT,
    photo_url TEXT,
    FOREIGN KEY(category_id) REFERENCES categories(id)
  );

  CREATE TABLE IF NOT EXISTS reported_errors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    term_id INTEGER,
    user_id TEXT,
    report_text TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(term_id) REFERENCES terms(id)
  );
`);

// Seed Data
const checkTerms = db.prepare("SELECT count(*) as count FROM terms").get() as { count: number };

if (checkTerms.count === 0) {
  console.log("Seeding database from CSV...");
  const csvPath = path.join(dbDir, 'terms.csv');
  
  if (fs.existsSync(csvPath)) {
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvContent.split('\n').filter(line => line.trim() !== '');
    
    // Skip header
    const dataLines = lines.slice(1);
    
    const insertCat = db.prepare("INSERT INTO categories (name) VALUES (?)");
    const getCat = db.prepare("SELECT id FROM categories WHERE name = ?");
    const insertTerm = db.prepare(`
      INSERT INTO terms (english, cantonese, pronunciation, category_id, example_english, example_cantonese, difficulty)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    // Helper to parse CSV line respecting quotes
    const parseCSVLine = (line: string) => {
      const result = [];
      let current = '';
      let inQuote = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuote = !inQuote;
        } else if (char === ',' && !inQuote) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };

    const catMap = new Map();
    
    // Category Mapping
    const categoryMapping: Record<string, string> = {
      "Medical Terms": "Medical Terms",
      "Treatments & Tests": "Treatments & Tests",
      "Anatomy": "Anatomy",
      "Medications": "Medications",
      "Diseases & Medical Conditions": "Diseases & Medical Conditions",
      "Medical Professionals (Specialists)": "Medical Professionals (Specialists)",
      "Credit & Debt": "Bank",
      "Car Parts & Types": "Car Parts & Types",
      "Road Signs & Infrastructure": "Car Parts & Types",
      "Driving Actions & Violations": "Car Parts & Types",
      "Accidents & Legal": "Car Parts & Types",
      "Administrative & Legal (General)": "Administrative & Legal (General)",
      "Social & Gender Identity": "Social & Gender Identity",
      "Workplace & Benefits": "Workplace & Benefits"
    };

    let currentCategory = "General";

    db.transaction(() => {
      dataLines.forEach(line => {
        const cols = parseCSVLine(line);
        if (cols.length < 2) return;

        // Check if this is a header line (Section detection)
        // Header lines usually have "English" or "Cantonese" in the second column
        if (cols[1].includes("English") || cols[1].includes("Cantonese") || cols[2].includes("Cantonese")) {
          const sectionName = cols[0].trim();
          if (categoryMapping[sectionName]) {
            currentCategory = categoryMapping[sectionName];
          } else if (sectionName) {
             // Fallback if not in mapping but looks like a header
             currentCategory = sectionName;
          }
          return; // Skip the header line itself
        }
        
        // Skip empty data lines
        if (!cols[1] && !cols[2]) return;

        const english = cols[1];
        const cantonese = cols[2];
        const pronunciation = cols[3];
        const exampleFull = cols[4]; 

        // Extract English and Cantonese from Example
        let example_cantonese = '';
        let example_english = '';
        
        if (exampleFull) {
          const match = exampleFull.match(/(.*?) \((.*?)\)/);
          if (match) {
            example_cantonese = match[1];
            example_english = match[2];
          } else {
            example_cantonese = exampleFull;
          }
        }

        // Get or Create Category ID
        let catId = catMap.get(currentCategory);
        if (!catId) {
          const existing = getCat.get(currentCategory) as { id: number } | undefined;
          if (existing) {
            catId = existing.id;
          } else {
            const info = insertCat.run(currentCategory);
            catId = info.lastInsertRowid;
          }
          catMap.set(currentCategory, catId);
        }

        insertTerm.run(
          english,
          cantonese,
          pronunciation,
          catId,
          example_english,
          example_cantonese,
          'Medium'
        );
      });
    })();
    console.log("Seeding complete.");
  }
}

export default db;
