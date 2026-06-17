import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ShieldAlert, Loader2, LogIn, Lock } from 'lucide-react';
import { motion } from 'motion/react';
import SEO from '../components/SEO';

export default function StockLoginPage() {
  const { login, user, isStockAdmin, loading } = useAuth();
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user && isStockAdmin) {
      navigate('/servizio/stocks');
    } else if (user && !isStockAdmin) {
      setError('Access Denied: Your account is not authorized for the Stock Vault.');
    }
  }, [user, isStockAdmin, navigate]);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    setError('');
    try {
      await login();
    } catch (err) {
      setError('Failed to authenticate. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <SEO title="Stock Vault Access | LET Solutions" noindex={true} />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-zinc-900 rounded-[3rem] border border-white/5 p-12 text-center"
      >
        <div className="w-20 h-20 bg-blue-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-blue-500/20">
          <Lock className="text-blue-500" size={32} />
        </div>

        <h1 className="text-3xl font-display font-black text-white uppercase italic tracking-tighter mb-2">Stock Vault</h1>
        <p className="text-white/30 text-[10px] font-bold uppercase tracking-[0.3em] mb-12">Authorized Personnel Only</p>

        {error && (
          <div className="mb-8 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-500 text-left">
            <ShieldAlert size={20} className="shrink-0" />
            <p className="text-[10px] font-bold uppercase tracking-tight leading-relaxed">{error}</p>
          </div>
        )}

        <button
          onClick={handleLogin}
          disabled={loading || isLoggingIn}
          className="w-full h-16 bg-blue-600 rounded-2xl flex items-center justify-center gap-3 text-white font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-blue-900/30 hover:bg-blue-500 transition-all disabled:opacity-30"
        >
          {loading || isLoggingIn ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <>
              <LogIn size={20} />
              Decrypt & Access
            </>
          )}
        </button>

        <p className="mt-12 text-[8px] font-bold text-white/10 uppercase tracking-[0.4em]">Secure Cryptographic Entry Protocol v2.4</p>
      </motion.div>
    </div>
  );
}
