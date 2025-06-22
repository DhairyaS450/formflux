'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged, User } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  googleSignIn: () => void;
  logOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const googleSignIn = () => {
    console.log("AuthContext: Attempting Google Sign-In...");
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then(async (result) => {
        const user = result.user;
        console.log("AuthContext: Google Sign-In successful for user:", user?.displayName);
        if (user) {
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          if (!userDoc.exists()) {
            console.log("AuthContext: New user, creating document in Firestore.");
            await setDoc(userDocRef, {
              name: user.displayName,
              email: user.email,
              uid: user.uid,
            });
          } else {
            console.log("AuthContext: Existing user document found in Firestore.");
          }
        }
      })
      .catch((error) => {
        console.error("AuthContext: Google Sign-In Error: ", error);
      });
  };

  const logOut = () => {
    console.log("AuthContext: Logging out user.");
    auth.signOut();
  };

  useEffect(() => {
    console.log("AuthContext: Setting up onAuthStateChanged listener.");
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log("AuthContext: onAuthStateChanged triggered. Current user:", currentUser?.displayName || 'None');
      setUser(currentUser);
    });
    return () => {
      console.log("AuthContext: Cleaning up onAuthStateChanged listener.");
      unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, googleSignIn, logOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
