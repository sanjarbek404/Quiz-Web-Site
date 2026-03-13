import { collection, getDocs, doc, getDoc, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirestoreError, OperationType } from '../utils/errorHandlers';

export interface Quiz {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit: number;
  createdAt: string;
}

export interface Question {
  id: string;
  quizId: string;
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface Result {
  id: string;
  userId: string;
  quizId: string;
  score: number;
  percentage: number;
  completedAt: string;
}

export const getQuizzes = async (): Promise<Quiz[]> => {
  try {
    const q = query(collection(db, 'quizzes'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as Quiz);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'quizzes');
    return [];
  }
};

export const getQuizById = async (id: string): Promise<Quiz | null> => {
  try {
    const docRef = doc(db, 'quizzes', id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? (docSnap.data() as Quiz) : null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `quizzes/${id}`);
    return null;
  }
};

export const getQuestionsByQuizId = async (quizId: string): Promise<Question[]> => {
  try {
    const q = query(collection(db, 'questions'), where('quizId', '==', quizId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as Question);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'questions');
    return [];
  }
};

export const getUserResults = async (userId: string): Promise<Result[]> => {
  try {
    const q = query(collection(db, 'results'), where('userId', '==', userId), orderBy('completedAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as Result);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'results');
    return [];
  }
};

export const getUsers = async () => {
  const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data());
};

export const getLeaderboard = async (): Promise<(Result & { userName?: string, quizTitle?: string })[]> => {
  const q = query(collection(db, 'results'), orderBy('score', 'desc'), limit(50));
  const snapshot = await getDocs(q);
  const results = snapshot.docs.map(doc => doc.data() as Result);
  
  const enrichedResults = await Promise.all(results.map(async (result) => {
    let userName = 'Unknown';
    let quizTitle = 'Unknown Quiz';
    
    try {
      const userDoc = await getDoc(doc(db, 'users', result.userId));
      if (userDoc.exists()) userName = userDoc.data().name || 'Unknown';
      
      const quizDoc = await getDoc(doc(db, 'quizzes', result.quizId));
      if (quizDoc.exists()) quizTitle = quizDoc.data().title;
    } catch (e) {
      console.error(e);
    }
    
    return { ...result, userName, quizTitle };
  }));
  
  return enrichedResults;
};

export const getAllResults = async (): Promise<(Result & { userName?: string, userEmail?: string, quizTitle?: string })[]> => {
  const q = query(collection(db, 'results'), orderBy('completedAt', 'desc'));
  const snapshot = await getDocs(q);
  const results = snapshot.docs.map(doc => doc.data() as Result);
  
  const enrichedResults = await Promise.all(results.map(async (result) => {
    let userName = 'Unknown';
    let userEmail = 'Unknown';
    let quizTitle = 'Unknown Quiz';
    
    try {
      const userDoc = await getDoc(doc(db, 'users', result.userId));
      if (userDoc.exists()) {
        userName = userDoc.data().name || 'Unknown';
        userEmail = userDoc.data().email || 'Unknown';
      }
      
      const quizDoc = await getDoc(doc(db, 'quizzes', result.quizId));
      if (quizDoc.exists()) quizTitle = quizDoc.data().title;
    } catch (e) {
      console.error(e);
    }
    
    return { ...result, userName, userEmail, quizTitle };
  }));
  
  return enrichedResults;
};
