import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, Save, AlertCircle, Upload, ArrowRight, ArrowLeft } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useStore } from '../../store/useStore';

interface CreateQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateQuizModal: React.FC<CreateQuizModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { theme } = useStore();
  const [step, setStep] = useState(1);
  const [importMode, setImportMode] = useState<'manual' | 'bulk'>('manual');
  const [bulkText, setBulkText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Quiz Details
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Frontend');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [timeLimit, setTimeLimit] = useState(10);

  // Questions
  const [questions, setQuestions] = useState([
    { question: '', options: ['', '', '', ''], correctAnswerIndex: 0 }
  ]);

  const handleAddQuestion = () => {
    setQuestions([...questions, { question: '', options: ['', '', '', ''], correctAnswerIndex: 0 }]);
  };

  const handleRemoveQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const handleQuestionChange = (index: number, field: string, value: any) => {
    const newQuestions = [...questions];
    if (field === 'question') {
      newQuestions[index].question = value;
    } else if (field === 'correctAnswerIndex') {
      newQuestions[index].correctAnswerIndex = value;
    }
    setQuestions(newQuestions);
  };

  const handleOptionChange = (qIndex: number, oIndex: number, value: string) => {
    const newQuestions = [...questions];
    if (value.includes('*')) {
      newQuestions[qIndex].correctAnswerIndex = oIndex;
      value = value.replace(/\*/g, '').trim();
    }
    newQuestions[qIndex].options[oIndex] = value;
    setQuestions(newQuestions);
  };

  const handleBulkImport = () => {
    setError('');
    if (!bulkText.trim()) {
      setError('Iltimos, savollarni kiriting.');
      return;
    }

    const blocks = bulkText.split(/\n\s*\n/);
    const parsedQuestions = blocks.map(block => {
      const lines = block.split('\n').map(l => l.trim()).filter(l => l);
      if (lines.length < 3) return null;
      
      let question = lines[0].replace(/\*/g, '').trim();
      const options: string[] = [];
      let correctAnswerIndex = 0;
      
      for (let i = 1; i < lines.length; i++) {
        let line = lines[i];
        if (line.includes('*')) {
          correctAnswerIndex = i - 1;
          line = line.replace(/\*/g, '').trim();
        }
        options.push(line);
      }
      
      // Ensure exactly 4 options
      while (options.length < 4) {
        options.push(`Variant ${options.length + 1}`);
      }
      
      return { 
        question, 
        options: options.slice(0, 4), 
        correctAnswerIndex: Math.min(correctAnswerIndex, 3) 
      };
    }).filter(q => q !== null);

    if (parsedQuestions.length > 0) {
      setQuestions(parsedQuestions as any);
      setImportMode('manual');
      setBulkText('');
    } else {
      setError('Savollarni o\'qib bo\'lmadi. Formatni tekshiring.');
    }
  };

  const handleSave = async () => {
    setError('');
    
    // Validation
    if (!title || !description) {
      setError('Please fill in all quiz details.');
      return;
    }
    
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question || q.options.some(opt => !opt)) {
        setError(`Please fill in all fields for Question ${i + 1}`);
        return;
      }
    }

    setLoading(true);
    try {
      const quizId = `quiz_${Date.now()}`;
      
      // Save Quiz
      await setDoc(doc(db, 'quizzes', quizId), {
        id: quizId,
        title,
        description,
        category,
        difficulty,
        timeLimit: Number(timeLimit),
        createdAt: new Date().toISOString()
      });

      // Save Questions
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        const questionId = `q_${quizId}_${i}`;
        await setDoc(doc(db, 'questions', questionId), {
          id: questionId,
          quizId,
          question: q.question,
          options: q.options,
          correctAnswer: q.options[q.correctAnswerIndex]
        });
      }

      onSuccess();
      onClose();
      // Reset form
      setStep(1);
      setTitle('');
      setDescription('');
      setQuestions([{ question: '', options: ['', '', '', ''], correctAnswerIndex: 0 }]);
    } catch (err: any) {
      console.error('Error saving quiz:', err);
      setError(err.message || 'Failed to save quiz');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
          className={`relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] shadow-2xl border ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white shadow-black/50' : 'bg-white border-slate-100 text-slate-900 shadow-indigo-500/10'}`}
        >
          <div className="sticky top-0 z-20 flex items-center justify-between p-6 sm:px-10 border-b backdrop-blur-xl bg-inherit/80 border-inherit">
            <h2 className="text-3xl font-black tracking-tight">Yangi Test Yaratish</h2>
            <button onClick={onClose} className={`p-3 rounded-2xl transition-colors ${theme === 'dark' ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'}`}>
              <X size={24} />
            </button>
          </div>

          <div className="p-6 sm:p-10">
            {step === 1 && error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-500 text-sm font-medium"
              >
                <AlertCircle size={20} className="shrink-0" />
                <p>{error}</p>
              </motion.div>
            )}

            {step === 1 ? (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-black text-xl shadow-lg shadow-indigo-500/20">1</div>
                  <h3 className="text-2xl font-bold tracking-tight">Test Ma'lumotlari</h3>
                </div>
                
                <div className="space-y-8">
                  <div>
                    <label className="block text-sm font-bold mb-3 text-slate-700 dark:text-slate-300 uppercase tracking-wider">Sarlavha</label>
                    <input 
                      type="text" 
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className={`w-full px-6 py-5 rounded-2xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 text-lg font-medium ${theme === 'dark' ? 'bg-slate-950/50 border-slate-800 focus:bg-slate-900' : 'bg-slate-50 border-slate-200 focus:bg-white'}`}
                      placeholder="Masalan: Advanced React Patterns"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-3 text-slate-700 dark:text-slate-300 uppercase tracking-wider">Tavsif</label>
                    <textarea 
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                      className={`w-full px-6 py-5 rounded-2xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 resize-none text-lg font-medium ${theme === 'dark' ? 'bg-slate-950/50 border-slate-800 focus:bg-slate-900' : 'bg-slate-50 border-slate-200 focus:bg-white'}`}
                      placeholder="Ushbu test nimalarni o'z ichiga olishi haqida qisqacha ma'lumot..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                      <label className="block text-sm font-bold mb-3 text-slate-700 dark:text-slate-300 uppercase tracking-wider">Kategoriya</label>
                      <select 
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className={`w-full px-6 py-5 rounded-2xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 appearance-none text-lg font-medium ${theme === 'dark' ? 'bg-slate-950/50 border-slate-800 focus:bg-slate-900' : 'bg-slate-50 border-slate-200 focus:bg-white'}`}
                      >
                        <option value="Frontend">Frontend</option>
                        <option value="Backend">Backend</option>
                        <option value="Fullstack">Fullstack</option>
                        <option value="DevOps">DevOps</option>
                        <option value="Mobile">Mobile</option>
                        <option value="Git & GitHub">Git & GitHub</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-3 text-slate-700 dark:text-slate-300 uppercase tracking-wider">Qiyinchilik</label>
                      <select 
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value as any)}
                        className={`w-full px-6 py-5 rounded-2xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 appearance-none text-lg font-medium ${theme === 'dark' ? 'bg-slate-950/50 border-slate-800 focus:bg-slate-900' : 'bg-slate-50 border-slate-200 focus:bg-white'}`}
                      >
                        <option value="easy">Oson</option>
                        <option value="medium">O'rtacha</option>
                        <option value="hard">Qiyin</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-3 text-slate-700 dark:text-slate-300 uppercase tracking-wider">Vaqt (daqiqa)</label>
                      <input 
                        type="number" 
                        min="1"
                        value={timeLimit}
                        onChange={(e) => setTimeLimit(Number(e.target.value))}
                        className={`w-full px-6 py-5 rounded-2xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 text-lg font-medium ${theme === 'dark' ? 'bg-slate-950/50 border-slate-800 focus:bg-slate-900' : 'bg-slate-50 border-slate-200 focus:bg-white'}`}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-10 mt-10 border-t border-slate-200 dark:border-slate-800">
                  <button 
                    onClick={() => setStep(2)}
                    className="flex items-center gap-3 px-10 py-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg transition-all duration-300 shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-1"
                  >
                    Keyingisi: Savollar qo'shish <ArrowRight size={24} />
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-black text-xl shadow-lg shadow-indigo-500/20">2</div>
                    <h3 className="text-2xl font-bold tracking-tight">Savollar ({questions.length})</h3>
                  </div>
                  <div className={`flex p-2 rounded-2xl ${theme === 'dark' ? 'bg-slate-950/50 border border-slate-800' : 'bg-slate-100 border border-slate-200'} shadow-inner`}>
                    <button
                      onClick={() => setImportMode('manual')}
                      className={`px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${importMode === 'manual' ? (theme === 'dark' ? 'bg-slate-800 text-white shadow-lg' : 'bg-white text-slate-900 shadow-md') : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                      Qo'lda
                    </button>
                    <button
                      onClick={() => setImportMode('bulk')}
                      className={`px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${importMode === 'bulk' ? (theme === 'dark' ? 'bg-slate-800 text-white shadow-lg' : 'bg-white text-slate-900 shadow-md') : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                      Ommaviy Import
                    </button>
                  </div>
                </div>

                {importMode === 'bulk' ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-8 sm:p-10 rounded-[2.5rem] border shadow-lg ${theme === 'dark' ? 'bg-slate-950/30 border-slate-800 shadow-black/20' : 'bg-slate-50/50 border-slate-200 shadow-slate-200/50'}`}
                  >
                    <h4 className="font-bold mb-4 text-xl tracking-tight">Ommaviy qo'shish formati (100-200 ta savol uchun):</h4>
                    <p className="text-slate-500 dark:text-slate-400 mb-8 text-lg leading-relaxed">
                      Har bir savolni bo'sh qator bilan ajrating. To'g'ri javob oldiga yulduzcha (*) qo'ying.
                    </p>
                    <div className={`p-8 rounded-3xl mb-8 text-base font-mono leading-relaxed border shadow-inner ${theme === 'dark' ? 'bg-slate-900/50 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-600'}`}>
                      Git nima?<br/>
                      <span className="text-emerald-500 font-bold">*Versiyalarni boshqarish tizimi</span><br/>
                      Ma'lumotlar bazasi<br/>
                      Dasturlash tili<br/>
                      Operatsion tizim<br/>
                      <br/>
                      GitHub nima?<br/>
                      Brauzer<br/>
                      <span className="text-emerald-500 font-bold">*Git repozitoriylari uchun xosting</span><br/>
                      Matn muharriri<br/>
                      Fayl menejeri
                    </div>
                    <textarea
                      value={bulkText}
                      onChange={(e) => setBulkText(e.target.value)}
                      rows={12}
                      className={`w-full px-8 py-6 rounded-3xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 resize-none text-lg font-medium shadow-inner ${theme === 'dark' ? 'bg-slate-900/50 border-slate-700 focus:bg-slate-900' : 'bg-white border-slate-300 focus:bg-slate-50'}`}
                      placeholder="Savollarni shu yerga tashlang..."
                    />
                    <div className="mt-8 flex justify-end">
                      <button
                        onClick={handleBulkImport}
                        className="flex items-center gap-3 px-10 py-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg transition-all duration-300 shadow-xl shadow-indigo-500/30 hover:-translate-y-1"
                      >
                        <Upload size={24} /> Import qilish
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <div className="space-y-8">
                    <div className="flex justify-end">
                      <button 
                        onClick={handleAddQuestion}
                        className={`flex items-center gap-3 px-8 py-4 rounded-2xl border font-bold text-lg transition-all duration-300 shadow-sm hover:shadow-md ${theme === 'dark' ? 'border-slate-700 hover:bg-slate-800 text-slate-300' : 'border-slate-300 hover:bg-slate-100 text-slate-700'}`}
                      >
                        <Plus size={24} /> Savol qo'shish
                      </button>
                    </div>
                    <div className="space-y-10">
                      {questions.map((q, qIndex) => (
                        <motion.div 
                          key={qIndex} 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`p-8 sm:p-10 rounded-[2.5rem] border relative group transition-all duration-300 shadow-lg ${theme === 'dark' ? 'bg-slate-950/30 border-slate-800 hover:border-slate-700 shadow-black/20' : 'bg-slate-50/50 border-slate-200 hover:border-slate-300 shadow-slate-200/50'}`}
                        >
                          {questions.length > 1 && (
                            <button 
                              onClick={() => handleRemoveQuestion(qIndex)}
                              className="absolute top-8 right-8 p-4 text-red-500 hover:bg-red-500/10 rounded-2xl transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                            >
                              <Trash2 size={24} />
                            </button>
                          )}
                          
                          <div className="mb-10 pr-16">
                            <label className="block text-sm font-bold mb-4 text-slate-700 dark:text-slate-300 uppercase tracking-wider">Savol {qIndex + 1}</label>
                            <input 
                              type="text" 
                              value={q.question}
                              onChange={(e) => handleQuestionChange(qIndex, 'question', e.target.value)}
                              className={`w-full px-8 py-6 rounded-3xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 text-xl font-medium shadow-inner ${theme === 'dark' ? 'bg-slate-900/50 border-slate-700 focus:bg-slate-900' : 'bg-white border-slate-300 focus:bg-slate-50'}`}
                              placeholder="Savol matnini kiriting..."
                            />
                          </div>

                          <div className="space-y-6">
                            <label className="block text-sm font-bold mb-4 text-slate-700 dark:text-slate-300 uppercase tracking-wider">Variantlar va To'g'ri javob</label>
                            {q.options.map((opt, oIndex) => (
                              <div key={oIndex} className="flex items-center gap-6">
                                <div className="relative flex items-center justify-center">
                                  <input 
                                    type="radio" 
                                    name={`correct-${qIndex}`}
                                    checked={q.correctAnswerIndex === oIndex}
                                    onChange={() => handleQuestionChange(qIndex, 'correctAnswerIndex', oIndex)}
                                    className="w-8 h-8 text-emerald-500 border-slate-300 focus:ring-emerald-500 cursor-pointer transition-all duration-300"
                                  />
                                </div>
                                <input 
                                  type="text" 
                                  value={opt}
                                  onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                                  className={`flex-grow px-8 py-5 rounded-2xl border focus:outline-none focus:ring-2 transition-all duration-300 text-lg font-medium shadow-sm ${
                                    q.correctAnswerIndex === oIndex 
                                      ? (theme === 'dark' ? 'border-emerald-500/50 bg-emerald-500/10 focus:ring-emerald-500 shadow-emerald-500/10' : 'border-emerald-500 bg-emerald-50 focus:ring-emerald-500 shadow-emerald-500/10')
                                      : (theme === 'dark' ? 'bg-slate-900/50 border-slate-700 focus:ring-indigo-500' : 'bg-white border-slate-300 focus:ring-indigo-500')
                                  }`}
                                  placeholder={`Variant ${oIndex + 1}`}
                                />
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-6 pt-10 mt-10 border-t border-slate-200 dark:border-slate-800">
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-5 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-4 text-red-500 text-base font-bold"
                    >
                      <AlertCircle size={24} className="shrink-0" />
                      <p>{error}</p>
                    </motion.div>
                  )}
                  <div className="flex items-center justify-between">
                    <button 
                      onClick={() => setStep(1)}
                      className={`flex items-center gap-3 px-8 py-5 rounded-2xl border font-bold text-lg transition-all duration-300 shadow-sm hover:shadow-md ${theme === 'dark' ? 'border-slate-700 hover:bg-slate-800 text-slate-300' : 'border-slate-300 hover:bg-slate-100 text-slate-700'}`}
                    >
                      <ArrowLeft size={24} /> Orqaga
                    </button>
                    {importMode === 'manual' && (
                      <button 
                        onClick={handleSave}
                        disabled={loading}
                        className="flex items-center gap-3 px-10 py-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg transition-all duration-300 shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:-translate-y-1 disabled:opacity-50 disabled:hover:translate-y-0"
                      >
                        {loading ? 'Saqlanmoqda...' : (
                          <>
                            <Save size={24} /> Testni Saqlash
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CreateQuizModal;
