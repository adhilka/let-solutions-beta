import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LogIn, Loader2, AlertCircle } from 'lucide-react';
import SEO from '../components/SEO';

export default function LoginPage() {
  const { login, user, isAdmin, loading } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setIsLoggingIn(true);
    setError(null);
    try {
      await login();
      // After login, useAuth state updates.
      // We check if the logged in user is admin in the next render cycle via useEffect or just let the route guard handle it.
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // If already logged in and admin, go to dashboard
  if (user && isAdmin) {
    navigate('/admin', { replace: true });
    return null;
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <SEO title="Admin Login" noindex />
      <div className="max-w-md w-full bg-[var(--color-surface-alt)] rounded-3xl shadow-xl p-8 border border-[var(--color-border)]">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[var(--color-primary-900)] text-[var(--color-primary-400)] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[var(--color-primary-800)]">
            <LogIn size={32} />
          </div>
          <h1 className="text-2xl font-bold text-white uppercase tracking-tight">Admin Login</h1>
          <p className="text-[var(--color-text-secondary)] mt-2">Sign in with your Google account to access variables</p>
        </div>

        {user && !isAdmin && (
          <div className="mb-6 p-4 bg-red-950/30 border border-red-900/50 rounded-xl flex items-start gap-3 text-red-200">
            <AlertCircle size={20} className="flex-shrink-0" />
            <div className="text-sm font-medium">
              Access denied. Your email ({user.email}) is not authorized to access the admin panel.
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-950/30 border border-red-900/50 rounded-xl flex items-start gap-3 text-red-200">
            <AlertCircle size={20} className="flex-shrink-0" />
            <div className="text-sm font-medium">{error}</div>
          </div>
        )}

        <button
          onClick={handleLogin}
          disabled={isLoggingIn}
          className="w-full btn-primary py-4 flex items-center justify-center gap-3 text-lg"
        >
          {isLoggingIn ? (
            <Loader2 className="animate-spin" size={24} />
          ) : (
            <>
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6 bg-white rounded-full p-0.5" />
              Sign in with Google
            </>
          )}
        </button>
        
        <div className="mt-8 pt-6 border-t border-[var(--color-border)] text-center">
          <button 
            onClick={() => navigate('/')}
            className="text-[var(--color-text-tertiary)] hover:text-white font-medium transition"
          >
            Back to Public Site
          </button>
        </div>
      </div>
    </div>
  );
}
