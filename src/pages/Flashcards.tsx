import { useState, useEffect } from 'react';
import { useTerms } from '../hooks/useData';
import { motion, AnimatePresence } from 'motion/react';
import { Star, ArrowRight, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { Term } from '../types';

export default function Flashcards() {
  const { terms, loading, toggleHard } = useTerms();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [studySet, setStudySet] = useState<Term[]>([]);

  useEffect(() => {
    if (terms.length > 0) {
      // Shuffle terms for study set
      const shuffled = [...terms].sort(() => Math.random() - 0.5);
      setStudySet(shuffled);
    }
  }, [terms]);

  const handleNext = () => {
    setShowAnswer(false);
    // Small delay to allow exit animation if we were animating the container
    setCurrentIndex((prev) => (prev + 1) % studySet.length);
  };

  const handleHard = (term: Term) => {
    toggleHard(term.id, !term.is_hard);
    const updatedSet = [...studySet];
    updatedSet[currentIndex] = { ...term, is_hard: term.is_hard ? 0 : 1 };
    setStudySet(updatedSet);
  };

  if (loading) return <div className="p-8 text-center">Loading flashcards...</div>;
  if (studySet.length === 0) return <div className="p-8 text-center">No terms available.</div>;

  const currentTerm = studySet[currentIndex];

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-8 px-4">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-slate-800">Study Mode</h1>
        <p className="text-slate-500">Card {currentIndex + 1} of {studySet.length}</p>
      </div>

      <div className="relative h-[400px] w-full">
        <AnimatePresence mode="wait">
          {!showAnswer ? (
            <motion.div
              key="question"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-white rounded-2xl shadow-xl border border-slate-100 flex flex-col items-center justify-center p-8 text-center cursor-pointer hover:shadow-2xl transition-shadow"
              onClick={() => setShowAnswer(true)}
            >
              <span className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">English</span>
              <h3 className="text-4xl font-bold text-slate-800">{currentTerm.english}</h3>
              
              <div className="mt-8 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs">
                {currentTerm.category_name}
              </div>
              
              <div className="absolute bottom-8 flex items-center gap-2 text-blue-500 text-sm font-medium animate-bounce">
                Tap to reveal <ArrowRight size={16} />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="answer"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-blue-600 rounded-2xl shadow-xl flex flex-col items-center justify-center p-8 text-center text-white"
            >
              <span className="text-sm font-medium text-blue-200 uppercase tracking-wider mb-2">Cantonese</span>
              <h3 className="text-5xl font-bold mb-2">{currentTerm.cantonese}</h3>
              <p className="text-xl font-mono text-blue-200 mb-8">{currentTerm.pronunciation}</p>
              
              <div className="bg-white/10 rounded-xl p-6 w-full backdrop-blur-sm">
                <p className="text-sm text-blue-100 mb-2 uppercase tracking-wider">Example</p>
                <p className="text-xl font-medium mb-2">{currentTerm.example_cantonese}</p>
                <p className="text-sm text-blue-200 italic">{currentTerm.example_english}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => handleHard(currentTerm)}
          className={cn(
            "flex flex-col items-center gap-1 p-4 rounded-xl transition-all w-24",
            currentTerm.is_hard 
              ? "bg-yellow-100 text-yellow-700 ring-2 ring-yellow-400" 
              : "bg-white border hover:bg-slate-50 text-slate-600"
          )}
        >
          <Star className={cn("w-6 h-6", currentTerm.is_hard && "fill-yellow-500")} />
          <span className="text-xs font-medium">Hard</span>
        </button>

        <button
          onClick={handleNext}
          className="flex-1 bg-slate-800 text-white h-full p-4 rounded-xl font-bold text-lg hover:bg-slate-900 transition-colors shadow-lg flex items-center justify-center gap-2"
        >
          Next Card <ChevronRight />
        </button>
      </div>
    </div>
  );
}
