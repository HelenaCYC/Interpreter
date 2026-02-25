import { useState, useEffect } from 'react';
import React from 'react';
import { useCategories } from '../hooks/useData';
import { supabase } from '../db/database';
import { Report } from '../types';

export default function Admin() {
  const { categories } = useCategories();
  const [reports, setReports] = useState<Report[]>([]);
  const [activeTab, setActiveTab] = useState<'add' | 'reports'>('add');

  useEffect(() => {
    if (activeTab === 'reports') {
      supabase
        .from('reported_errors')
        .select(`*, terms (english, cantonese)`)
        .order('timestamp', { ascending: false })
        .then(({ data, error }) => {
          if (!error && data) {
            const formatted = data.map((report: any) => ({
              ...report,
              english: report.terms?.english,
              cantonese: report.terms?.cantonese,
            }));
            setReports(formatted);
          }
        });
    }
  }, [activeTab]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);

    try {
      const { error } = await supabase
        .from('terms')
        .insert({
          english: data.english,
          cantonese: data.cantonese,
          pronunciation: data.pronunciation,
          category_id: data.category_id,
          example_english: data.example_english,
          example_cantonese: data.example_cantonese,
          difficulty: data.difficulty || 'Medium',
        });

      if (!error) {
        alert('Term added successfully!');
        (e.target as HTMLFormElement).reset();
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
      <h2 className="text-2xl font-bold text-slate-800">Admin Panel</h2>

      <div className="flex gap-4 border-b">
        <button
          onClick={() => setActiveTab('add')}
          className={`pb-3 px-4 font-medium ${activeTab === 'add' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500'}`}
        >
          Add New Term
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`pb-3 px-4 font-medium ${activeTab === 'reports' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500'}`}
        >
          User Reports
        </button>
      </div>

      {activeTab === 'add' && (
        <div className="bg-white p-6 rounded-xl shadow-sm border max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">English Term</label>
                <input name="english" required className="w-full border rounded-lg p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Cantonese Translation</label>
                <input name="cantonese" required className="w-full border rounded-lg p-2" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Pronunciation (Jyutping)</label>
                <input name="pronunciation" className="w-full border rounded-lg p-2" placeholder="e.g. niu4 hau4" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <select name="category_id" required className="w-full border rounded-lg p-2">
                  <option value="">Select Category</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Example Sentence (English)</label>
              <input name="example_english" className="w-full border rounded-lg p-2" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Example Sentence (Cantonese)</label>
              <input name="example_cantonese" className="w-full border rounded-lg p-2" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Difficulty</label>
              <select name="difficulty" className="w-full border rounded-lg p-2">
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700">
              Add Term
            </button>
          </form>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="p-4">Term</th>
                <th className="p-4">Current Translation</th>
                <th className="p-4">Report Issue</th>
                <th className="p-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {reports.map((report) => (
                <tr key={report.id}>
                  <td className="p-4 font-medium">{report.english}</td>
                  <td className="p-4">{report.cantonese}</td>
                  <td className="p-4 text-red-600">{report.report_text}</td>
                  <td className="p-4 text-slate-500">{new Date(report.timestamp).toLocaleDateString()}</td>
                </tr>
              ))}
              {reports.length === 0 && (
                <tr><td colSpan={4} className="p-8 text-center text-slate-500">No reports found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
