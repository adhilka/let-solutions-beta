import React from 'react';
import { motion } from 'motion/react';
import { useGlobalSettings } from '../../hooks/useGlobalSettings';

export default function InitialLoader() {
  const { settings } = useGlobalSettings();

  // Unified loading duration of 2.5 seconds
  const DURATION = 2.5;

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center p-6 select-none"
    >
      <div className="relative flex flex-col items-center justify-center animate-pulse-subtle">
        
        {/* Circular Animation & Interactive Frame Arena */}
        <div className="relative w-32 h-32 flex items-center justify-center">
          
          {/* Background Board & Traces Assembly (Fades out as logo shines) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: [0, 0.85, 0.85, 0.15],
              scale: [0.8, 1, 1, 0.9]
            }}
            transition={{ 
              duration: DURATION,
              times: [0, 0.15, 0.75, 1],
              ease: "easeInOut"
            }}
            className="absolute inset-0 flex items-center justify-center z-0"
          >
            <svg viewBox="0 0 100 100" className="w-full h-full opacity-70">
              <defs>
                <radialGradient id="trace-glow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.5" />
                  <stop offset="50%" stopColor="#059669" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#047857" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Central Heat & Electrical dispersion zone that flares upon contact */}
              <motion.circle 
                cx="50" 
                cy="50" 
                r="18" 
                fill="url(#trace-glow)" 
                animate={{
                  scale: [1, 1, 1.8, 1.2, 1],
                  opacity: [0.4, 0.4, 0.9, 0.5, 0.3]
                }}
                transition={{
                  duration: DURATION,
                  times: [0, 0.40, 0.46, 0.65, 1],
                  ease: "easeInOut"
                }}
              />

              {/* Underlying PCB Circuit Traces (Static Base Lines) */}
              <path d="M 20,20 L 38,38 L 44,38" fill="none" stroke="#043c2c" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M 20,80 L 38,62 L 44,62" fill="none" stroke="#043c2c" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M 80,20 L 62,38 L 56,38" fill="none" stroke="#043c2c" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M 50,85 L 50,68 L 54,64" fill="none" stroke="#043c2c" strokeWidth="1.5" strokeLinecap="round" />

              {/* Dynamic Electric Pulse / Highlighting Traces that light up on contact */}
              <motion.path 
                d="M 20,20 L 38,38 L 44,38" 
                fill="none" 
                stroke="#10b981" 
                strokeWidth="1.8" 
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: [0, 0, 1, 1], opacity: [0, 0, 1, 0.3] }}
                transition={{
                  duration: DURATION,
                  times: [0, 0.42, 0.68, 1],
                  ease: "easeInOut"
                }}
                style={{ filter: "drop-shadow(0 0 3px #34d399)" }}
              />

              <motion.path 
                d="M 20,80 L 38,62 L 44,62" 
                fill="none" 
                stroke="#10b981" 
                strokeWidth="1.8" 
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: [0, 0, 1, 1], opacity: [0, 0, 1, 0.3] }}
                transition={{
                  duration: DURATION,
                  times: [0, 0.43, 0.70, 1],
                  ease: "easeInOut"
                }}
                style={{ filter: "drop-shadow(0 0 3px #34d399)" }}
              />

              <motion.path 
                d="M 80,20 L 62,38 L 56,38" 
                fill="none" 
                stroke="#10b981" 
                strokeWidth="1.8" 
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: [0, 0, 1, 1], opacity: [0, 0, 1, 0.3] }}
                transition={{
                  duration: DURATION,
                  times: [0, 0.42, 0.67, 1],
                  ease: "easeInOut"
                }}
                style={{ filter: "drop-shadow(0 0 3px #34d399)" }}
              />

              <motion.path 
                d="M 50,85 L 50,68 L 54,64" 
                fill="none" 
                stroke="#10b981" 
                strokeWidth="1.8" 
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: [0, 0, 1, 1], opacity: [0, 0, 1, 0.3] }}
                transition={{
                  duration: DURATION,
                  times: [0, 0.44, 0.72, 1],
                  ease: "easeInOut"
                }}
                style={{ filter: "drop-shadow(0 0 3px #34d399)" }}
              />

              {/* Pin pads */}
              <circle cx="20" cy="20" r="2.5" fill="#10b981" />
              <circle cx="20" cy="80" r="2.5" fill="#10b981" />
              <circle cx="80" cy="20" r="2.5" fill="#10b981" />
              <circle cx="50" cy="85" r="2.5" fill="#10b981" />

              <circle cx="44" cy="38" r="1.5" fill="#047857" />
              <circle cx="44" cy="62" r="1.5" fill="#047857" />
              <circle cx="56" cy="38" r="1.5" fill="#047857" />
              <circle cx="54" cy="64" r="1.5" fill="#047857" />

              {/* The Target Soldering Pad (Exactly 50, 50 - target point) */}
              <circle cx="50" cy="50" r="5" fill="#1e293b" stroke="#10b981" strokeWidth="1.5" />
              <circle cx="50" cy="50" r="2.2" fill="#94a3b8" />
            </svg>
          </motion.div>

          {/* Soldering Iron Stylus Animation */}
          <motion.div
            initial={{ opacity: 0, x: 65, y: -65 }}
            animate={{
              opacity: [0, 1, 1, 1, 0],
              x: [65, 0, -1, 0, 65],
              y: [-65, 0, -1, 0, -65],
              rotate: [0, 0, -2, 0, 5]
            }}
            transition={{
              duration: 2.2,
              times: [0, 0.40, 0.46, 0.65, 1],
              delay: 0.1,
              ease: "easeInOut"
            }}
            className="absolute inset-0 pointer-events-none z-20"
          >
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {/* Soldering Iron Pen (Tip positioned perfectly at 50,50 for offset 0) */}
              <g>
                {/* 1. Copper/Metal Tip Heating Contact Point */}
                <line x1="50" y1="50" x2="56" y2="44" stroke="#f8fafc" strokeWidth="2.4" strokeLinecap="round" />
                
                {/* 2. Sleek Nichrome Heating Metal Shield Core */}
                <line x1="56" y1="44" x2="68" y2="32" stroke="#94a3b8" strokeWidth="4.5" strokeLinecap="round" />
                {/* Heat glow effect on element shaft */}
                <motion.line 
                  x1="56" y1="44" x2="68" y2="32" 
                  stroke="#ea580c" strokeWidth="2" strokeLinecap="round"
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
                />
                
                {/* 3. Threaded metal flange protector ring */}
                <circle cx="68" cy="32" r="3.5" fill="#cbd5e1" />

                {/* 4. Thermal Insulator Ring (Gold/Amber detail accent) */}
                <line x1="68" y1="32" x2="72" y2="28" stroke="#f59e0b" strokeWidth="6.5" strokeLinecap="round" />

                {/* 5. Professional ergonomic dark blue silicone handle */}
                <line x1="72" y1="28" x2="98" y2="2" stroke="#0284c7" strokeWidth="10" strokeLinecap="round" />
                <line x1="80" y1="20" x2="94" y2="6" stroke="#0f172a" strokeWidth="8.5" strokeLinecap="round" /> {/* Rubber grip details */}
              </g>
            </svg>
          </motion.div>

          {/* Solder Joint Melting Flare & Spark Particle Effects */}
          {/* Glowing Heat Vapor Ring */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: [0, 0, 2.2, 1.4, 0],
              opacity: [0, 0, 0.95, 0.5, 0]
            }}
            transition={{
              duration: DURATION,
              times: [0, 0.40, 0.48, 0.68, 1],
              ease: "easeOut"
            }}
            className="absolute w-12 h-12 rounded-full border border-emerald-400 bg-emerald-500/25 shadow-[0_0_20px_#10b981] z-10 pointer-events-none"
          />

          {/* Concentric Heat Wave Ripple 2 (Slightly larger, delayed trace) */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: [0, 0, 3.2, 0.1],
              opacity: [0, 0, 0.6, 0]
            }}
            transition={{
              duration: DURATION,
              times: [0, 0.42, 0.58, 1],
              ease: "easeOut"
            }}
            className="absolute w-12 h-12 rounded-full border border-emerald-500/10 z-10 pointer-events-none"
          />

          {/* Fine Solder Smoke curls that draft upwards */}
          <motion.div
            initial={{ opacity: 0, y: 10, x: 0, scale: 0.3, filter: "blur(2px)" }}
            animate={{
              opacity: [0, 0, 0.8, 0.4, 0],
              y: [10, 0, -22, -45, -60],
              x: [0, -2, -8, 4, -12],
              scale: [0.3, 0.6, 1.1, 1.6, 2.2]
            }}
            transition={{
              duration: DURATION,
              times: [0, 0.40, 0.47, 0.65, 1],
              ease: "easeOut"
            }}
            className="absolute w-6 h-6 bg-slate-200/20 rounded-full z-15 pointer-events-none"
          />

          <motion.div
            initial={{ opacity: 0, y: 10, x: 2, scale: 0.2, filter: "blur(3px)" }}
            animate={{
              opacity: [0, 0, 0.7, 0.3, 0],
              y: [10, -2, -18, -38, -52],
              x: [2, 4, 10, -2, 8],
              scale: [0.2, 0.5, 0.9, 1.4, 2.0]
            }}
            transition={{
              duration: DURATION,
              times: [0, 0.41, 0.49, 0.68, 1],
              ease: "easeOut"
            }}
            className="absolute w-5 h-5 bg-zinc-300/25 rounded-full z-15 pointer-events-none"
          />

          {/* Staggered Multi-Directional Shooting Sparks */}
          {/* Spark 1: Top-Left */}
          <motion.div
            initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
            animate={{
              x: [0, -28],
              y: [0, -20],
              scale: [0, 1.5, 0],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 0.55,
              delay: 0.1 + 2.2 * 0.40, // exactly when iron makes contact
              ease: "easeOut"
            }}
            className="absolute w-2 h-2 bg-yellow-400 rounded-full shadow-[0_0_8px_#f59e0b] z-30"
          />

          {/* Spark 2: Top-Right */}
          <motion.div
            initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
            animate={{
              x: [0, 24],
              y: [0, -24],
              scale: [0, 1.4, 0],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 0.5,
              delay: 0.1 + 2.2 * 0.41,
              ease: "easeOut"
            }}
            className="absolute w-1.5 h-1.5 bg-emerald-300 rounded-full shadow-[0_0_6px_#34d399] z-30"
          />

          {/* Spark 3: Bottom-Left */}
          <motion.div
            initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
            animate={{
              x: [0, -20],
              y: [0, 26],
              scale: [0, 1.4, 0],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 0.6,
              delay: 0.1 + 2.2 * 0.405,
              ease: "easeOut"
            }}
            className="absolute w-1.5 h-1.5 bg-amber-400 rounded-full shadow-[0_0_6px_#fbbf24] z-30"
          />

          {/* Spark 4: Bottom-Right */}
          <motion.div
            initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
            animate={{
              x: [0, 22],
              y: [0, 22],
              scale: [0, 1.6, 0],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 0.58,
              delay: 0.1 + 2.2 * 0.415,
              ease: "easeOut"
            }}
            className="absolute w-2 h-2 bg-white rounded-full shadow-[0_0_8px_#ffffff] z-30"
          />

          {/* Spark 5: Direct Left */}
          <motion.div
            initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
            animate={{
              x: [0, -32],
              y: [0, 2],
              scale: [0, 1.3, 0],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 0.5,
              delay: 0.1 + 2.2 * 0.41,
              ease: "easeOut"
            }}
            className="absolute w-1.5 h-1.5 bg-yellow-300 rounded-full shadow-[0_0_6px_#facc15] z-30"
          />

          {/* Logo element that smoothly takes center stage */}
          <motion.div
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ 
              scale: [0.3, 0.3, 1.12, 1],
              opacity: [0, 0, 1, 1] 
            }}
            transition={{ 
              duration: DURATION,
              times: [0, 0.46, 0.82, 1],
              ease: [0.34, 1.56, 0.64, 1] // Elite custom springy elastic bounce curves
            }}
            className="absolute inset-0 flex items-center justify-center z-10"
          >
            <div className="relative flex items-center justify-center w-20 h-20 bg-zinc-950/50 rounded-full border border-emerald-500/20 backdrop-blur-[6px] shadow-2xl shadow-emerald-500/10">
              {/* Inner subtle glow boundary */}
              <div className="absolute inset-0.5 rounded-full border border-white/5 animate-pulse" />
              <img 
                src="https://i.ibb.co/F44JTK54/1000107137.png" 
                alt="Let Solutions Logo" 
                className="w-11 h-11 object-contain brightness-0 invert filter drop-shadow-[0_0_12px_rgba(16,185,129,0.45)]"
              />
            </div>
          </motion.div>

          {/* Loader Outer Progress Ring */}
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle
              cx="50%"
              cy="50%"
              r="46%"
              fill="transparent"
              stroke="rgba(16, 185, 129, 0.08)"
              strokeWidth="3.5"
            />
            <motion.circle
              cx="50%"
              cy="50%"
              r="46%"
              fill="transparent"
              stroke="#10b981"
              strokeWidth="3.5"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: DURATION, ease: "easeInOut" }}
              style={{ filter: "drop-shadow(0 0 8px rgba(16, 185, 129, 0.75))" }}
            />
          </svg>
        </div>

      </div>

      {/* Decorative background micro-glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 opacity-25">
        <div className="absolute top-[25%] left-[20%] w-[35%] h-[35%] bg-emerald-950/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[20%] right-[15%] w-[40%] h-[40%] bg-blue-950/15 rounded-full blur-[120px]" />
      </div>
    </motion.div>
  );
}

