import React from 'react';
import { motion } from 'motion/react';
import { useGlobalSettings } from '../../hooks/useGlobalSettings';

export default function InitialLoader() {
  const { settings } = useGlobalSettings();

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="fixed inset-0 z-[9999] bg-[var(--color-surface)] flex flex-col items-center justify-center p-6"
    >
      <div className="relative flex flex-col items-center justify-center">
        {/* Circular Progress Container */}
        <div className="relative w-24 h-24 flex items-center justify-center">
          {/* Logo in center */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute inset-0 flex items-center justify-center z-10"
          >
            <img 
              src={settings?.branding?.faviconUrl || "https://i.ibb.co/DDmJMDzP/1000107715.png"} 
              alt="Icon" 
              className="w-12 h-12 object-contain brightness-0 invert"
            />
          </motion.div>

          {/* Background Circle */}
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle
              cx="50%"
              cy="50%"
              r="48%"
              fill="transparent"
              stroke="var(--color-border)"
              strokeWidth="4"
              className="opacity-50"
            />
            {/* Progress Circle */}
            <motion.circle
              cx="50%"
              cy="50%"
              r="48%"
              fill="transparent"
              stroke="var(--color-text-primary)"
              strokeWidth="4"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2.5, ease: "easeInOut" }}
              style={{ filter: "drop-shadow(0 0 8px rgba(0,255,156,0.6))" }}
            />
          </svg>
        </div>
      </div>

      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 opacity-30">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-[var(--color-text-primary)]/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-[var(--color-primary-500)]/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
    </motion.div>
  );
}
