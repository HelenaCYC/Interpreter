import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Stethoscope, GraduationCap, Briefcase } from 'lucide-react';

export default function Onboarding() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const goal = localStorage.getItem('medilingo_goal');
    if (!goal) {
      setShow(true);
    }
  }, []);

  const handleSelect = (goal: string) => {
    localStorage.setItem('medilingo_goal', goal);
    setShow(false);
  };

  const goals = [
    { id: 'study', label: 'General Study', icon: GraduationCap, desc: 'I want to learn medical terms.' },
    { id: 'practice', label: 'Interpretation Practice', icon: Stethoscope, desc: 'I am preparing for interpretation.' },
    { id: 'job', label: 'Nursing Job Prep', icon: Briefcase, desc: 'I need terms for my nursing job.' },
  ];

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-blue-600 mb-2">Welcome to Canto Lingo</h2>
            <p className="text-slate-500">Choose your primary learning goal to get started.</p>
          </div>

          <div className="space-y-4">
            {goals.map((goal) => (
              <button
                key={goal.id}
                onClick={() => handleSelect(goal.id)}
                className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-slate-100 hover:border-blue-500 hover:bg-blue-50 transition-all group text-left"
              >
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <goal.icon size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">{goal.label}</h3>
                  <p className="text-sm text-slate-500">{goal.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
