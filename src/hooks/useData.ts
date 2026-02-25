import { useState, useEffect } from 'react';
import { Term, Category, Report } from '../types';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        setCategories(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return { categories, loading };
}

export function useTerms(categoryId?: number | string, search?: string) {
  const [terms, setTerms] = useState<Term[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams();
    if (categoryId) params.append('category_id', categoryId.toString());
    if (search) params.append('search', search);

    fetch(`/api/terms?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        setTerms(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [categoryId, search]);

  const toggleHard = async (id: number, isHard: boolean) => {
    try {
      await fetch(`/api/terms/${id}/toggle-hard`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_hard: isHard }),
      });
      setTerms(prev => prev.map(t => t.id === id ? { ...t, is_hard: isHard ? 1 : 0 } : t));
    } catch (err) {
      console.error(err);
    }
  };

  return { terms, loading, toggleHard, setTerms };
}
