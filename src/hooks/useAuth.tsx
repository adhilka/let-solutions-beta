import { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  signInAnonymously
} from 'firebase/auth';
import { authA } from '../lib/firebase/projectA';
import { getReadDb } from '../lib/firebase/loadBalancer';
import { dualWrite } from '../lib/firebase/dualWrite';
import { doc, getDoc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ALLOWED_EMAIL = 'muhammedadhil856@gmail.com';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSharedAdmin, setIsSharedAdmin] = useState(false);

  useEffect(() => {
    const handleAdminToken = async (currentUser: User) => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('adminToken');
      
      let uid = currentUser.uid;
      let sessionValid = false;

      if (token) {
        try {
          // write session to db using dualWrite
          await dualWrite(['artifacts', 'tech-institute', 'public', 'data', 'admin_sessions', uid], {
            linkId: token,
            createdAt: new Date().toISOString()
          });

          const db = getReadDb();
          const linkSnapshot = await getDoc(doc(db, 'artifacts/tech-institute/public/data/admin_links', token));
          
          if (linkSnapshot.exists() && linkSnapshot.data().expiresAt.toDate() > new Date()) {
            sessionValid = true;
          }
          
          // remove token from url immediately
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (e) {
          console.error("Failed to assume shared admin state", e);
        }
      } else {
        // Check if existing session is valid
        try {
          const db = getReadDb();
          const sessionSnapshot = await getDoc(doc(db, 'artifacts/tech-institute/public/data/admin_sessions', uid));
          if (sessionSnapshot.exists()) {
             const linkId = sessionSnapshot.data().linkId;
             const linkSnapshot = await getDoc(doc(db, 'artifacts/tech-institute/public/data/admin_links', linkId));
             if (linkSnapshot.exists() && linkSnapshot.data().expiresAt.toDate() > new Date()) {
               sessionValid = true;
             }
          }
        } catch (e) {
          // not found or no permission
        }
      }

      setIsSharedAdmin(sessionValid);
    };

    const unsubscribe = onAuthStateChanged(authA, async (user) => {
      setUser(user);
      
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('adminToken');
      
      if (!user && token) {
        // Sign in anonymously to assume the session
        try {
          const cred = await signInAnonymously(authA);
          await handleAdminToken(cred.user);
        } catch (e) {
          console.error(e);
        }
      } else if (user) {
        await handleAdminToken(user);
      } else {
        setIsSharedAdmin(false);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(authA, provider);
  };

  const logout = async () => {
    await signOut(authA);
  };

  const isAdmin = (user?.email === ALLOWED_EMAIL && user?.emailVerified) || isSharedAdmin;

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
