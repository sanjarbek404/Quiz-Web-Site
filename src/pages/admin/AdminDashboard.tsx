import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Users, FileText, Settings, ShieldAlert, Database, Loader2, Search, Filter, AlertCircle, CheckCircle2, X, Trophy, Calendar, Percent, BarChart3 } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { getQuizzes, Quiz, getUsers, getAllResults, Result } from '../../services/quizService';
import { collection, getDocs, deleteDoc, doc, setDoc, getDoc, query, where } from 'firebase/firestore';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { db } from '../../firebase';
import CreateQuizModal from '../../components/admin/CreateQuizModal';

const sampleQuizzes = [
  {
    id: 'quiz_1',
    title: 'HTML & CSS Basics',
    description: 'Test your knowledge of HTML5 and CSS3 fundamentals.',
    category: 'Frontend',
    difficulty: 'easy',
    timeLimit: 10,
    createdAt: new Date().toISOString()
  },
  {
    id: 'quiz_2',
    title: 'Advanced React Patterns',
    description: 'A challenging quiz on React hooks, context, and performance optimization.',
    category: 'React',
    difficulty: 'hard',
    timeLimit: 20,
    createdAt: new Date().toISOString()
  },
  {
    id: 'quiz_3',
    title: 'JavaScript ES6+',
    description: 'Modern JavaScript features including promises, destructuring, and arrow functions.',
    category: 'JavaScript',
    difficulty: 'medium',
    timeLimit: 15,
    createdAt: new Date().toISOString()
  }
];

const sampleQuestions = [
  // Quiz 1 Questions
  {
    id: 'q1_1',
    quizId: 'quiz_1',
    question: 'What does HTML stand for?',
    options: ['Hyper Text Markup Language', 'High Tech Modern Language', 'Hyper Transfer Markup Language', 'Home Tool Markup Language'],
    correctAnswer: 'Hyper Text Markup Language'
  },
  {
    id: 'q1_2',
    quizId: 'quiz_1',
    question: 'Which property is used to change the background color in CSS?',
    options: ['color', 'bgcolor', 'background-color', 'bg-color'],
    correctAnswer: 'background-color'
  },
  // Quiz 2 Questions
  {
    id: 'q2_1',
    quizId: 'quiz_2',
    question: 'Which hook should be used for side effects in React?',
    options: ['useState', 'useContext', 'useEffect', 'useReducer'],
    correctAnswer: 'useEffect'
  },
  {
    id: 'q2_2',
    quizId: 'quiz_2',
    question: 'What is the purpose of React.memo?',
    options: ['To memorize state', 'To prevent unnecessary re-renders', 'To cache API responses', 'To store global variables'],
    correctAnswer: 'To prevent unnecessary re-renders'
  },
  // Quiz 3 Questions
  {
    id: 'q3_1',
    quizId: 'quiz_3',
    question: 'Which keyword is used to declare a block-scoped variable?',
    options: ['var', 'let', 'const', 'Both let and const'],
    correctAnswer: 'Both let and const'
  },
  {
    id: 'q3_2',
    quizId: 'quiz_3',
    question: 'What is the output of `typeof null` in JavaScript?',
    options: ['null', 'undefined', 'object', 'number'],
    correctAnswer: 'object'
  }
];

const AdminDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useStore();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [results, setResults] = useState<(Result & { userName?: string, userEmail?: string, quizTitle?: string })[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'quizzes' | 'users' | 'results'>('overview');
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState<Quiz | null>(null);
  const [userToDelete, setUserToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchAdminData = async () => {
    try {
      // Migrate old results that are missing userName
      try {
        const resultsQuery = query(collection(db, 'results'));
        const resultsSnapshot = await getDocs(resultsQuery);
        for (const docSnap of resultsSnapshot.docs) {
          const data = docSnap.data();
          if (!data.userName) {
            const userDoc = await getDoc(doc(db, 'users', data.userId));
            if (userDoc.exists()) {
              await setDoc(docSnap.ref, { 
                ...data, 
                userName: userDoc.data().name || 'Unknown',
                userEmail: userDoc.data().email || 'Unknown'
              });
            }
          }
        }
      } catch (migrationError) {
        console.error('Error migrating old results:', migrationError);
      }

      const fetchedQuizzes = await getQuizzes();
      setQuizzes(fetchedQuizzes);
      
      const fetchedUsers = await getUsers();
      setUsers(fetchedUsers);

      const fetchedResults = await getAllResults();
      setResults(fetchedResults);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Prepare chart data for overview
  const resultsByDate = results.reduce((acc, result) => {
    const date = new Date(result.completedAt).toLocaleDateString();
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(resultsByDate)
    .map(([date, count]) => ({ date, count }))
    .slice(-7); // Last 7 days with activity

  const handleSeedDatabase = async () => {
    if (!window.confirm('This will add sample quizzes and questions. Proceed?')) return;
    setSeeding(true);
    try {
      for (const quiz of sampleQuizzes) {
        await setDoc(doc(db, 'quizzes', quiz.id), quiz);
      }
      for (const question of sampleQuestions) {
        await setDoc(doc(db, 'questions', question.id), question);
      }
      const fetchedQuizzes = await getQuizzes();
      setQuizzes(fetchedQuizzes);
      showToast('Ma\'lumotlar muvaffaqiyatli yuklandi!', 'success');
    } catch (error) {
      console.error('Error seeding database:', error);
      showToast('Ma\'lumotlarni yuklashda xatolik yuz berdi.', 'error');
    } finally {
      setSeeding(false);
    }
  };

  const handleDeleteQuiz = (quiz: Quiz) => {
    setQuizToDelete(quiz);
    setUserToDelete(null);
    setDeleteModalOpen(true);
  };

  const handleDeleteUser = (user: any) => {
    setUserToDelete(user);
    setQuizToDelete(null);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!quizToDelete && !userToDelete) return;
    setIsDeleting(true);
    try {
      if (quizToDelete) {
        // Delete the quiz document
        await deleteDoc(doc(db, 'quizzes', quizToDelete.id));
        
        // Delete associated questions
        const qQuery = query(collection(db, 'questions'), where('quizId', '==', quizToDelete.id));
        const qDocs = await getDocs(qQuery);
        const deletePromises = qDocs.docs.map(d => deleteDoc(d.ref));
        await Promise.all(deletePromises);

        setQuizzes(quizzes.filter(q => q.id !== quizToDelete.id));
        showToast('Test muvaffaqiyatli o\'chirildi!', 'success');
      } else if (userToDelete) {
        // Prevent deleting the main admin
        if (userToDelete.email === 'sanjarbekotabekov010@gmail.com') {
          showToast('Asosiy adminni o\'chirib bo\'lmaydi!', 'error');
          return;
        }
        
        await deleteDoc(doc(db, 'users', userToDelete.id));
        setUsers(users.filter(u => u.id !== userToDelete.id));
        showToast('Foydalanuvchi muvaffaqiyatli o\'chirildi!', 'success');
      }
    } catch (error) {
      console.error('Error deleting:', error);
      showToast('O\'chirishda xatolik yuz berdi.', 'error');
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
      setQuizToDelete(null);
      setUserToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
        <p className="text-slate-500 dark:text-slate-400 font-medium animate-pulse">Admin paneli yuklanmoqda...</p>
      </div>
    );
  }

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
          className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full mix-blend-multiply filter blur-3xl dark:opacity-20"
        />
        <motion.div
          animate={{
            y: [0, 30, 0],
            x: [0, -20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full mix-blend-multiply filter blur-3xl dark:opacity-20"
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-5xl font-black flex items-center gap-4 text-slate-900 dark:text-white tracking-tight">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shadow-lg shadow-emerald-500/20">
                <ShieldAlert size={32} />
              </div>
              {t('admin.dashboard')}
            </h1>
            <p className={`mt-4 text-xl font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
              Platformani boshqarish va statistikalarni kuzatish
            </p>
          </motion.div>
          <div className="flex flex-wrap items-center gap-4">
            <motion.button 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={handleSeedDatabase}
              disabled={seeding}
              className={`px-6 py-3.5 rounded-2xl border font-bold transition-all duration-300 flex items-center gap-3 ${theme === 'dark' ? 'border-slate-700 hover:bg-slate-800 text-white hover:border-slate-600' : 'border-slate-200 hover:bg-slate-50 text-slate-900 hover:border-slate-300'} disabled:opacity-50 hover:shadow-md`}
            >
              {seeding ? <Loader2 size={20} className="animate-spin" /> : <Database size={20} />}
              {seeding ? 'Seeding...' : 'Seed Database'}
            </motion.button>
            <motion.button 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              onClick={() => setIsCreateModalOpen(true)}
              className="px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all duration-300 shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:-translate-y-1 flex items-center gap-3"
            >
              <Plus size={20} />
              {t('admin.createQuiz')}
            </motion.button>
          </div>
        </div>

      {/* Tabs */}
      <div className={`flex flex-wrap items-center gap-2 p-2 mb-12 rounded-2xl w-fit ${theme === 'dark' ? 'bg-slate-900/80 border border-slate-800' : 'bg-slate-100/80 border border-slate-200'} backdrop-blur-xl shadow-sm`}>
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-6 sm:px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'overview' ? (theme === 'dark' ? 'bg-slate-800 text-white shadow-lg shadow-black/20' : 'bg-white text-slate-900 shadow-md') : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'}`}
        >
          Umumiy
        </button>
        <button
          onClick={() => setActiveTab('quizzes')}
          className={`px-6 sm:px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'quizzes' ? (theme === 'dark' ? 'bg-slate-800 text-white shadow-lg shadow-black/20' : 'bg-white text-slate-900 shadow-md') : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'}`}
        >
          Testlar
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-6 sm:px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'users' ? (theme === 'dark' ? 'bg-slate-800 text-white shadow-lg shadow-black/20' : 'bg-white text-slate-900 shadow-md') : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'}`}
        >
          Foydalanuvchilar
        </button>
        <button
          onClick={() => setActiveTab('results')}
          className={`px-6 sm:px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'results' ? (theme === 'dark' ? 'bg-slate-800 text-white shadow-lg shadow-black/20' : 'bg-white text-slate-900 shadow-md') : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'}`}
        >
          Natijalar
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                whileHover={{ y: -5 }}
                className={`p-8 rounded-[2rem] border backdrop-blur-2xl ${theme === 'dark' ? 'bg-slate-900/90 border-slate-800 shadow-black/50' : 'bg-white/90 border-slate-100 shadow-indigo-500/5'} shadow-xl flex flex-col gap-6 transition-all duration-300 group relative overflow-hidden`}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center relative z-10 shadow-lg shadow-indigo-500/20 group-hover:rotate-3 transition-transform duration-300">
                  <FileText size={32} />
                </div>
                <div className="relative z-10">
                  <p className={`text-sm font-bold uppercase tracking-wider mb-2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Jami Testlar</p>
                  <p className="text-5xl font-black text-slate-900 dark:text-white">{quizzes.length}</p>
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                whileHover={{ y: -5 }}
                className={`p-8 rounded-[2rem] border backdrop-blur-2xl ${theme === 'dark' ? 'bg-slate-900/90 border-slate-800 shadow-black/50' : 'bg-white/90 border-slate-100 shadow-emerald-500/5'} shadow-xl flex flex-col gap-6 transition-all duration-300 group relative overflow-hidden`}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center relative z-10 shadow-lg shadow-emerald-500/20 group-hover:rotate-3 transition-transform duration-300">
                  <Users size={32} />
                </div>
                <div className="relative z-10">
                  <p className={`text-sm font-bold uppercase tracking-wider mb-2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Foydalanuvchilar</p>
                  <p className="text-5xl font-black text-slate-900 dark:text-white">{users.length}</p>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                whileHover={{ y: -5 }}
                className={`p-8 rounded-[2rem] border backdrop-blur-2xl ${theme === 'dark' ? 'bg-slate-900/90 border-slate-800 shadow-black/50' : 'bg-white/90 border-slate-100 shadow-purple-500/5'} shadow-xl flex flex-col gap-6 transition-all duration-300 group relative overflow-hidden`}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
                <div className="w-16 h-16 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center relative z-10 shadow-lg shadow-purple-500/20 group-hover:rotate-3 transition-transform duration-300">
                  <Settings size={32} />
                </div>
                <div className="relative z-10">
                  <p className={`text-sm font-bold uppercase tracking-wider mb-2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Tizim Holati</p>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="w-4 h-4 rounded-full bg-emerald-500 animate-pulse shadow-lg shadow-emerald-500/50" />
                    <p className="text-3xl font-black text-emerald-500">Faol</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Overview Chart */}
            {chartData.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className={`mb-12 p-8 rounded-[2rem] border backdrop-blur-2xl ${theme === 'dark' ? 'bg-slate-900/90 border-slate-800 shadow-black/50' : 'bg-white/90 border-slate-100 shadow-indigo-500/5'} shadow-xl`}
              >
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-black flex items-center gap-3 text-slate-900 dark:text-white tracking-tight">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 shadow-lg shadow-indigo-500/20">
                      <BarChart3 size={20} />
                    </div>
                    Test ishlash faolligi
                  </h2>
                </div>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#334155' : '#e2e8f0'} />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: theme === 'dark' ? '#94a3b8' : '#64748b', fontSize: 12 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: theme === 'dark' ? '#94a3b8' : '#64748b', fontSize: 12 }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
                          borderRadius: '1rem',
                          border: `1px solid ${theme === 'dark' ? '#1e293b' : '#f1f5f9'}`,
                          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                        }}
                        itemStyle={{ color: '#6366f1', fontWeight: 'bold' }}
                        cursor={{ fill: theme === 'dark' ? '#1e293b' : '#f1f5f9' }}
                      />
                      <Bar dataKey="count" name="Ishlangan testlar" fill="#6366f1" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {activeTab === 'quizzes' && (
          <motion.div
            key="quizzes"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
              <h2 className="text-3xl font-black flex items-center gap-4 text-slate-900 dark:text-white tracking-tight">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 shadow-lg shadow-indigo-500/20">
                  <FileText size={24} />
                </div>
                {t('admin.manageQuizzes')}
              </h2>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className={`flex items-center gap-2 px-5 py-3 rounded-xl border ${theme === 'dark' ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'} w-full sm:w-72 shadow-sm`}>
                  <Search size={20} className="text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Qidirish..." 
                    className="bg-transparent border-none outline-none text-sm font-medium w-full text-slate-900 dark:text-white placeholder:text-slate-500"
                  />
                </div>
              </div>
            </div>
            <div className={`rounded-[2.5rem] border overflow-hidden shadow-2xl backdrop-blur-xl ${theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-white/90 border-slate-100'}`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className={`border-b ${theme === 'dark' ? 'border-slate-800 bg-slate-950/50' : 'border-slate-100 bg-slate-50/80'}`}>
                      <th className="py-6 px-8 font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">{t('admin.title')}</th>
                      <th className="py-6 px-8 font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">{t('admin.category')}</th>
                      <th className="py-6 px-8 font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">{t('admin.difficulty')}</th>
                      <th className="py-6 px-8 font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">{t('admin.timeLimit')}</th>
                      <th className="py-6 px-8 font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 text-right">{t('admin.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quizzes.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-20 text-center">
                          <div className="flex flex-col items-center justify-center gap-4">
                            <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                              <FileText className="text-slate-400" size={32} />
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">Hozircha testlar yo'q</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      quizzes.map((quiz, index) => (
                        <motion.tr 
                          key={quiz.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`border-b last:border-0 transition-colors ${theme === 'dark' ? 'border-slate-800 hover:bg-slate-800/50' : 'border-slate-100 hover:bg-slate-50/80'} group`}
                        >
                          <td className="py-6 px-8 font-bold text-slate-900 dark:text-white text-lg">{quiz.title}</td>
                          <td className="py-6 px-8">
                            <span className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold tracking-wider uppercase">
                              {quiz.category}
                            </span>
                          </td>
                          <td className="py-6 px-8">
                            <span className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wider uppercase ${
                              quiz.difficulty === 'easy' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                              quiz.difficulty === 'medium' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                              'bg-red-500/10 text-red-600 dark:text-red-400'
                            }`}>
                              {quiz.difficulty}
                            </span>
                          </td>
                          <td className="py-6 px-8 font-bold text-slate-500 dark:text-slate-400">{quiz.timeLimit} min</td>
                          <td className="py-6 px-8 text-right">
                            <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button className="p-3 rounded-xl text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors shadow-sm">
                                <Edit2 size={18} />
                              </button>
                              <button 
                                onClick={() => handleDeleteQuiz(quiz)}
                                className="p-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors shadow-sm"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'users' && (
          <motion.div
            key="users"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
              <h2 className="text-3xl font-black flex items-center gap-4 text-slate-900 dark:text-white tracking-tight">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shadow-lg shadow-emerald-500/20">
                  <Users size={24} />
                </div>
                Foydalanuvchilar
              </h2>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className={`flex items-center gap-2 px-5 py-3 rounded-xl border ${theme === 'dark' ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'} w-full sm:w-72 shadow-sm`}>
                  <Search size={20} className="text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Qidirish..." 
                    className="bg-transparent border-none outline-none text-sm font-medium w-full text-slate-900 dark:text-white placeholder:text-slate-500"
                  />
                </div>
              </div>
            </div>
            <div className={`rounded-[2.5rem] border overflow-hidden shadow-2xl backdrop-blur-xl ${theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-white/90 border-slate-100'}`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className={`border-b ${theme === 'dark' ? 'border-slate-800 bg-slate-950/50' : 'border-slate-100 bg-slate-50/80'}`}>
                      <th className="py-6 px-8 font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">Foydalanuvchi</th>
                      <th className="py-6 px-8 font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">Email</th>
                      <th className="py-6 px-8 font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">Rol</th>
                      <th className="py-6 px-8 font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">Qo'shilgan sana</th>
                      <th className="py-6 px-8 font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 text-right">Amallar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-20 text-center">
                          <div className="flex flex-col items-center justify-center gap-4">
                            <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                              <Users className="text-slate-400" size={32} />
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">Foydalanuvchilar topilmadi</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      users.map((user, index) => (
                        <motion.tr 
                          key={user.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`border-b last:border-0 transition-colors ${theme === 'dark' ? 'border-slate-800 hover:bg-slate-800/50' : 'border-slate-100 hover:bg-slate-50/80'}`}
                        >
                          <td className="py-6 px-8 font-bold text-slate-900 dark:text-white text-lg">
                            <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black text-white shadow-lg ${
                                user.role === 'admin' ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-emerald-500/30' : 'bg-gradient-to-br from-indigo-400 to-indigo-600 shadow-indigo-500/30'
                              }`}>
                                {user.name?.charAt(0).toUpperCase() || 'U'}
                              </div>
                              {user.name || 'Noma\'lum'}
                            </div>
                          </td>
                          <td className="py-6 px-8 font-medium text-slate-500 dark:text-slate-400">{user.email}</td>
                          <td className="py-6 px-8">
                            <span className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wider uppercase ${
                              user.role === 'admin' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                            }`}>
                              {user.role || 'USER'}
                            </span>
                          </td>
                          <td className="py-6 px-8 font-bold text-slate-500 dark:text-slate-400">
                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="py-6 px-8 text-right">
                            {user.email !== 'sanjarbekotabekov010@gmail.com' && (
                              <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                  onClick={() => handleDeleteUser(user)}
                                  className="p-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors shadow-sm"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            )}
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'results' && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                <Trophy className="text-emerald-500" size={32} />
                Foydalanuvchi Natijalari
              </h2>
              <div className={`flex items-center gap-3 px-5 py-3 rounded-2xl border shadow-sm ${theme === 'dark' ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
                <Search size={20} className="text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Qidirish..." 
                  className="bg-transparent border-none outline-none text-sm font-medium w-full text-slate-900 dark:text-white placeholder:text-slate-500"
                />
              </div>
            </div>

            <div className={`rounded-[2.5rem] border overflow-hidden shadow-2xl backdrop-blur-xl ${theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-white/90 border-slate-100'}`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className={`border-b ${theme === 'dark' ? 'border-slate-800 bg-slate-950/50' : 'border-slate-100 bg-slate-50/80'}`}>
                      <th className="py-6 px-8 font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">Foydalanuvchi</th>
                      <th className="py-6 px-8 font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">Test Nomi</th>
                      <th className="py-6 px-8 font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">Natija</th>
                      <th className="py-6 px-8 font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">Sana</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-20 text-center">
                          <div className="flex flex-col items-center justify-center gap-4">
                            <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                              <Trophy className="text-slate-400" size={32} />
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">Natijalar topilmadi</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      results.map((result, index) => (
                        <motion.tr 
                          key={result.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`border-b last:border-0 transition-colors ${theme === 'dark' ? 'border-slate-800 hover:bg-slate-800/50' : 'border-slate-100 hover:bg-slate-50/80'}`}
                        >
                          <td className="py-6 px-8">
                            <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black text-white shadow-lg bg-gradient-to-br from-indigo-400 to-indigo-600 shadow-indigo-500/30`}>
                                {result.userName?.charAt(0).toUpperCase() || 'U'}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900 dark:text-white text-lg">{result.userName || 'Noma\'lum'}</div>
                                <div className="text-sm text-slate-500 dark:text-slate-400">{result.userEmail || 'Email yo\'q'}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-6 px-8 font-bold text-slate-700 dark:text-slate-300 text-lg">
                            {result.quizTitle || 'Noma\'lum Test'}
                          </td>
                          <td className="py-6 px-8">
                            <div className="flex items-center gap-4">
                              <div className={`px-4 py-2 rounded-xl text-sm font-bold tracking-wider flex items-center gap-2 ${
                                result.percentage >= 80 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 
                                result.percentage >= 50 ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' : 
                                'bg-red-500/10 text-red-600 dark:text-red-400'
                              }`}>
                                <Percent size={16} />
                                {result.percentage.toFixed(1)}%
                              </div>
                              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                ({result.score} ball)
                              </span>
                            </div>
                          </td>
                          <td className="py-6 px-8 font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2">
                            <Calendar size={18} className="text-slate-400" />
                            {result.completedAt ? new Date(result.completedAt).toLocaleString() : 'N/A'}
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <CreateQuizModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onSuccess={() => {
          fetchAdminData();
          showToast('Test muvaffaqiyatli yaratildi!', 'success');
        }}
      />

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModalOpen && (quizToDelete || userToDelete) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => !isDeleting && setDeleteModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`relative w-full max-w-md p-8 rounded-[2rem] shadow-2xl border ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white shadow-black/50' : 'bg-white border-slate-100 text-slate-900 shadow-indigo-500/10'}`}
            >
              <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mb-6 mx-auto shadow-lg shadow-red-500/20">
                <AlertCircle size={32} />
              </div>
              <h3 className="text-2xl font-black text-center mb-2 tracking-tight">
                {quizToDelete ? 'Testni o\'chirish' : 'Foydalanuvchini o\'chirish'}
              </h3>
              <p className={`text-center mb-8 font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                Siz rostdan ham <span className="text-slate-900 dark:text-white font-bold">"{quizToDelete ? quizToDelete.title : userToDelete?.name}"</span> {quizToDelete ? 'testini' : 'foydalanuvchisini'} o'chirmoqchimisiz? Bu amalni ortga qaytarib bo'lmaydi.
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setDeleteModalOpen(false)}
                  disabled={isDeleting}
                  className={`flex-1 py-4 rounded-2xl font-bold transition-all duration-300 ${theme === 'dark' ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-900'} disabled:opacity-50`}
                >
                  Bekor qilish
                </button>
                <button 
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="flex-1 py-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold transition-all duration-300 shadow-lg shadow-red-500/30 hover:-translate-y-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  {isDeleting ? <Loader2 size={20} className="animate-spin" /> : <Trash2 size={20} />}
                  {isDeleting ? 'O\'chirilmoqda...' : 'O\'chirish'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-8 right-8 z-50"
          >
            <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-xl ${
              toast.type === 'success' 
                ? (theme === 'dark' ? 'bg-emerald-900/90 border-emerald-800 text-emerald-100' : 'bg-emerald-50 border-emerald-200 text-emerald-800')
                : (theme === 'dark' ? 'bg-red-900/90 border-red-800 text-red-100' : 'bg-red-50 border-red-200 text-red-800')
            }`}>
              {toast.type === 'success' ? <CheckCircle2 size={24} className={theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'} /> : <AlertCircle size={24} className={theme === 'dark' ? 'text-red-400' : 'text-red-600'} />}
              <p className="font-bold text-lg">{toast.message}</p>
              <button onClick={() => setToast(null)} className="ml-4 opacity-70 hover:opacity-100 transition-opacity">
                <X size={20} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </div>
  );
};

export default AdminDashboard;
