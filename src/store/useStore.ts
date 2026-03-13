import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Quiz, Result } from '../services/quizService';

interface AppState {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  language: string;
  setLanguage: (lang: string) => void;
  quizzes: Quiz[];
  results: Result[];
  leaderboard: (Result & { userName?: string, quizTitle?: string })[];
  setQuizzes: (quizzes: Quiz[]) => void;
  setResults: (results: Result[]) => void;
  setLeaderboard: (leaderboard: (Result & { userName?: string, quizTitle?: string })[]) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      theme: 'dark', // default to dark for modern SaaS look
      toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
      language: 'uz',
      setLanguage: (lang) => set({ language: lang }),
      quizzes: [],
      results: [],
      leaderboard: [],
      setQuizzes: (quizzes) => set({ quizzes }),
      setResults: (results) => set({ results }),
      setLeaderboard: (leaderboard) => set({ leaderboard }),
    }),
    {
      name: 'it-quiz-storage',
    }
  )
);
