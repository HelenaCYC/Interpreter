export interface Category {
  id: number;
  name: string;
  parent_category_id?: number;
}

export interface Term {
  id: number;
  english: string;
  cantonese: string;
  pronunciation: string;
  category_id: number;
  category_name?: string;
  example_english: string;
  example_cantonese: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  is_hard: number; // 0 or 1
  audio_url?: string;
  photo_url?: string;
}

export interface Report {
  id: number;
  term_id: number;
  english: string;
  cantonese: string;
  report_text: string;
  timestamp: string;
}
