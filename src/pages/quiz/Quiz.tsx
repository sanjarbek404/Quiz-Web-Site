import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, AlertCircle, CheckCircle2, XCircle, ArrowRight, Loader2, Settings2, Play } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useStore } from '../../store/useStore';
import { getQuizById, getQuestionsByQuizId, Quiz as QuizType, Question } from '../../services/quizService';

const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const Quiz: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { theme } = useStore();
  const { userData } = useAuth();
  
  const [quiz, setQuiz] = useState<QuizType | null>(null);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectionMode, setSelectionMode] = useState(true);
  const [requestedCount, setRequestedCount] = useState<number>(10);

  useEffect(() => {
    const fetchQuizData = async () => {
      if (!id) return;
      try {
        const fetchedQuiz = await getQuizById(id);
        if (fetchedQuiz) {
          setQuiz(fetchedQuiz);
          const fetchedQuestions = await getQuestionsByQuizId(id);
          setAllQuestions(fetchedQuestions);
          if (fetchedQuestions.length > 0) {
            setRequestedCount(Math.min(10, fetchedQuestions.length));
          }
        } else {
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Error fetching quiz:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuizData();
  }, [id, navigate]);

  const startQuiz = () => {
    if (allQuestions.length === 0) return;
    
    // Shuffle and slice questions
    const shuffled = shuffleArray<Question>(allQuestions);
    const selected = shuffled.slice(0, requestedCount);
    
    // Also shuffle options for each question
    const randomizedQuestions = selected.map((q: Question) => ({
      ...q,
      options: shuffleArray<string>(q.options)
    }));

    setQuestions(randomizedQuestions);
    if (quiz) {
      setTimeLeft(quiz.timeLimit * 60);
    }
    setSelectionMode(false);
  };

  useEffect(() => {
    if (timeLeft === null || isFinished) return;
    if (timeLeft <= 0) {
      handleFinish();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev !== null ? prev - 1 : null));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isFinished]);

  const handleSelectAnswer = (answer: string) => {
    if (isFinished) return;
    const currentQuestion = questions[currentQuestionIndex];
    setSelectedAnswers(prev => ({ ...prev, [currentQuestion.id]: answer }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleFinish();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !isFinished && !selectionMode && !submitting) {
        const currentQuestion = questions[currentQuestionIndex];
        if (selectedAnswers[currentQuestion.id]) {
          handleNext();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentQuestionIndex, questions, selectedAnswers, isFinished, selectionMode, submitting]);

  const handleFinish = async () => {
    if (!quiz || !userData || isFinished) return;
    setIsFinished(true);
    setSubmitting(true);

    let calculatedScore = 0;
    questions.forEach(q => {
      if (selectedAnswers[q.id] === q.correctAnswer) {
        calculatedScore++;
      }
    });
    setScore(calculatedScore);

    const percentage = Math.round((calculatedScore / questions.length) * 100);
    const resultId = `${userData.id}_${quiz.id}_${Date.now()}`;

    try {
      await setDoc(doc(db, 'results', resultId), {
        id: resultId,
        userId: userData.id,
        quizId: quiz.id,
        score: calculatedScore,
        percentage,
        completedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error saving result:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        <p className="text-slate-500 dark:text-slate-400 font-medium animate-pulse">Test yuklanmoqda...</p>
      </div>
    );
  }

  if (!quiz || allQuestions.length === 0) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center flex-col gap-6">
        <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center">
          <AlertCircle size={40} className="text-red-500" />
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Test topilmadi</p>
          <p className="text-slate-500 dark:text-slate-400">Bu test mavjud emas yoki savollar qo'shilmagan.</p>
        </div>
        <button onClick={() => navigate('/dashboard')} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-indigo-500/30 flex items-center gap-2">
          {t('quiz.backToDashboard')} <ArrowRight size={18} />
        </button>
      </div>
    );
  }

  if (selectionMode) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className={`max-w-xl w-full p-10 rounded-[2.5rem] border backdrop-blur-2xl ${theme === 'dark' ? 'bg-slate-900/90 border-slate-800 shadow-black/50' : 'bg-white/90 border-slate-100 shadow-indigo-500/10'} shadow-2xl relative overflow-hidden`}
        >
          <div className="w-20 h-20 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500 mb-8 mx-auto">
            <Settings2 size={40} />
          </div>
          
          <h2 className="text-3xl font-black text-center mb-2 text-slate-900 dark:text-white tracking-tight">Test sozlamalari</h2>
          <p className={`text-center mb-10 font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
            {quiz.title} - {allQuestions.length} ta savol mavjud
          </p>

          <div className="space-y-8">
            <div>
              <label className="block text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
                Savollar sonini tanlang
              </label>
              <div className="grid grid-cols-3 gap-4">
                {[5, 10, 20, 30, 50, allQuestions.length].filter((n, i, self) => n > 0 && n <= allQuestions.length && self.indexOf(n) === i).map(count => (
                  <button
                    key={count}
                    onClick={() => setRequestedCount(count)}
                    className={`py-4 rounded-2xl font-bold transition-all duration-300 border-2 ${
                      requestedCount === count 
                        ? 'border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-lg shadow-indigo-500/20' 
                        : theme === 'dark' ? 'border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700' : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {count === allQuestions.length ? 'Hammasi' : count}
                  </button>
                ))}
              </div>
              
              <div className="mt-8">
                <input 
                  type="range" 
                  min="1" 
                  max={allQuestions.length} 
                  value={requestedCount} 
                  onChange={(e) => setRequestedCount(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <div className="flex justify-between mt-2 text-xs font-bold text-slate-400">
                  <span>1 ta</span>
                  <span className="text-indigo-500 text-sm">{requestedCount} ta savol</span>
                  <span>{allQuestions.length} ta</span>
                </div>
              </div>
            </div>

            <button
              onClick={startQuiz}
              className="w-full py-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg transition-all duration-300 shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-1 flex items-center justify-center gap-3 group"
            >
              Testni boshlash
              <Play size={20} className="group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (isFinished) {
    const percentage = Math.round((score / questions.length) * 100);
    const isSuccess = percentage >= 70;

    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className={`max-w-2xl w-full p-10 rounded-[2.5rem] border backdrop-blur-2xl ${theme === 'dark' ? 'bg-slate-900/90 border-slate-800 shadow-black/50' : 'bg-white/90 border-slate-100 shadow-indigo-500/10'} shadow-2xl text-center relative overflow-hidden`}
        >
          {/* Confetti-like background elements for success */}
          {isSuccess && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
              <motion.div animate={{ y: [0, -100], x: [0, 50], opacity: [1, 0] }} transition={{ duration: 2, repeat: Infinity }} className="absolute bottom-0 left-1/4 w-4 h-4 rounded-full bg-emerald-500" />
              <motion.div animate={{ y: [0, -150], x: [0, -30], opacity: [1, 0] }} transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }} className="absolute bottom-0 left-1/2 w-6 h-6 rounded-full bg-indigo-500" />
              <motion.div animate={{ y: [0, -120], x: [0, 40], opacity: [1, 0] }} transition={{ duration: 2.2, repeat: Infinity, delay: 1 }} className="absolute bottom-0 right-1/4 w-3 h-3 rounded-full bg-amber-500" />
            </div>
          )}
          
          <div className={`w-28 h-28 mx-auto rounded-full flex items-center justify-center mb-8 ${isSuccess ? 'bg-emerald-500/10 text-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-amber-500/10 text-amber-500 shadow-lg shadow-amber-500/20'}`}>
            {isSuccess ? <CheckCircle2 size={56} /> : <AlertCircle size={56} />}
          </div>
          
          <h2 className="text-4xl font-bold mb-3 tracking-tight text-slate-900 dark:text-white">{t('quiz.results')}</h2>
          <p className={`text-lg mb-10 font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{quiz.title}</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            <div className={`p-6 rounded-3xl ${theme === 'dark' ? 'bg-slate-950/50 border border-slate-800' : 'bg-slate-50 border border-slate-100'}`}>
              <p className="text-sm font-medium text-slate-500 mb-2">{t('quiz.score')}</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{score} <span className="text-lg text-slate-400">/ {questions.length}</span></p>
            </div>
            <div className={`p-6 rounded-3xl ${theme === 'dark' ? 'bg-slate-950/50 border border-slate-800' : 'bg-slate-50 border border-slate-100'}`}>
              <p className="text-sm font-medium text-slate-500 mb-2">{t('quiz.percentage')}</p>
              <p className={`text-3xl font-bold ${isSuccess ? 'text-emerald-500' : 'text-amber-500'}`}>{percentage}%</p>
            </div>
            <div className={`p-6 rounded-3xl ${theme === 'dark' ? 'bg-slate-950/50 border border-slate-800' : 'bg-slate-50 border border-slate-100'}`}>
              <p className="text-sm font-medium text-slate-500 mb-2">{t('quiz.correct')}</p>
              <p className="text-3xl font-bold text-emerald-500">{score}</p>
            </div>
            <div className={`p-6 rounded-3xl ${theme === 'dark' ? 'bg-slate-950/50 border border-slate-800' : 'bg-slate-50 border border-slate-100'}`}>
              <p className="text-sm font-medium text-slate-500 mb-2">{t('quiz.incorrect')}</p>
              <p className="text-3xl font-bold text-red-500">{questions.length - score}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => window.location.reload()} 
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all duration-300 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5"
            >
              {t('quiz.retry')}
            </button>
            <button 
              onClick={() => navigate('/dashboard')} 
              className={`w-full sm:w-auto px-8 py-4 rounded-2xl font-semibold transition-all duration-300 border ${theme === 'dark' ? 'border-slate-700 hover:bg-slate-800 text-white' : 'border-slate-200 hover:bg-slate-50 text-slate-900'}`}
            >
              {t('quiz.backToDashboard')}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex) / questions.length) * 100;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1 text-slate-900 dark:text-white tracking-tight">{quiz.title}</h1>
          <div className="flex items-center gap-3">
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide ${theme === 'dark' ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
              {quiz.category}
            </span>
            <p className={`text-xs font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
              {t('quiz.question')} {currentQuestionIndex + 1} / {questions.length}
            </p>
          </div>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-bold text-base shadow-sm border ${timeLeft !== null && timeLeft < 60 ? 'bg-red-500/10 text-red-600 border-red-500/20 animate-pulse' : theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-700'}`}>
          <Clock size={16} className={timeLeft !== null && timeLeft < 60 ? 'text-red-500' : 'text-indigo-500'} />
          {timeLeft !== null ? formatTime(timeLeft) : '--:--'}
        </div>
      </div>

      {/* Progress Bar */}
      <div className={`w-full h-2 rounded-full mb-6 overflow-hidden shadow-inner ${theme === 'dark' ? 'bg-slate-800/80' : 'bg-slate-200/80'} relative`}>
        <motion.div 
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: "circOut" }}
        />
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 40, filter: 'blur(8px)' }}
          animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, x: -40, filter: 'blur(8px)' }}
          transition={{ duration: 0.4, type: 'spring', bounce: 0.2 }}
          className={`p-4 md:p-6 rounded-[1.5rem] border backdrop-blur-2xl ${theme === 'dark' ? 'bg-slate-900/90 border-slate-800 shadow-black/50' : 'bg-white/90 border-slate-100 shadow-indigo-500/5'} shadow-2xl mb-4 relative overflow-hidden`}
        >
          {/* Decorative background number */}
          <div className="absolute -top-4 -right-4 text-[120px] font-black opacity-[0.03] dark:opacity-[0.02] pointer-events-none select-none leading-none">
            {currentQuestionIndex + 1}
          </div>

          <h2 className="text-lg md:text-2xl font-bold mb-6 leading-tight relative z-10 text-slate-900 dark:text-white tracking-tight">
            {currentQuestion.question}
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative z-10">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswers[currentQuestion.id] === option;
              return (
                <motion.button
                  whileHover={{ scale: 1.01, x: 4 }}
                  whileTap={{ scale: 0.99 }}
                  key={index}
                  onClick={() => handleSelectAnswer(option)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-300 group relative overflow-hidden ${
                    isSelected 
                      ? 'border-indigo-500 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 shadow-lg shadow-indigo-500/10' 
                      : theme === 'dark' 
                        ? 'border-slate-800 hover:border-slate-700 bg-slate-950/50 hover:bg-slate-900' 
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3 relative z-10">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 ${
                      isSelected ? 'border-indigo-500 bg-indigo-500/20' : theme === 'dark' ? 'border-slate-700 group-hover:border-slate-500' : 'border-slate-300 group-hover:border-slate-400'
                    }`}>
                      {isSelected && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-2.5 h-2.5 rounded-full bg-indigo-500" />}
                    </div>
                    <span className={`text-sm md:text-base font-medium ${isSelected ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors'}`}>{option}</span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Footer Actions */}
      <div className="flex justify-end">
        <button
          onClick={handleNext}
          disabled={!selectedAnswers[currentQuestion.id] || submitting}
          className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all duration-300 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 group"
        >
          {submitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : currentQuestionIndex === questions.length - 1 ? (
            <>
              {t('quiz.finish')}
              <CheckCircle2 size={18} className="group-hover:scale-110 transition-transform" />
            </>
          ) : (
            <>
              {t('quiz.next')}
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Quiz;
