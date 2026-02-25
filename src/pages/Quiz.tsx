import { useState, useEffect } from 'react';
import { useTerms } from '../hooks/useData';
import { Term } from '../types';
import { CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Quiz() {
  const { terms, loading } = useTerms();
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  useEffect(() => {
    if (terms.length >= 4) {
      generateQuiz();
    }
  }, [terms]);

  const generateQuiz = () => {
    const shuffled = [...terms].sort(() => Math.random() - 0.5).slice(0, 5);
    const quizData = shuffled.map(term => {
      // Get 3 random distractors
      const distractors = terms
        .filter(t => t.id !== term.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map(t => t.cantonese);
      
      const options = [...distractors, term.cantonese].sort(() => Math.random() - 0.5);
      
      return {
        term,
        options,
        correct: term.cantonese
      };
    });
    setQuestions(quizData);
    setCurrentQ(0);
    setScore(0);
    setShowResult(false);
    setSelectedAnswer(null);
    setIsCorrect(null);
  };

  const handleAnswer = (answer: string) => {
    if (selectedAnswer) return; // Prevent multiple clicks
    
    setSelectedAnswer(answer);
    const correct = answer === questions[currentQ].correct;
    setIsCorrect(correct);
    
    if (correct) setScore(s => s + 1);

    setTimeout(() => {
      if (currentQ < questions.length - 1) {
        setCurrentQ(c => c + 1);
        setSelectedAnswer(null);
        setIsCorrect(null);
      } else {
        setShowResult(true);
      }
    }, 1500);
  };

  if (loading) return <div className="p-8 text-center">Loading quiz...</div>;
  if (terms.length < 4) return <div className="p-8 text-center">Not enough terms to generate a quiz.</div>;
  if (questions.length === 0) return <div className="p-8 text-center">Generating quiz...</div>;

  if (showResult) {
    return (
      <div className="max-w-md mx-auto text-center py-12 space-y-6">
        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto text-blue-600 text-4xl font-bold">
          {Math.round((score / questions.length) * 100)}%
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Quiz Complete!</h2>
          <p className="text-slate-500">You got {score} out of {questions.length} correct.</p>
        </div>
        <button
          onClick={generateQuiz}
          className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
        >
          <RefreshCw size={20} /> Try Again
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentQ];

  return (
    <div className="max-w-xl mx-auto py-8 space-y-8">
      <div className="flex justify-between items-center text-sm font-medium text-slate-500">
        <span>Question {currentQ + 1} of {questions.length}</span>
        <span>Score: {score}</span>
      </div>

      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
        <div 
          className="bg-blue-600 h-full transition-all duration-500"
          style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
        />
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border text-center space-y-6">
        <h3 className="text-slate-400 uppercase tracking-wider text-sm font-semibold">Translate this term</h3>
        <h2 className="text-3xl font-bold text-slate-800">{currentQuestion.term.english}</h2>
        
        <div className="grid grid-cols-1 gap-3 mt-8">
          {currentQuestion.options.map((option: string, idx: number) => {
            let stateStyle = "bg-slate-50 border-slate-200 hover:border-blue-300 hover:bg-blue-50";
            
            if (selectedAnswer) {
              if (option === currentQuestion.correct) {
                stateStyle = "bg-green-100 border-green-500 text-green-800";
              } else if (option === selectedAnswer) {
                stateStyle = "bg-red-100 border-red-500 text-red-800";
              } else {
                stateStyle = "opacity-50 bg-slate-50 border-slate-200";
              }
            }

            return (
              <button
                key={idx}
                onClick={() => handleAnswer(option)}
                disabled={!!selectedAnswer}
                className={cn(
                  "p-4 rounded-xl border-2 text-lg font-medium transition-all text-left flex justify-between items-center",
                  stateStyle
                )}
              >
                {option}
                {selectedAnswer && option === currentQuestion.correct && <CheckCircle className="text-green-600" />}
                {selectedAnswer && option === selectedAnswer && option !== currentQuestion.correct && <XCircle className="text-red-600" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
