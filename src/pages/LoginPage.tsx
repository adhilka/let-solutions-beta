import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LogIn, Loader2, AlertCircle } from 'lucide-react';

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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-slate-200">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <LogIn size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Login</h1>
          <p className="text-slate-500 mt-2">Sign in with your Google account to access variables</p>
        </div>

        {user && !isAdmin && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700">
            <AlertCircle size={20} className="flex-shrink-0" />
            <div className="text-sm font-medium">
              Access denied. Your email ({user.email}) is not authorized to access the admin panel.
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700">
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
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
              Sign in with Google
            </>
          )}
        </button>
        
        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <button 
            onClick={() => navigate('/')}
            className="text-slate-500 hover:text-blue-600 font-medium transition"
          >
            Back to Public Site
          </button>
        </div>
      </div>
    </div>
  );
}
