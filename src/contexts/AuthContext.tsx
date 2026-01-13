import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { User, UserProfile, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  error: string | null;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  reloadUserStatus: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserData = useCallback(async (fbUser: FirebaseUser): Promise<User | null> => {
    try {
      const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
      if (userDoc.exists()) {
        return userDoc.data() as User;
      }
      return null;
    } catch (err) {
      console.error('Error fetching user data:', err);
      return null;
    }
  }, []);

  const createUserDocuments = async (
    fbUser: FirebaseUser,
    displayName: string,
    email: string
  ) => {
    const userDoc: User = {
      uid: fbUser.uid,
      email: email,
      emailLower: email.toLowerCase(),
      displayName: displayName,
      photoURL: fbUser.photoURL || undefined,
      isActive: false, // Always false for new users
      createdAt: new Date().toISOString(),
    };

    const userProfileDoc: UserProfile = {
      uid: fbUser.uid,
      email: email,
      emailLower: email.toLowerCase(),
      displayName: displayName,
      photoURL: fbUser.photoURL || undefined,
      createdAt: new Date().toISOString(),
    };

    await setDoc(doc(db, 'users', fbUser.uid), userDoc, { merge: true });
    await setDoc(doc(db, 'userProfiles', fbUser.uid), userProfileDoc, { merge: true });

    return userDoc;
  };

  useEffect(() => {
    let unsubUser: (() => void) | null = null;
    
    const unsubAuth = onAuthStateChanged(auth, (fbUser) => {
      setFirebaseUser(fbUser);
      
      if (fbUser) {
        // Usar onSnapshot para sincronização em tempo real
        unsubUser = onSnapshot(
          doc(db, 'users', fbUser.uid),
          (docSnapshot) => {
            if (docSnapshot.exists()) {
              setUser(docSnapshot.data() as User);
            } else {
              setUser(null);
            }
            setLoading(false);
          },
          (err) => {
            console.error('Error fetching user data:', err);
            setUser(null);
            setLoading(false);
          }
        );
      } else {
        // Limpar listener do usuário se existir
        if (unsubUser) {
          unsubUser();
          unsubUser = null;
        }
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      unsubAuth();
      if (unsubUser) {
        unsubUser();
      }
    };
  }, []);

  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      setError(null);
      setLoading(true);
      
      const { user: fbUser } = await createUserWithEmailAndPassword(auth, email, password);
      const userData = await createUserDocuments(fbUser, displayName, email);
      setUser(userData);
    } catch (err: any) {
      const message = getFirebaseErrorMessage(err.code);
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      
      const { user: fbUser } = await signInWithEmailAndPassword(auth, email, password);
      const userData = await fetchUserData(fbUser);
      
      if (!userData) {
        // User exists in Auth but not in Firestore - create documents
        const newUserData = await createUserDocuments(fbUser, email.split('@')[0], email);
        setUser(newUserData);
      } else {
        setUser(userData);
      }
    } catch (err: any) {
      const message = getFirebaseErrorMessage(err.code);
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setError(null);
      setLoading(true);
      
      const provider = new GoogleAuthProvider();
      const { user: fbUser } = await signInWithPopup(auth, provider);
      
      let userData = await fetchUserData(fbUser);
      
      if (!userData) {
        // New Google user - create documents
        userData = await createUserDocuments(
          fbUser,
          fbUser.displayName || fbUser.email?.split('@')[0] || 'Usuário',
          fbUser.email || ''
        );
      }
      
      setUser(userData);
    } catch (err: any) {
      const message = getFirebaseErrorMessage(err.code);
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setFirebaseUser(null);
    } catch (err: any) {
      console.error('Error signing out:', err);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setError(null);
      await sendPasswordResetEmail(auth, email);
    } catch (err: any) {
      const message = getFirebaseErrorMessage(err.code);
      setError(message);
      throw new Error(message);
    }
  };

  const reloadUserStatus = async () => {
    if (!firebaseUser) return;
    
    try {
      setLoading(true);
      const userData = await fetchUserData(firebaseUser);
      setUser(userData);
    } catch (err) {
      console.error('Error reloading user status:', err);
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  const value: AuthContextType = {
    user,
    firebaseUser,
    loading,
    error,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
    reloadUserStatus,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

function getFirebaseErrorMessage(code: string): string {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'Este email já está em uso.';
    case 'auth/invalid-email':
      return 'Email inválido.';
    case 'auth/operation-not-allowed':
      return 'Operação não permitida.';
    case 'auth/weak-password':
      return 'A senha é muito fraca. Use pelo menos 6 caracteres.';
    case 'auth/user-disabled':
      return 'Esta conta foi desativada.';
    case 'auth/user-not-found':
      return 'Usuário não encontrado.';
    case 'auth/wrong-password':
      return 'Senha incorreta.';
    case 'auth/too-many-requests':
      return 'Muitas tentativas. Tente novamente mais tarde.';
    case 'auth/popup-closed-by-user':
      return 'Login cancelado.';
    default:
      return 'Ocorreu um erro. Tente novamente.';
  }
}
