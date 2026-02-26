import { useState } from 'react';
import { useTerms, useCategories } from '../hooks/useData';
import { Link } from 'wouter';
import { ArrowLeft, BookOpen, Layers } from 'lucide-react';
import { cn } from '../lib/utils';

export default function CategoryView({ params }: { params: { id: string } }) {
  const { terms, loading } = useTerms(params.id);
  const { categories } = useCategories();
  const category = categories.find(c => c.id.toString() === params.id);
  const [viewMode, setViewMode] = useState<'list' | 'cards'>('list');

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/">
          <button className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{category?.name || 'Category'}</h1>
          <p className="text-slate-500">{terms.length} terms</p>
        </div>
      </div>

      <div className="flex gap-2 bg-slate-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setViewMode('list')}
          className={cn(
            "px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2",
            viewMode === 'list' ? "bg-white shadow-sm text-slate-800" : "text-slate-500 hover:text-slate-700"
          )}
        >
          <Layers size={16} /> List
        </button>
        <button
          onClick={() => setViewMode('cards')}
          className={cn(
            "px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2",
            viewMode === 'cards' ? "bg-white shadow-sm text-slate-800" : "text-slate-500 hover:text-slate-700"
          )}
        >
          <BookOpen size={16} /> Cards
        </button>
      </div>

      {viewMode === 'list' ? (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="p-4 font-semibold text-slate-700">English</th>
                <th className="p-4 font-semibold text-slate-700">Cantonese</th>
                <th className="p-4 font-semibold text-slate-700">Pronunciation</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {terms.map((term) => (
                <tr key={term.id} className="hover:bg-slate-50">
                  <td className="p-4 font-medium text-slate-900">{term.english}</td>
                  <td className="p-4 text-lg">{term.cantonese}</td>
                  <td className="p-4 font-mono text-slate-600">{term.pronunciation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {terms.map((term) => (
            <div key={term.id} className="bg-white p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-lg font-bold text-slate-800 mb-1">{term.english}</h3>
              <p className="text-2xl text-blue-600 mb-1">{term.cantonese}</p>
              <p className="text-sm font-mono text-slate-500">{term.pronunciation}</p>
              {term.example_cantonese && (
                <div className="mt-4 pt-4 border-t text-sm text-slate-600">
                  <p>{term.example_cantonese}</p>
                  <p className="text-xs text-slate-400 italic mt-1">{term.example_english}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
