import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Moon, Sun, Globe, LogOut, ShieldAlert, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { useAuth } from '../../contexts/AuthContext';
import { auth } from '../../firebase';
import { signOut } from 'firebase/auth';

const Navbar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme, language, setLanguage } = useStore();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language, i18n]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`sticky top-0 z-50 border-b ${theme === 'dark' ? 'border-slate-800 bg-slate-950/80' : 'border-slate-200 bg-white/80'} backdrop-blur-xl`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform duration-300">
            <span className="text-white font-black text-xl">Q</span>
          </div>
          <span className="font-black text-xl tracking-tight text-slate-900 dark:text-white">IT Quiz</span>
        </Link>

        <div className="flex items-center gap-6">
          {currentUser && (
            <div className="hidden md:flex items-center gap-8">
              <Link to="/dashboard" className="text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                {t('nav.dashboard')}
              </Link>
              <Link to="/leaderboard" className="text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                {t('nav.leaderboard')}
              </Link>
              {currentUser.email === 'sanjarbekotabekov010@gmail.com' && currentUser.providerData.some(p => p.providerId === 'google.com') && (
                <Link to="/admin" className="text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 transition-colors flex items-center gap-2 bg-emerald-500/10 px-4 py-2 rounded-xl">
                  <ShieldAlert size={18} />
                  {t('nav.admin')}
                </Link>
              )}
            </div>
          )}

          <div className="flex items-center gap-3 pl-6 border-l border-slate-200 dark:border-slate-800">
            <button onClick={toggleTheme} className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-400">
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            {currentUser ? (
              <button onClick={handleLogout} className="p-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors text-red-500">
                <LogOut size={20} />
              </button>
            ) : (
              <Link to="/login" className="px-6 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold hover:scale-105 transition-all duration-300 shadow-lg shadow-slate-500/20">
                {t('nav.login')}
              </Link>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
