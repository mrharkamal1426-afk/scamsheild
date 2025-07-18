import React from 'react';
import { Shield, AlertTriangle, X } from 'lucide-react';

export type Verdict = 'safe' | 'suspicious' | 'scam';

interface VerdictBadgeProps {
  verdict: Verdict;
  confidence: number;
  className?: string;
}

const verdictConfig = {
  safe: {
    icon: Shield,
    color: 'bg-gradient-to-r from-green-500/20 to-green-600/20',
    textColor: 'text-green-700 dark:text-green-300',
    borderColor: 'border-green-500/30',
    iconColor: 'text-green-600 dark:text-green-400',
    label: 'Safe',
    description: 'No significant threats detected'
  },
  suspicious: {
    icon: AlertTriangle,
    color: 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20',
    textColor: 'text-yellow-700 dark:text-yellow-300',
    borderColor: 'border-yellow-500/30',
    iconColor: 'text-yellow-600 dark:text-yellow-400',
    label: 'Suspicious',
    description: 'Potential risks detected'
  },
  scam: {
    icon: X,
    color: 'bg-gradient-to-r from-red-500/20 to-red-600/20',
    textColor: 'text-red-700 dark:text-red-300',
    borderColor: 'border-red-500/30',
    iconColor: 'text-red-600 dark:text-red-400',
    label: 'Scam',
    description: 'High-risk threats detected'
  },
};

export const VerdictBadge: React.FC<VerdictBadgeProps> = React.memo(
  ({ verdict, confidence, className = '' }) => {
    const config = verdictConfig[verdict];
    const Icon = config.icon;

    return (
      <div
        className={`flex flex-col items-center p-4 rounded-xl border ${config.color} ${config.borderColor} ${className}`}
        data-testid="verdict-badge"
      >
        <div
          className={`rounded-full p-2 ${config.color} mb-2`}
        >
          <Icon className={`w-6 h-6 ${config.iconColor}`} aria-hidden="true" />
        </div>
        <div className="text-center">
          <div className={`text-lg font-bold ${config.textColor}`}>
            {config.label}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full ${config.iconColor.replace('text', 'bg')}`}
                style={{ width: `${confidence}%` }}
              />
            </div>
            <span className={`text-xs font-medium ${config.textColor}`}>
              {confidence}%
            </span>
          </div>
          <div className={`text-xs mt-1 ${config.textColor} opacity-80`}>
            {config.description}
          </div>
        </div>
      </div>
    );
  }
);
VerdictBadge.displayName = 'VerdictBadge'; 