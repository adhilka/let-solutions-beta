import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X, CheckCircle, Info } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  message: string;
  confirmText?: string;
  confirmVariant?: 'danger' | 'primary' | 'success';
  mode?: 'confirm' | 'status';
}

export default function ConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Confirm',
  confirmVariant = 'primary',
  mode = 'confirm'
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (confirmVariant) {
      case 'danger': return <AlertTriangle size={24} />;
      case 'success': return <CheckCircle size={24} />;
      default: return <Info size={24} />;
    }
  };

  const getIconBg = () => {
    switch (confirmVariant) {
      case 'danger': return 'bg-red-50 text-red-600';
      case 'success': return 'bg-green-50 text-green-600';
      default: return 'bg-blue-50 text-blue-600';
    }
  };

  const getButtonClass = () => {
    switch (confirmVariant) {
      case 'danger': return 'bg-red-600 hover:bg-red-700 text-white shadow-red-100';
      case 'success': return 'bg-green-600 hover:bg-green-700 text-white shadow-green-100';
      default: return 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-100';
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden overflow-y-auto max-h-[90vh]"
        >
          <div className="p-8 sm:p-10">
            <div className="flex items-start justify-between mb-8">
              <div className={`p-4 rounded-2xl ${getIconBg()}`}>
                {getIcon()}
              </div>
              <button 
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4 tracking-tight">
              {title}
            </h2>
            <p className="text-slate-600 leading-relaxed mb-10 text-lg">
              {message}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              {mode === 'confirm' && (
                <button
                  onClick={onClose}
                  className="flex-1 px-8 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-all"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={() => {
                  if (onConfirm) onConfirm();
                  onClose();
                }}
                className={`flex-1 px-8 py-4 font-bold rounded-2xl shadow-xl transition-all active:scale-95 text-center ${getButtonClass()}`}
              >
                {confirmText}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
