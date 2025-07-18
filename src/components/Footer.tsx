import { Shield } from 'lucide-react';
import React from 'react';

export default function Footer() {
  return (
    <footer className="w-full py-6 px-4 border-t border-white/20 dark:border-dark-500/30 bg-white/80 dark:bg-dark-800/80 backdrop-blur-sm text-center text-sm text-gray-600 dark:text-gray-300 mt-12">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-8">
        {/* Left: Premium Developer Card */}
        <div className="flex flex-col items-center sm:items-start">
          <div className="flex items-center gap-3 glass-card bg-white/60 dark:bg-dark-700/60 rounded-2xl shadow-xl px-6 py-4 mb-2 border border-gray-200 dark:border-dark-600 backdrop-blur-md relative">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-black via-gray-700 to-black shadow-lg border-4 border-primary-400 dark:border-primary-600 ring-2 ring-primary-200 dark:ring-primary-700 mr-4">
              <Shield className="w-6 h-6 text-white drop-shadow-lg" />
            </div>
            <div className="flex flex-col items-start min-w-[120px]">
              <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-widest mb-1">Developed by</span>
              <div className="w-10 border-t-2 border-primary-400 dark:border-primary-600 mb-1" />
              <span className="text-2xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-black via-gray-700 to-black uppercase drop-shadow-lg mb-1 animate-shimmer-red bg-[length:200%_auto]">BLACK_LOTUS</span>
              <span className="inline-block px-3 py-1 rounded-full bg-gradient-to-r from-primary-100 via-primary-50 to-primary-100 dark:from-primary-900 dark:via-primary-800 dark:to-primary-900 text-primary-800 dark:text-primary-200 text-xs font-bold mt-1 shadow border border-primary-200 dark:border-primary-800 tracking-wide">
                v1.0.0 &bull; Stable Release
              </span>
            </div>
          </div>
        </div>

        {/* Center: App Name & Tagline */}
        <div className="flex flex-col items-center flex-1">
          <span className="text-lg font-bold text-gray-800 dark:text-gray-100">ScamShield</span>
          <span className="text-base font-semibold text-primary-700 dark:text-primary-300 mt-1">
            Enterprise-Grade Scam & Phishing Protection for Everyone
          </span>
        </div>

        {/* Right: Providers */}
        <div className="flex flex-col items-center sm:items-end gap-3">
          <div className="flex flex-col items-center sm:items-end">
            <span className="font-semibold text-gray-700 dark:text-gray-200 mb-1">Security Providers</span>
            <span className="inline-flex items-center gap-2">
              <span className="font-medium text-blue-700 dark:text-blue-300">Google Safe Browsing</span>
              <span className="text-gray-400">|</span>
              <span className="font-medium text-green-700 dark:text-green-300">VirusTotal</span>
            </span>
          </div>
          <div className="flex flex-col items-center sm:items-end">
            <span className="font-semibold text-gray-700 dark:text-gray-200 mb-1">AI Analysis</span>
            <span className="font-medium text-purple-700 dark:text-purple-300">OpenRouter</span>
          </div>
          <span className="text-xs text-gray-400 dark:text-gray-500 mt-2">&copy; {new Date().getFullYear()} All rights reserved.</span>
        </div>
      </div>
      {/* Red sweep shimmer animation for BLACK_LOTUS */}
      <style>{`
        .animate-shimmer-red {
          background-image: linear-gradient(90deg, #000 0%, #a00 40%, #ff3b3b 50%, #a00 60%, #000 100%);
          background-size: 200% auto;
          animation: shimmer-red 2.5s linear infinite;
        }
        @keyframes shimmer-red {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </footer>
  );
}
