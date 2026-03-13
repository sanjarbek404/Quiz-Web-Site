import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Play, Clock, BarChart3, Award, Activity, Target, ArrowRight, Loader2, TrendingUp, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useStore } from '../../store/useStore';
import { getQuizzes, getUserResults, Quiz, Result } from '../../services/quizService';
import { format } from 'date-fns';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const { theme, quizzes, results, setQuizzes, setResults } = useStore();
  const { userData } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      // Agar userData hali kelmagan bo'lsa, kutamiz
      if (userData === null) {
        return;
      }
      
      try {
        const [fetchedQuizzes, fetchedResults] = await Promise.all([
          getQuizzes(),
          getUserResults(userData.id)
        ]);
        setQuizzes(fetchedQuizzes);
        setResults(fetchedResults);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userData, setQuizzes, setResults]);

  // Agar userData hali null bo'lsa va biz hali loading holatida bo'lsak
  if (loading || userData === null) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center gap-6">
        <div className="relative">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
          <div className="absolute inset-0 blur-xl bg-indigo-500/20 animate-pulse rounded-full" />
        </div>
        <div className="text-center">
          <p className="text-xl font-bold text-slate-900 dark:text-white mb-2 animate-pulse">Ma'lumotlar yuklanmoqda...</p>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Iltimos, biroz kutib turing</p>
        </div>
      </div>
    );
  }

  if (userData === undefined) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 rounded-[2.5rem] bg-amber-500/10 text-amber-500 flex items-center justify-center mb-8 shadow-xl shadow-amber-500/10 rotate-3">
          <AlertCircle size={48} />
        </div>
        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">Profil topilmadi</h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-md mb-10 text-lg leading-relaxed">
          Sizning foydalanuvchi profilingiz topilmadi. Tizimga qayta kirishga urinib ko'ring yoki administratorga murojaat qiling.
        </p>
        <Link 
          to="/login" 
          className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition-all shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-1"
        >
          Kirish sahifasiga qaytish
        </Link>
      </div>
    );
  }

  const totalQuizzes = results.length;
  const bestScore = results.length > 0 ? Math.max(...results.map(r => r.score)) : 0;
  const averageScore = results.length > 0 ? Math.round(results.reduce((acc, curr) => acc + curr.percentage, 0) / results.length) : 0;

  // Prepare chart data
  const chartData = [...results].reverse().map((result, index) => ({
    name: `Test ${index + 1}`,
    score: result.percentage,
    date: format(new Date(result.completedAt), 'MMM dd')
  }));

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            y: [0, -30, 0],
            x: [0, 20, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full mix-blend-multiply filter blur-3xl dark:opacity-20"
        />
        <motion.div
          animate={{
            y: [0, 30, 0],
            x: [0, -20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full mix-blend-multiply filter blur-3xl dark:opacity-20"
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 relative"
        >
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-1 bg-indigo-600 rounded-full" />
            <span className="text-indigo-600 dark:text-indigo-400 font-black uppercase tracking-[0.2em] text-xs">Dashboard</span>
          </div>
          <h1 className="text-4xl font-black mb-2 tracking-tight text-slate-900 dark:text-white leading-tight">
            {t('dashboard.welcome', { name: userData.name })}
          </h1>
          <p className={`text-lg font-medium max-w-2xl ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
            O'rganish jarayoningiz, erishgan yutuqlaringiz va yangi testlar bilan tanishing.
          </p>
        </motion.div>

        {/* Stats Overview - Bento Grid Style */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            whileHover={{ y: -5 }}
            className={`p-6 rounded-[1.5rem] border backdrop-blur-2xl ${theme === 'dark' ? 'bg-slate-900/90 border-slate-800 shadow-black/50' : 'bg-white/90 border-slate-100 shadow-indigo-500/5'} shadow-xl flex flex-col gap-4 transition-all duration-300 group relative overflow-hidden`}
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-bl-full -mr-6 -mt-6 transition-transform group-hover:scale-110" />
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center relative z-10 shadow-lg shadow-indigo-500/20 group-hover:rotate-3 transition-transform duration-300">
              <Activity size={24} />
            </div>
            <div className="relative z-10">
              <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{t('dashboard.totalQuizzes')}</p>
              <p className="text-3xl font-black text-slate-900 dark:text-white">{totalQuizzes}</p>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            whileHover={{ y: -5 }}
            className={`p-6 rounded-[1.5rem] border backdrop-blur-2xl ${theme === 'dark' ? 'bg-slate-900/90 border-slate-800 shadow-black/50' : 'bg-white/90 border-slate-100 shadow-emerald-500/5'} shadow-xl flex flex-col gap-4 transition-all duration-300 group relative overflow-hidden`}
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-bl-full -mr-6 -mt-6 transition-transform group-hover:scale-110" />
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center relative z-10 shadow-lg shadow-emerald-500/20 group-hover:rotate-3 transition-transform duration-300">
              <Award size={24} />
            </div>
            <div className="relative z-10">
              <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{t('dashboard.bestScore')}</p>
              <p className="text-3xl font-black text-slate-900 dark:text-white">{bestScore}</p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            whileHover={{ y: -5 }}
            className={`p-6 rounded-[1.5rem] border backdrop-blur-2xl ${theme === 'dark' ? 'bg-slate-900/90 border-slate-800 shadow-black/50' : 'bg-white/90 border-slate-100 shadow-purple-500/5'} shadow-xl flex flex-col gap-4 transition-all duration-300 group relative overflow-hidden`}
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-bl-full -mr-6 -mt-6 transition-transform group-hover:scale-110" />
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center relative z-10 shadow-lg shadow-purple-500/20 group-hover:rotate-3 transition-transform duration-300">
              <Target size={24} />
            </div>
            <div className="relative z-10">
              <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{t('dashboard.averageScore')}</p>
              <p className="text-3xl font-black text-slate-900 dark:text-white">{averageScore}%</p>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Available Quizzes */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* Progress Chart */}
            {results.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}
                className={`p-8 rounded-[2.5rem] border backdrop-blur-2xl ${theme === 'dark' ? 'bg-slate-900/90 border-slate-800 shadow-black/50' : 'bg-white/90 border-slate-100 shadow-indigo-500/5'} shadow-xl`}
              >
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-black flex items-center gap-3 text-slate-900 dark:text-white tracking-tight">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 shadow-lg shadow-indigo-500/20">
                      <TrendingUp size={20} />
                    </div>
                    O'sish dinamikasi
                  </h2>
                </div>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#334155' : '#e2e8f0'} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: theme === 'dark' ? '#94a3b8' : '#64748b', fontSize: 12 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: theme === 'dark' ? '#94a3b8' : '#64748b', fontSize: 12 }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
                          borderRadius: '1rem',
                          border: `1px solid ${theme === 'dark' ? '#1e293b' : '#f1f5f9'}`,
                          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                        }}
                        itemStyle={{ color: '#6366f1', fontWeight: 'bold' }}
                      />
                      <Area type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" activeDot={{ r: 6, strokeWidth: 0, fill: '#6366f1' }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            )}

            <div>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-black flex items-center gap-4 text-slate-900 dark:text-white tracking-tight">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 shadow-lg shadow-indigo-500/20">
                    <Play size={24} />
                  </div>
                  {t('dashboard.availableQuizzes')}
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {quizzes.length === 0 ? (
                <div className="col-span-full p-16 text-center rounded-[2.5rem] border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
                  <div className="w-20 h-20 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center mx-auto mb-6">
                    <Play className="text-slate-400" size={32} />
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">Hozircha testlar mavjud emas.</p>
                </div>
              ) : (
                quizzes.map((quiz, index) => (
                  <motion.div
                    key={quiz.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index, duration: 0.4 }}
                    whileHover={{ y: -5 }}
                    className={`p-8 rounded-[2.5rem] border backdrop-blur-xl ${theme === 'dark' ? 'bg-slate-900/80 border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800/80' : 'bg-white/80 border-slate-100 hover:border-indigo-300 hover:bg-white'} transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 flex flex-col group`}
                  >
                    <div className="flex justify-between items-start mb-6">
                      <span className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wider uppercase ${
                        quiz.difficulty === 'easy' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                        quiz.difficulty === 'medium' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                        'bg-red-500/10 text-red-600 dark:text-red-400'
                      }`}>
                        {quiz.difficulty}
                      </span>
                      <span className="text-xs font-bold tracking-wider uppercase px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {quiz.category}
                      </span>
                    </div>
                    <h3 className="text-2xl font-black mb-4 text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{quiz.title}</h3>
                    <p className={`text-base mb-8 flex-grow leading-relaxed font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                      {quiz.description}
                    </p>
                    <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-100 dark:border-slate-800/50">
                      <div className="flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400">
                        <Clock size={18} />
                        <span>{quiz.timeLimit} {t('dashboard.minutes')}</span>
                      </div>
                      <Link 
                        to={`/quiz/${quiz.id}`}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-sm font-bold hover:bg-indigo-600 hover:text-white transition-all duration-300 group-hover:shadow-lg group-hover:shadow-indigo-500/30"
                      >
                        Boshlash <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>

          {/* Recent Activity */}
          <div>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-black flex items-center gap-4 text-slate-900 dark:text-white tracking-tight">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 shadow-lg shadow-indigo-500/20">
                  <BarChart3 size={24} />
                </div>
                {t('dashboard.recentActivity')}
              </h2>
            </div>
            
            <div className={`p-8 rounded-[2.5rem] border backdrop-blur-xl ${theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-slate-100'} shadow-xl`}>
              {results.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-6">
                    <BarChart3 className="text-slate-400" size={32} />
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">Hali natijalar yo'q</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {results.slice(0, 5).map((result, index) => {
                    const quiz = quizzes.find(q => q.id === result.quizId);
                    return (
                      <motion.div 
                        key={result.id} 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.4 }}
                        className={`flex items-center justify-between group p-5 rounded-2xl transition-all duration-300 border border-transparent ${theme === 'dark' ? 'hover:bg-slate-800/50 hover:border-slate-700' : 'hover:bg-slate-50 hover:border-slate-200'} cursor-pointer`}
                      >
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-1.5 text-lg">
                            {quiz?.title || 'Noma\'lum Test'}
                          </p>
                          <p className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                            {format(new Date(result.completedAt), 'MMM dd, yyyy • HH:mm')}
                          </p>
                        </div>
                        <div className={`text-base font-black px-5 py-2.5 rounded-xl shadow-sm ${result.percentage >= 80 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : result.percentage >= 50 ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'bg-red-500/10 text-red-600 dark:text-red-400'}`}>
                          {result.percentage}%
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
