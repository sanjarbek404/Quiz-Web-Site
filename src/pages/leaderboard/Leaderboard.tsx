import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Trophy, Medal, Search, Filter, Loader2 } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { getLeaderboard, Result } from '../../services/quizService';
import { format } from 'date-fns';

const Leaderboard: React.FC = () => {
  const { t } = useTranslation();
  const { theme, leaderboard, setLeaderboard } = useStore();
  const [loading, setLoading] = useState(!leaderboard.length);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const data = await getLeaderboard();
        setLeaderboard(data);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [setLeaderboard]);

  const filteredLeaderboard = leaderboard.filter(entry => 
    entry.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.quizTitle?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const top3 = filteredLeaderboard.slice(0, 3);
  const restOfLeaderboard = filteredLeaderboard.slice(3);

  if (loading && !leaderboard.length) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
        <p className="text-slate-500 dark:text-slate-400 font-medium animate-pulse">Reyting yuklanmoqda...</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            y: [0, -40, 0],
            x: [0, 30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-0 w-[600px] h-[600px] bg-amber-500/10 rounded-full mix-blend-multiply filter blur-3xl dark:opacity-20"
        />
        <motion.div
          animate={{
            y: [0, 40, 0],
            x: [0, -30, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-1/4 right-0 w-[600px] h-[600px] bg-indigo-500/10 rounded-full mix-blend-multiply filter blur-3xl dark:opacity-20"
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <div className="w-16 h-16 rounded-[1.5rem] bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/20 rotate-3 hover:rotate-6 transition-transform duration-300">
            <Trophy size={32} />
          </div>
          <h1 className="text-3xl font-black mb-2 tracking-tight text-slate-900 dark:text-white">{t('leaderboard.title')}</h1>
          <p className={`text-lg max-w-2xl mx-auto leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
            Boshqa foydalanuvchilar bilan natijalaringizni solishtiring. Reyting barcha testlar bo'yicha eng yaxshi natijalarni ko'rsatadi.
          </p>
        </motion.div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-10">
          <div className="relative w-full sm:w-[400px]">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`appearance-none rounded-2xl block w-full pl-12 px-5 py-4 border ${theme === 'dark' ? 'bg-slate-900/50 border-slate-800 text-white placeholder-slate-500 focus:ring-amber-500 focus:border-amber-500' : 'bg-white/80 border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-amber-500 focus:border-amber-500'} focus:outline-none transition-all duration-300 shadow-sm backdrop-blur-xl`}
              placeholder="Foydalanuvchi yoki test qidirish..."
            />
          </div>
          <button className={`flex items-center gap-3 px-6 py-4 rounded-2xl border font-semibold ${theme === 'dark' ? 'bg-slate-900/50 border-slate-800 hover:bg-slate-800 text-white' : 'bg-white/80 border-slate-200 hover:bg-slate-50 text-slate-900'} transition-all duration-300 shadow-sm backdrop-blur-xl`}>
            <Filter size={20} />
            <span>Filtr</span>
          </button>
        </div>

        {/* Top 3 Podium */}
        {top3.length > 0 && !searchTerm && (
          <div className="flex flex-col md:flex-row items-end justify-center gap-4 md:gap-8 mb-16 pt-10">
            {/* 2nd Place */}
            {top3[1] && (
              <motion.div 
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5, type: 'spring' }}
                className="flex flex-col items-center order-2 md:order-1 w-full md:w-1/3"
              >
                <div className="relative w-20 h-20 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-2xl font-black text-slate-600 dark:text-slate-300 shadow-xl shadow-slate-500/20 mb-4 border-4 border-white dark:border-slate-900 z-10">
                  {top3[1].userName?.charAt(0).toUpperCase() || 'U'}
                  <div className="absolute -bottom-3 -right-3 w-8 h-8 rounded-full bg-slate-400 flex items-center justify-center text-white shadow-lg border-2 border-white dark:border-slate-900">
                    <span className="text-xs font-bold">2</span>
                  </div>
                </div>
                <div className={`w-full p-6 rounded-t-[2rem] rounded-b-xl border-t border-x ${theme === 'dark' ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-100 border-slate-200'} flex flex-col items-center text-center backdrop-blur-xl h-40 justify-end pb-8 relative overflow-hidden`}>
                  <div className="absolute top-0 left-0 w-full h-1 bg-slate-400" />
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white truncate w-full px-2">{top3[1].userName}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-2 truncate w-full px-2">{top3[1].quizTitle}</p>
                  <div className="text-2xl font-black text-slate-600 dark:text-slate-300">{top3[1].score} <span className="text-sm">ball</span></div>
                </div>
              </motion.div>
            )}

            {/* 1st Place */}
            {top3[0] && (
              <motion.div 
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5, type: 'spring' }}
                className="flex flex-col items-center order-1 md:order-2 w-full md:w-1/3 z-10"
              >
                <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 flex items-center justify-center text-4xl font-black text-white shadow-2xl shadow-amber-500/40 mb-4 border-4 border-white dark:border-slate-900 z-10">
                  {top3[0].userName?.charAt(0).toUpperCase() || 'U'}
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-amber-500 drop-shadow-md">
                    <Trophy size={32} fill="currentColor" />
                  </div>
                  <div className="absolute -bottom-3 -right-3 w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-white shadow-lg border-2 border-white dark:border-slate-900">
                    <span className="text-sm font-bold">1</span>
                  </div>
                </div>
                <div className={`w-full p-6 rounded-t-[2.5rem] rounded-b-xl border-t border-x ${theme === 'dark' ? 'bg-amber-500/10 border-amber-500/30' : 'bg-amber-50 border-amber-200'} flex flex-col items-center text-center backdrop-blur-xl h-48 justify-end pb-8 relative overflow-hidden shadow-xl shadow-amber-500/10`}>
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-amber-500" />
                  <h3 className="font-black text-xl text-slate-900 dark:text-white truncate w-full px-2">{top3[0].userName}</h3>
                  <p className="text-amber-600 dark:text-amber-400 text-sm font-bold mb-2 truncate w-full px-2">{top3[0].quizTitle}</p>
                  <div className="text-3xl font-black text-amber-500">{top3[0].score} <span className="text-sm">ball</span></div>
                </div>
              </motion.div>
            )}

            {/* 3rd Place */}
            {top3[2] && (
              <motion.div 
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5, type: 'spring' }}
                className="flex flex-col items-center order-3 md:order-3 w-full md:w-1/3"
              >
                <div className="relative w-20 h-20 rounded-full bg-orange-200 dark:bg-orange-900/50 flex items-center justify-center text-2xl font-black text-orange-600 dark:text-orange-400 shadow-xl shadow-orange-500/20 mb-4 border-4 border-white dark:border-slate-900 z-10">
                  {top3[2].userName?.charAt(0).toUpperCase() || 'U'}
                  <div className="absolute -bottom-3 -right-3 w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white shadow-lg border-2 border-white dark:border-slate-900">
                    <span className="text-xs font-bold">3</span>
                  </div>
                </div>
                <div className={`w-full p-6 rounded-t-[2rem] rounded-b-xl border-t border-x ${theme === 'dark' ? 'bg-orange-900/20 border-orange-900/50' : 'bg-orange-50 border-orange-200'} flex flex-col items-center text-center backdrop-blur-xl h-36 justify-end pb-8 relative overflow-hidden`}>
                  <div className="absolute top-0 left-0 w-full h-1 bg-orange-500" />
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white truncate w-full px-2">{top3[2].userName}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-2 truncate w-full px-2">{top3[2].quizTitle}</p>
                  <div className="text-2xl font-black text-orange-600 dark:text-orange-400">{top3[2].score} <span className="text-sm">ball</span></div>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* Leaderboard Table */}
        <div className={`rounded-[2.5rem] border overflow-hidden shadow-2xl backdrop-blur-2xl ${theme === 'dark' ? 'bg-slate-900/80 border-slate-800 shadow-black/50' : 'bg-white/90 border-slate-100 shadow-amber-500/5'}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`border-b ${theme === 'dark' ? 'border-slate-800 bg-slate-950/50' : 'border-slate-100 bg-slate-50/80'}`}>
                  <th className="py-6 px-8 font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 text-center w-24">{t('leaderboard.rank')}</th>
                  <th className="py-6 px-8 font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">{t('leaderboard.user')}</th>
                  <th className="py-6 px-8 font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">{t('leaderboard.quiz')}</th>
                  <th className="py-6 px-8 font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">{t('leaderboard.score')}</th>
                  <th className="py-6 px-8 font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 text-right">{t('leaderboard.date')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeaderboard.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-20 text-center">
                      <div className="flex flex-col items-center justify-center gap-4">
                        <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                          <Trophy className="text-slate-400" size={32} />
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">Natijalar topilmadi</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  (searchTerm ? filteredLeaderboard : restOfLeaderboard).map((entry, idx) => {
                    // Calculate actual rank based on whether we are showing top 3 or not
                    const index = searchTerm ? idx : idx + 3;
                    return (
                    <motion.tr 
                      key={entry.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05, duration: 0.4 }}
                      className={`border-b last:border-0 transition-all duration-300 hover:shadow-lg relative z-10 ${theme === 'dark' ? 'border-slate-800 hover:bg-slate-800/80' : 'border-slate-100 hover:bg-white'} group`}
                    >
                      <td className="py-5 px-8 text-center">
                        <div className="flex items-center justify-center w-12 h-12 rounded-2xl mx-auto font-bold text-lg transition-transform duration-300 group-hover:scale-110">
                          {index === 0 ? <div className="w-full h-full bg-yellow-500/10 text-yellow-500 flex items-center justify-center rounded-2xl shadow-lg shadow-yellow-500/20"><Medal size={28} /></div> :
                           index === 1 ? <div className="w-full h-full bg-slate-400/10 text-slate-400 flex items-center justify-center rounded-2xl shadow-lg shadow-slate-400/20"><Medal size={28} /></div> :
                           index === 2 ? <div className="w-full h-full bg-amber-700/10 text-amber-700 flex items-center justify-center rounded-2xl shadow-lg shadow-amber-700/20"><Medal size={28} /></div> :
                           <span className="text-slate-500 dark:text-slate-400">{index + 1}</span>}
                        </div>
                      </td>
                      <td className="py-5 px-8 font-semibold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-bold text-white shadow-md transition-transform duration-300 group-hover:scale-110 ${
                            index % 3 === 0 ? 'bg-gradient-to-br from-indigo-400 to-indigo-600' : index % 3 === 1 ? 'bg-gradient-to-br from-emerald-400 to-emerald-600' : 'bg-gradient-to-br from-purple-400 to-purple-600'
                          }`}>
                            {entry.userName?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          {entry.userName || 'Noma\'lum Foydalanuvchi'}
                        </div>
                      </td>
                      <td className="py-5 px-8">
                        <span className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-semibold tracking-wide">
                          {entry.quizTitle || 'Noma\'lum Test'}
                        </span>
                      </td>
                      <td className="py-5 px-8">
                        <div className="flex items-center gap-3">
                          <span className="text-xl font-black text-slate-900 dark:text-white">{entry.score}</span>
                          <span className={`text-sm font-bold px-3 py-1.5 rounded-xl ${entry.percentage >= 80 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : entry.percentage >= 50 ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'bg-red-500/10 text-red-600 dark:text-red-400'}`}>
                            {entry.percentage}%
                          </span>
                        </div>
                      </td>
                      <td className="py-5 px-8 text-sm font-medium text-slate-500 dark:text-slate-400 text-right">
                        {format(new Date(entry.completedAt), 'MMM dd, yyyy • HH:mm')}
                      </td>
                    </motion.tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
