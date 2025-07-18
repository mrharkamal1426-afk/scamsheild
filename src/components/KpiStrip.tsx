import React from 'react';
import { Shield, Activity, Target, Link } from 'lucide-react';

interface KpiStripProps {
  score: number;
  threatCount: number;
  verdict: 'safe' | 'suspicious' | 'scam';
  urlStats?: {
    total: number;
    malicious: number;
    pending: number;
  };
}

const kpiColor = {
  safe: {
    bg: 'bg-emerald-500',
    text: 'text-emerald-900 dark:text-emerald-300',
    border: 'border-emerald-500/30',
    gradient: 'from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-800/10',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
  suspicious: {
    bg: 'bg-amber-500',
    text: 'text-amber-900 dark:text-amber-300',
    border: 'border-amber-500/30',
    gradient: 'from-amber-50 to-amber-100/50 dark:from-amber-900/20 dark:to-amber-800/10',
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
  scam: {
    bg: 'bg-rose-500',
    text: 'text-rose-900 dark:text-rose-300',
    border: 'border-rose-500/30',
    gradient: 'from-rose-50 to-rose-100/50 dark:from-rose-900/20 dark:to-rose-800/10',
    iconColor: 'text-rose-600 dark:text-rose-400',
  },
};

const getRiskLevel = (score: number) => {
  if (score >= 90) return 'Very High Risk';
  if (score >= 70) return 'High Risk';
  if (score >= 50) return 'Medium Risk';
  if (score >= 30) return 'Low Risk';
  return 'Very Low Risk';
};

const KpiCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  value: string | number;
  subtitle: string;
  colors: typeof kpiColor[keyof typeof kpiColor];
  delay?: number;
}> = ({ icon, title, value, subtitle, colors, delay = 0 }) => (
  <div
    className={`relative overflow-hidden backdrop-blur-sm bg-white/90 dark:bg-gray-900/90 
      border ${colors.border} rounded-2xl shadow-lg`}
  >
    <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient}`} />
    <div className="relative p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-xl bg-white/50 dark:bg-white/10 backdrop-blur-sm border ${colors.border}`}>
          {icon}
        </div>
        <span className={`text-sm font-medium ${colors.text}`}>{title}</span>
      </div>
      <div className={`text-2xl font-bold ${colors.text} mb-1`}>
        {value}
      </div>
      <div className={`text-xs ${colors.text} opacity-80`}>
        {subtitle}
      </div>
    </div>
  </div>
);

export const KpiStrip = React.memo<KpiStripProps>(
  ({ score, threatCount, verdict, urlStats }) => {
    const colors = kpiColor[verdict];
    const riskLevel = getRiskLevel(score);

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" data-testid="kpi-strip">
        <KpiCard
          icon={<Target className={`w-5 h-5 ${colors.iconColor}`} />}
          title="Risk Score"
          value={`${score}%`}
          subtitle={riskLevel}
          colors={colors}
          delay={0.1}
        />
        <KpiCard
          icon={<Activity className={`w-5 h-5 ${colors.iconColor}`} />}
          title="Problems Found"
          value={threatCount === 0 ? 'None' : threatCount}
          subtitle={threatCount === 0 
            ? 'No problems found' 
            : `${threatCount} ${threatCount === 1 ? 'problem' : 'problems'} found`}
          colors={colors}
          delay={0.2}
        />
        <KpiCard
          icon={<Shield className={`w-5 h-5 ${colors.iconColor}`} />}
          title="Message Status"
          value={verdict === 'safe' ? 'Safe' : verdict === 'suspicious' ? 'Be Careful' : 'Dangerous'}
          subtitle={verdict === 'safe' 
            ? 'This looks good' 
            : verdict === 'suspicious' 
            ? 'This looks suspicious' 
            : 'This is a scam'}
          colors={colors}
          delay={0.3}
        />
        {urlStats && (
          <KpiCard
            icon={<Link className={`w-5 h-5 ${colors.iconColor}`} />}
            title="URL Scans"
            value={urlStats.total === 0 ? 'No URLs' : `${urlStats.malicious}/${urlStats.total}`}
            subtitle={urlStats.pending > 0 
              ? `${urlStats.pending} scan${urlStats.pending === 1 ? '' : 's'} pending`
              : urlStats.malicious > 0
              ? `${urlStats.malicious} malicious URL${urlStats.malicious === 1 ? '' : 's'}`
              : 'All URLs are safe'}
            colors={colors}
            delay={0.4}
          />
        )}
      </div>
    );
  }
);
KpiStrip.displayName = 'KpiStrip'; 