import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Code2, Timer, LineChart, Trophy, Layout, ShieldCheck, Database, FileJson, ArrowRight, UserPlus, PlayCircle, Award, Star, Quote } from 'lucide-react';
import { useStore } from '../store/useStore';

const Landing: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useStore();

  const features = [
    { icon: <Timer className="w-6 h-6 text-indigo-500" />, title: t('features.timer') },
    { icon: <LineChart className="w-6 h-6 text-emerald-500" />, title: t('features.progress') },
    { icon: <Layout className="w-6 h-6 text-blue-500" />, title: t('features.analytics') },
    { icon: <Database className="w-6 h-6 text-purple-500" />, title: t('features.categories') },
    { icon: <Trophy className="w-6 h-6 text-amber-500" />, title: t('features.leaderboards') },
  ];

  const categories = [
    { icon: <FileJson className="w-8 h-8 text-orange-500" />, name: t('categories.html') },
    { icon: <Code2 className="w-8 h-8 text-blue-500" />, name: t('categories.css') },
    { icon: <FileJson className="w-8 h-8 text-yellow-500" />, name: t('categories.javascript') },
    { icon: <Code2 className="w-8 h-8 text-cyan-500" />, name: t('categories.react') },
    { icon: <FileJson className="w-8 h-8 text-blue-600" />, name: t('categories.typescript') },
    { icon: <ShieldCheck className="w-8 h-8 text-emerald-500" />, name: t('categories.cybersecurity') },
    { icon: <Database className="w-8 h-8 text-slate-500" />, name: t('categories.networking') },
    { icon: <Layout className="w-8 h-8 text-purple-500" />, name: t('categories.algorithms') },
  ];

  const steps = [
    { icon: <UserPlus className="w-8 h-8 text-indigo-500" />, title: "Ro'yxatdan o'ting", desc: "Platformada o'z hisobingizni yarating va tizimga kiring." },
    { icon: <PlayCircle className="w-8 h-8 text-emerald-500" />, title: "Testni tanlang", desc: "O'zingizga qiziq bo'lgan yo'nalish va qiyinchilik darajasini tanlang." },
    { icon: <Award className="w-8 h-8 text-amber-500" />, title: "Natijaga erishing", desc: "Testni ishlagach, o'z natijangizni ko'ring va reytingda ko'tariling." }
  ];

  const testimonials = [
    { name: "Sardorbek", role: "Frontend Dasturchi", text: "Bu platforma orqali React bo'yicha bilimlarimni ancha mustahkamlab oldim. Savollar juda sifatli tuzilgan.", rating: 5 },
    { name: "Malika", role: "Talaba", text: "Interfeys juda qulay va zamonaviy. Test ishlash jarayoni umuman zerikarli emas. Barchaga tavsiya qilaman!", rating: 5 },
    { name: "Jamshid", role: "Backend Dasturchi", text: "O'z ustimda ishlash uchun ajoyib vosita. Ayniqsa reyting tizimi raqobatbardoshlikni oshiradi.", rating: 4 }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-20 pb-24 flex items-center justify-center overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              y: [0, -40, 0],
              x: [0, 30, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/4 left-10 w-[500px] h-[500px] bg-indigo-500/10 rounded-full mix-blend-multiply filter blur-3xl dark:opacity-20"
          />
          <motion.div
            animate={{
              y: [0, 40, 0],
              x: [0, -30, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-1/4 right-10 w-[600px] h-[600px] bg-emerald-500/10 rounded-full mix-blend-multiply filter blur-3xl dark:opacity-20"
          />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col lg:flex-row items-center gap-16">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex-1 text-center lg:text-left"
          >
            <motion.span 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-sm font-bold mb-8 shadow-sm border border-indigo-100 dark:border-indigo-800/50"
            >
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
              IT Quiz platformasi
            </motion.span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-4 leading-[1.1] text-slate-900 dark:text-white">
              Bilimingizni <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-emerald-500 dark:from-indigo-400 dark:to-emerald-400">sinab ko'ring</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 mb-12 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium">
              {t('hero.subtitle')}
            </p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
            >
              <Link to="/register" className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold hover:scale-105 transition-all duration-300 shadow-xl shadow-slate-900/20 dark:shadow-white/10 flex items-center justify-center gap-3 text-lg group">
                {t('hero.getStarted')} <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40, rotateY: 20 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            transition={{ duration: 1, delay: 0.3, type: "spring", bounce: 0.4 }}
            className="flex-1 hidden lg:block perspective-1000"
          >
            <div className={`relative w-full aspect-square max-w-lg mx-auto rounded-[3rem] border-8 ${theme === 'dark' ? 'border-slate-800 bg-slate-900/80' : 'border-white bg-slate-50/80'} shadow-2xl overflow-hidden backdrop-blur-xl transform rotate-y-[-10deg] rotate-x-[5deg] hover:rotate-y-0 hover:rotate-x-0 transition-transform duration-700`}>
              {/* Mock UI Header */}
              <div className={`h-16 border-b ${theme === 'dark' ? 'border-slate-800' : 'border-slate-200'} flex items-center px-6 gap-4`}>
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                </div>
                <div className={`flex-1 h-8 rounded-lg ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-200'} flex items-center justify-center`}>
                  <span className="text-xs font-mono text-slate-500">it-quiz.uz/test/react</span>
                </div>
              </div>
              {/* Mock UI Content */}
              <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                  <div className={`h-8 w-32 rounded-full ${theme === 'dark' ? 'bg-indigo-500/20' : 'bg-indigo-100'}`} />
                  <div className={`h-8 w-16 rounded-full ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-200'}`} />
                </div>
                <div className={`h-12 w-3/4 rounded-xl mb-8 ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-200'}`} />
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className={`h-16 w-full rounded-2xl border-2 ${theme === 'dark' ? 'border-slate-800 bg-slate-800/50' : 'border-slate-200 bg-white'} ${i === 2 ? (theme === 'dark' ? '!border-indigo-500 !bg-indigo-500/20' : '!border-indigo-500 !bg-indigo-50') : ''} flex items-center px-6 gap-4`}>
                      <div className={`w-6 h-6 rounded-full border-2 ${i === 2 ? 'border-indigo-500 bg-indigo-500' : (theme === 'dark' ? 'border-slate-600' : 'border-slate-300')}`} />
                      <div className={`h-4 w-1/2 rounded-full ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'}`} />
                    </div>
                  ))}
                </div>
              </div>
              {/* Floating Badge */}
              <motion.div 
                animate={{ y: [-10, 10, -10] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -right-6 top-32 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                  <Trophy size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Natija</p>
                  <p className="text-xl font-black text-slate-900 dark:text-white">95%</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {features.map((feature, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: index * 0.1, type: "spring", bounce: 0.4 }}
                whileHover={{ y: -5 }}
                className={`p-8 rounded-[2rem] border ${theme === 'dark' ? 'bg-slate-900/50 border-slate-800 hover:bg-slate-800/80' : 'bg-white/80 border-slate-100 hover:bg-white'} shadow-sm hover:shadow-xl transition-all duration-300 backdrop-blur-xl group relative overflow-hidden`}
              >
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
                <div className="mb-6 w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300 shadow-sm relative z-10">
                  {feature.icon}
                </div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 relative z-10">{feature.title}</h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Showcase */}
      <section className="py-32 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black mb-6 text-slate-900 dark:text-white tracking-tight">Kategoriyalar</h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-medium">Turli xil yo'nalishlar bo'yicha o'z bilimingizni sinab ko'ring va reytingda ko'tariling.</p>
          </motion.div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {categories.map((cat, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.05, type: "spring", bounce: 0.4 }}
                className={`p-8 md:p-10 rounded-[2.5rem] border ${theme === 'dark' ? 'bg-slate-900/50 border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800/80' : 'bg-white/80 border-slate-100 hover:border-indigo-500/30 hover:bg-white'} transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 group cursor-pointer flex flex-col items-center text-center backdrop-blur-xl`}
              >
                <div className="mb-8 p-4 rounded-3xl bg-slate-50 dark:bg-slate-800/50 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-sm">
                  {cat.icon}
                </div>
                <h3 className="font-bold text-lg md:text-xl text-slate-900 dark:text-slate-100">{cat.name}</h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className={`py-32 relative z-10 ${theme === 'dark' ? 'bg-slate-900/30' : 'bg-slate-50/50'}`}>
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-black mb-6 text-slate-900 dark:text-white tracking-tight">Qanday ishlaydi?</h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-medium">Uchta oddiy qadam bilan o'z bilimingizni sinashni boshlang.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-indigo-500/20 via-emerald-500/20 to-amber-500/20 -translate-y-1/2 z-0" />
            
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="relative z-10 flex flex-col items-center text-center"
              >
                <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center mb-8 shadow-2xl ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} border-2 transform hover:scale-110 hover:rotate-3 transition-all duration-300`}>
                  {step.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">{step.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 font-medium max-w-xs">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-32 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-black mb-6 text-slate-900 dark:text-white tracking-tight">Foydalanuvchilar fikri</h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-medium">Platformamiz haqida boshqalar nima deydi?</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`p-8 rounded-[2.5rem] border ${theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-slate-100'} shadow-xl backdrop-blur-xl relative group hover:-translate-y-2 transition-transform duration-300`}
              >
                <Quote className="absolute top-8 right-8 w-12 h-12 text-indigo-500/10 group-hover:text-indigo-500/20 transition-colors" />
                <div className="flex gap-1 mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-500 text-amber-500" />
                  ))}
                </div>
                <p className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-8 leading-relaxed">"{testimonial.text}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">{testimonial.name}</h4>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative z-10">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative rounded-[3rem] overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800" />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
            
            <div className="relative p-12 md:p-20 text-center flex flex-col items-center">
              <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">O'z bilimingizni hoziroq sinab ko'ring</h2>
              <p className="text-xl text-indigo-100 mb-12 max-w-2xl font-medium">Minglab foydalanuvchilar qatoriga qo'shiling va o'z sohangizning eng yaxshisi ekanligingizni isbotlang.</p>
              
              <Link to="/register" className="px-10 py-5 rounded-2xl bg-white text-indigo-600 font-black text-lg hover:scale-105 transition-all duration-300 shadow-2xl shadow-indigo-900/50 flex items-center gap-3 group">
                Boshlash <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
