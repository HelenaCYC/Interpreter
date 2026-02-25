import { useState } from 'react';
import React from 'react';
import { useTerms, useCategories } from '../hooks/useData';
import { supabase } from '../db/database';
import { Search, AlertTriangle, Plus, X } from 'lucide-react';
import { Term } from '../types';

export default function Glossary() {
  const [search, setSearch] = useState('');
  const { terms, loading, setTerms } = useTerms(undefined, search);
  const { categories } = useCategories();
  const [reportingTerm, setReportingTerm] = useState<Term | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const handleReport = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!reportingTerm) return;

    const formData = new FormData(e.currentTarget);
    const text = formData.get('report_text');

    await supabase
      .from('reported_errors')
      .insert({ term_id: reportingTerm.id, report_text: text });

    setReportingTerm(null);
    alert('Report submitted. Thank you!');
  };

  const handleAddTerm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);

    try {
      const { data: newData, error } = await supabase
        .from('terms')
        .insert({
          english: data.english,
          cantonese: data.cantonese,
          pronunciation: data.pronunciation,
          category_id: data.category_id,
          example_english: data.example_english,
          example_cantonese: data.example_cantonese,
          difficulty: data.difficulty || 'Medium',
        })
        .select('id')
        .single();

      if (!error && newData) {
        const categoryName = categories.find(c => c.id.toString() === data.category_id)?.name;
        const newTerm: any = { ...data, id: newData.id, category_name: categoryName, is_hard: 0 };
        setTerms(prev => [newTerm, ...prev]);
        setIsAdding(false);
        alert('Term added successfully!');
      } else {
        alert('Failed to add term.');
      }
    } catch (err) {
      console.error(err);
      alert('Error submitting form.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Glossary</h2>
          <p className="text-slate-500">Search and browse all medical terms</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search English or Cantonese..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            onClick={() => setIsAdding(true)}
            className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 px-4"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden md:inline">Add Term</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading terms...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="p-4 font-semibold text-slate-700">English</th>
                  <th className="p-4 font-semibold text-slate-700">Cantonese</th>
                  <th className="p-4 font-semibold text-slate-700">Pronunciation</th>
                  <th className="p-4 font-semibold text-slate-700">Category</th>
                  <th className="p-4 font-semibold text-slate-700">Example</th>
                  <th className="p-4 font-semibold text-slate-700 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {terms.map((term) => (
                  <tr key={term.id} className="hover:bg-slate-50">
                    <td className="p-4 font-medium text-slate-900">{term.english}</td>
                    <td className="p-4 text-lg">{term.cantonese}</td>
                    <td className="p-4 font-mono text-slate-600">{term.pronunciation}</td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {term.category_name}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600 max-w-xs truncate" title={term.example_english + '\n' + term.example_cantonese}>
                      {term.example_cantonese}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setReportingTerm(term)}
                        className="text-slate-400 hover:text-red-500 transition-colors"
                        title="Report Error"
                      >
                        <AlertTriangle className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {terms.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      No terms found matching "{search}"
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isAdding && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">Add New Term</h3>
              <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAddTerm} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">English Term</label>
                  <input name="english" required className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Hypertension" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Cantonese Translation</label>
                  <input name="cantonese" required className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. 高血壓" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Pronunciation (Jyutping)</label>
                  <input name="pronunciation" className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. gou1 hyut3 aat3" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                  <select name="category_id" required className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none">
                    <option value="">Select Category</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Example Sentence (English)</label>
                <input name="example_english" className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Your blood pressure is high." />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Example Sentence (Cantonese)</label>
                <input name="example_cantonese" className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. 你嘅血壓好高。" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Difficulty</label>
                <select name="difficulty" className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none">
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Add Term
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {reportingTerm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-bold mb-4">Report Issue</h3>
            <p className="text-sm text-slate-600 mb-4">
              Reporting issue for: <strong>{reportingTerm.english}</strong>
            </p>
            <form onSubmit={handleReport}>
              <textarea
                name="report_text"
                required
                className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none min-h-[100px]"
                placeholder="What is incorrect? Please provide the correct translation if possible."
              ></textarea>
              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setReportingTerm(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
