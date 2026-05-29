import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Search, GraduationCap, MessageCircle } from 'lucide-react';
import SEO from '../components/SEO';
import { motion } from 'motion/react';

export default function NotFoundPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-black py-20 px-4">
      <SEO title="404 - Page Not Found" noindex />
      
      <div className="max-w-2xl w-full text-center">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.5 }}
        >
          {/* Animated 404 Icon */}
          <div className="relative inline-block mb-8">
            <div className="text-9xl font-display font-black text-slate-800 select-none">404</div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 bg-[var(--color-primary-600)] rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-indigo-900/50 animate-bounce">
                <Search size={48} />
              </div>
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-display font-extrabold text-white mb-4 tracking-tight uppercase">
            Oops! This technical link is broken.
          </h1>
          <p className="text-[var(--color-text-secondary)] text-lg mb-12 max-w-lg mx-auto">
            The page you are looking for might have been moved, renamed, or is temporarily offline. Don't worry, our systems are fine!
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
            <Link 
              to="/" 
              className="group p-6 bg-[var(--color-surface-alt)] rounded-3xl border border-[var(--color-border)] shadow-sm hover:border-[var(--color-primary-600)] transition-all flex flex-col items-center"
            >
              <div className="w-12 h-12 bg-black text-slate-400 group-hover:bg-[var(--color-primary-900)] group-hover:text-[var(--color-primary-400)] rounded-2xl flex items-center justify-center mb-3 transition-colors">
                <Home size={24} />
              </div>
              <span className="font-bold text-white">Home</span>
            </Link>

            <Link 
              to="/courses" 
              className="group p-6 bg-[var(--color-surface-alt)] rounded-3xl border border-[var(--color-border)] shadow-sm hover:border-[var(--color-primary-600)] transition-all flex flex-col items-center"
            >
              <div className="w-12 h-12 bg-black text-slate-400 group-hover:bg-[var(--color-primary-900)] group-hover:text-[var(--color-primary-400)] rounded-2xl flex items-center justify-center mb-3 transition-colors">
                <GraduationCap size={24} />
              </div>
              <span className="font-bold text-white">Courses</span>
            </Link>

            <Link 
              to="/contact" 
              className="group p-6 bg-[var(--color-surface-alt)] rounded-3xl border border-[var(--color-border)] shadow-sm hover:border-[var(--color-primary-600)] transition-all flex flex-col items-center"
            >
              <div className="w-12 h-12 bg-black text-slate-400 group-hover:bg-[var(--color-primary-900)] group-hover:text-[var(--color-primary-400)] rounded-2xl flex items-center justify-center mb-3 transition-colors">
                <MessageCircle size={24} />
              </div>
              <span className="font-bold text-white">Contact</span>
            </Link>
          </div>

          <Link 
            to="#" 
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 text-[var(--color-primary-400)] font-bold hover:gap-3 transition-all uppercase tracking-tight"
          >
            <ArrowLeft size={18} /> Go Back
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
