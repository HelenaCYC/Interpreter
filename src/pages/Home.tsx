import { useCategories } from '../hooks/useData';
import { Link } from 'wouter';
import { Activity, Thermometer, User, AlertCircle, Pill, Stethoscope, HeartPulse, Brain, Briefcase } from 'lucide-react';
import { motion } from 'motion/react';

// Map categories to icons
const getIcon = (name: string) => {
  if (name.includes('Vital')) return Activity;
  if (name.includes('Symptoms')) return Thermometer;
  if (name.includes('Body')) return User;
  if (name.includes('Emergency')) return AlertCircle;
  if (name.includes('Medications')) return Pill;
  if (name.includes('Lab')) return Stethoscope;
  if (name.includes('Chronic')) return HeartPulse;
  if (name.includes('Mental')) return Brain;
  return Briefcase;
};

export default function Home() {
  const { categories, loading } = useCategories();

  if (loading) return <div className="p-8 text-center">Loading categories...</div>;

  return (
    <div className="space-y-8">
      <section className="bg-blue-600 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-2">Welcome back!</h2>
          <p className="text-blue-100 mb-6 max-w-md">
            Ready to practice your medical Cantonese? Start with your daily flashcards or pick a category below.
          </p>
          <Link href="/study">
            <button className="bg-white text-blue-600 px-6 py-2 rounded-full font-semibold hover:bg-blue-50 transition-colors">
              Start Daily Practice
            </button>
          </Link>
        </div>
        <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-1/4 translate-y-1/4">
          <Activity size={300} />
        </div>
      </section>

      <section>
        <h3 className="text-xl font-bold text-slate-800 mb-4">Browse Categories</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((cat, i) => {
            const Icon = getIcon(cat.name);
            return (
              <Link key={cat.id} href={`/category/${cat.id}`}>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group h-full flex flex-col items-center text-center gap-3"
                >
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                    <Icon size={24} />
                  </div>
                  <span className="font-medium text-slate-700 group-hover:text-blue-700">
                    {cat.name}
                  </span>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
