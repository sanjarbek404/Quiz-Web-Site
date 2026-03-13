import React from 'react';
import { useTranslation } from 'react-i18next';
import { Github, Twitter, Linkedin } from 'lucide-react';
import { useStore } from '../../store/useStore';

const Footer: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useStore();

  return (
    <footer className={`border-t ${theme === 'dark' ? 'border-slate-800 bg-slate-950 text-slate-400' : 'border-slate-200 bg-white text-slate-500'} py-16`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <span className="text-white font-black text-xl">Q</span>
            </div>
            <span className="font-black text-xl tracking-tight text-slate-900 dark:text-white">IT Quiz</span>
          </div>
          
          <div className="text-sm font-medium">
            <p>&copy; {new Date().getFullYear()} IT Quiz Platform. Barcha huquqlar himoyalangan.</p>
          </div>

          <div className="flex items-center gap-6">
            <a href="#" className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-300"><Github size={20} /></a>
            <a href="#" className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-300"><Twitter size={20} /></a>
            <a href="#" className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-300"><Linkedin size={20} /></a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
