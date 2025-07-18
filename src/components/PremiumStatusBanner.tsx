import React from 'react';
import { Shield, AlertTriangle, X, CheckCircle, AlertOctagon } from 'lucide-react';
// Removed: import { motion } from 'framer-motion';

export type Verdict = 'safe' | 'suspicious' | 'scam';

interface PremiumStatusBannerProps {
  verdict: Verdict;
  confidence: number;
}

const config = {
  safe: {
    label: 'SAFE',
    subLabel: 'This message looks safe',
    icon: Shield,
    secondaryIcon: CheckCircle,
    gradient: 'from-emerald-500/10 via-emerald-500/20 to-emerald-600/30',
    border: 'border-emerald-500/30',
    text: 'text-emerald-900 dark:text-emerald-300',
    accentText: 'text-emerald-700 dark:text-emerald-200',
    iconGlow: 'shadow-emerald-500/30',
    bgAccent: 'bg-emerald-500',
  },
  suspicious: {
    label: 'SUSPICIOUS',
    subLabel: 'This message might be dangerous',
    icon: AlertTriangle,
    secondaryIcon: AlertOctagon,
    gradient: 'from-amber-500/10 via-amber-500/20 to-amber-600/30',
    border: 'border-amber-500/30',
    text: 'text-amber-900 dark:text-amber-300',
    accentText: 'text-amber-700 dark:text-amber-200',
    iconGlow: 'shadow-amber-500/30',
    bgAccent: 'bg-amber-500',
  },
  scam: {
    label: 'SCAM',
    subLabel: 'This is definitely a scam',
    icon: X,
    secondaryIcon: AlertOctagon,
    gradient: 'from-rose-500/10 via-rose-500/20 to-rose-600/30',
    border: 'border-rose-500/30',
    text: 'text-rose-900 dark:text-rose-300',
    accentText: 'text-rose-700 dark:text-rose-200',
    iconGlow: 'shadow-rose-500/30',
    bgAccent: 'bg-rose-500',
  },
};

export const PremiumStatusBanner: React.FC<PremiumStatusBannerProps> = ({ verdict, confidence }) => {
  const c = config[verdict];
  const Icon = c.icon;
  const SecondaryIcon = c.secondaryIcon;

  const getConfidenceLabel = (score: number) => {
    if (verdict === 'safe') return 'Safe Score';
    if (verdict === 'suspicious') return 'Risk Score';
    return 'Scam Score';
  };

  return (
    <div
      className={`relative w-full overflow-hidden backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 
        border ${c.border} rounded-3xl shadow-xl mb-8`}
      data-testid="premium-status-banner"
    >
      {/* Background Pattern */}
      <div className={`absolute inset-0 bg-gradient-to-r ${c.gradient}`} />
      
      {/* Content */}
      <div className="relative px-6 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Left Side: Status */}
          <div className="flex items-center gap-4">
            <div
              className={`relative rounded-2xl p-4 bg-white/10 backdrop-blur-sm 
                border ${c.border} ${c.iconGlow} shadow-lg`}
            >
              <Icon className={`w-8 h-8 ${c.text}`} />
              <div
                className={`absolute -bottom-2 -right-2 rounded-full p-1 ${c.bgAccent}`}
              >
                <SecondaryIcon className="w-4 h-4 text-white" />
              </div>
            </div>
            <div>
              <div
                className={`text-2xl font-bold tracking-wider ${c.text}`}
              >
                {c.label}
              </div>
              <div
                className={`text-sm font-medium mt-1 ${c.accentText}`}
              >
                {c.subLabel}
              </div>
            </div>
          </div>

          {/* Right Side: Confidence Score */}
          <div className="flex flex-col items-center justify-center min-w-[90px]">
            <div className={`text-4xl font-extrabold ${c.text}`}>{confidence}%</div>
            <div className={`text-xs font-medium mt-1 ${c.accentText}`}>{getConfidenceLabel(confidence)}</div>
            <div className={`text-xs ${c.accentText} opacity-80 mt-0.5`}>{verdict === 'safe' ? 'Very Confident' : verdict === 'suspicious' ? 'Be Careful' : 'High Risk'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}; 