import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables. Check .env file.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedDatabase() {
  console.log('Checking if database needs seeding...');

  const { count, error: checkError } = await supabase
    .from('terms')
    .select('*', { count: 'exact', head: true });

  if (checkError) {
    console.error('Error checking existing terms:', checkError);
    return;
  }

  if (count !== null && count > 0) {
    console.log(`Database already has ${count} terms. Skipping seed.`);
    return;
  }

  console.log('Seeding database from CSV...');

  const csvPath = path.join(process.cwd(), 'data', 'terms.csv');

  if (!fs.existsSync(csvPath)) {
    console.error('CSV file not found at:', csvPath);
    return;
  }

  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const lines = csvContent.split('\n').filter(line => line.trim() !== '');

  const dataLines = lines.slice(1);

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

  const catMap = new Map<string, number>();
  let currentCategory = "General";

  const termsToInsert: any[] = [];

  for (const line of dataLines) {
    const cols = parseCSVLine(line);
    if (cols.length < 2) continue;

    if (cols[1].includes("English") || cols[1].includes("Cantonese") || cols[2].includes("Cantonese")) {
      const sectionName = cols[0].trim();
      if (categoryMapping[sectionName]) {
        currentCategory = categoryMapping[sectionName];
      } else if (sectionName) {
        currentCategory = sectionName;
      }
      continue;
    }

    if (!cols[1] && !cols[2]) continue;

    const english = cols[1];
    const cantonese = cols[2];
    const pronunciation = cols[3];
    const exampleFull = cols[4];

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

    let catId = catMap.get(currentCategory);
    if (!catId) {
      const { data: existing } = await supabase
        .from('categories')
        .select('id')
        .eq('name', currentCategory)
        .maybeSingle();

      if (existing) {
        catId = existing.id;
      } else {
        const { data: newCat, error: insertError } = await supabase
          .from('categories')
          .insert({ name: currentCategory })
          .select('id')
          .single();

        if (insertError) {
          console.error('Error inserting category:', insertError);
          throw insertError;
        }

        catId = newCat.id;
      }
      catMap.set(currentCategory, catId);
    }

    termsToInsert.push({
      english,
      cantonese,
      pronunciation,
      category_id: catId,
      example_english,
      example_cantonese,
      difficulty: 'Medium'
    });
  }

  if (termsToInsert.length > 0) {
    const { error } = await supabase
      .from('terms')
      .insert(termsToInsert);

    if (error) {
      console.error('Error inserting terms:', error);
    } else {
      console.log(`Successfully seeded ${termsToInsert.length} terms.`);
    }
  }
}

seedDatabase().catch(console.error);
