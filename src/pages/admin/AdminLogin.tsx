import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../../firebase';
import { useStore } from '../../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, AlertCircle, Loader2 } from 'lucide-react';

const AdminLogin: React.FC = () => {
  const { theme } = useStore();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      if (result.user.email?.toLowerCase() !== 'sanjarbekotabekov010@gmail.com') {
        setError('Kirish taqiqlandi. Siz admin emassiz.');
        setLoading(false);
        return;
      }

      navigate('/admin');
    } catch (err: any) {
      console.error('Login error:', err);
      setError('Google orqali kirishda xatolik yuz berdi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ y: [0, -20, 0], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-500/10 rounded-full filter blur-3xl"
        />
        <motion.div
          animate={{ y: [0, 20, 0], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/10 rounded-full filter blur-3xl"
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-md w-full p-10 rounded-[2.5rem] border shadow-2xl relative z-10 bg-slate-900/90 border-slate-800 backdrop-blur-2xl text-white shadow-black/50"
      >
        <div className="text-center mb-10">
          <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/20 transform -rotate-6 hover:rotate-0 transition-transform duration-300">
            <ShieldAlert className="text-emerald-500" size={40} />
          </div>
          <h2 className="text-4xl font-black tracking-tight mb-3">
            Admin Portal
          </h2>
          <p className="text-base font-medium text-slate-400">
            Faqat Google akkaunt orqali kirish mumkin
          </p>
        </div>
        
        <div className="space-y-5">
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400 text-sm overflow-hidden"
              >
                <AlertCircle size={18} className="shrink-0" />
                <p>{error}</p>
              </motion.div>
            )}
          </AnimatePresence>
          
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-4 px-6 py-4 rounded-2xl bg-white text-slate-900 font-bold hover:bg-slate-100 transition-all duration-300 shadow-xl disabled:opacity-70"
          >
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
            ) : (
              <>
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
                Google bilan kirish
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
