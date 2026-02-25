import React from 'react';
import { Link, useLocation } from 'wouter';
import { cn } from '../lib/utils';
import { Book, Brain, LayoutGrid, Settings, Search } from 'lucide-react';
import Onboarding from './Onboarding';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { href: '/', icon: LayoutGrid, label: 'Categories' },
    { href: '/glossary', icon: Search, label: 'Glossary' },
    { href: '/study', icon: Book, label: 'Study' },
    { href: '/quiz', icon: Brain, label: 'Quiz' },
    { href: '/admin', icon: Settings, label: 'Admin' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <Onboarding />
      {/* Mobile Header */}
      <header className="md:hidden bg-white border-b p-4 flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-xl font-bold text-blue-600">MediLingo</h1>
      </header>

      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r h-screen sticky top-0">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-blue-600 flex items-center gap-2">
            <span className="text-3xl">⚕️</span> MediLingo
          </h1>
          <p className="text-xs text-slate-500 mt-2">Medical Cantonese Learning</p>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <div className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors cursor-pointer",
                location === item.href || (item.href !== '/' && location.startsWith(item.href))
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}>
                <item.icon className="w-5 h-5" />
                {item.label}
              </div>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto pb-24 md:pb-8">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around p-2 z-20 pb-safe">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <div className={cn(
              "flex flex-col items-center p-2 rounded-lg transition-colors cursor-pointer",
              location === item.href || (item.href !== '/' && location.startsWith(item.href))
                ? "text-blue-600"
                : "text-slate-400"
            )}>
              <item.icon className="w-6 h-6" />
              <span className="text-[10px] mt-1">{item.label}</span>
            </div>
          </Link>
        ))}
      </nav>
    </div>
  );
}
