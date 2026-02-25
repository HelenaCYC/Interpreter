import { useState, useEffect } from 'react';
import { Term, Category } from '../types';
import { supabase } from '../db/database';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('categories')
      .select('*')
      .order('name')
      .then(({ data, error }) => {
        if (!error && data) setCategories(data);
        setLoading(false);
      });
  }, []);

  return { categories, loading };
}

export function useTerms(categoryId?: number | string, search?: string) {
  const [terms, setTerms] = useState<Term[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let query = supabase
      .from('terms')
      .select('*, category_name:categories(name)');

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    if (search) {
      query = query.or(`english.ilike.%${search}%,cantonese.ilike.%${search}%`);
    }

    query.then(({ data, error }) => {
      if (!error && data) {
        const formatted = data.map((term: any) => ({
          ...term,
          category_name: term.category_name?.name || null,
        }));
        setTerms(formatted);
      }
      setLoading(false);
    });
  }, [categoryId, search]);

  const toggleHard = async (id: number, isHard: boolean) => {
    try {
      const { error } = await supabase
        .from('terms')
        .update({ is_hard: isHard })
        .eq('id', id);

      if (!error) {
        setTerms(prev => prev.map(t => t.id === id ? { ...t, is_hard: isHard ? 1 : 0 } : t));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return { terms, loading, toggleHard, setTerms };
}
