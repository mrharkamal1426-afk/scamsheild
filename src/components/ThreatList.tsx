import React, { useState } from 'react';
import { ThreatDetail } from '../types';
import { AlertTriangle, ChevronRight, Shield, AlertCircle, Code, Link, FileCode, Hash } from 'lucide-react';
// Removed: import { motion, AnimatePresence } from 'framer-motion';

interface ThreatListProps {
  threats: ThreatDetail[];
}

const severityConfig = {
  high: {
    color: 'red',
    icon: AlertCircle,
    label: 'High Risk',
    description: 'Immediate action recommended'
  },
  medium: {
    color: 'yellow',
    icon: AlertTriangle,
    label: 'Medium Risk',
    description: 'Potential security concern'
  },
  low: {
    color: 'green',
    icon: Shield,
    label: 'Low Risk',
    description: 'Minor security notice'
  }
};

const threatTypeIcons = {
  keyword: Hash,
  domain: Link,
  pattern: Code,
  url: Link,
  structure: FileCode,
  ip: Link,
  subdomain: Link
};

export const ThreatList: React.FC<ThreatListProps> = React.memo(({ threats }) => {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  if (!threats.length) return null;

  const threatsBySeverity = {
    high: threats.filter(t => t.severity === 'high'),
    medium: threats.filter(t => t.severity === 'medium'),
    low: threats.filter(t => t.severity === 'low')
  };

  return (
    <section className="mb-6" aria-labelledby="threats-section-title" data-testid="threat-list">
      <div className="flex items-center justify-between mb-3">
        <h4 id="threats-section-title" className="font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" /> Security Findings ({threats.length})
        </h4>
        <span className="text-xs text-gray-500">Click items to expand</span>
      </div>

      {/* Remove motion.div and animation props from here */}
      <div className="space-y-4">
        {Object.entries(threatsBySeverity).map(([severity, severityThreats]) => {
          if (!severityThreats.length) return null;
          const config = severityConfig[severity as keyof typeof severityConfig];
          
          return (
            <div key={severity}>
              <div className="flex items-center gap-2 mb-2">
                <config.icon className={`w-4 h-4 ${
                  severity === 'high' ? 'text-red-500' :
                  severity === 'medium' ? 'text-yellow-500' :
                  'text-green-500'
                }`} />
                <span className={`text-sm font-medium ${
                  severity === 'high' ? 'text-red-700 dark:text-red-300' :
                  severity === 'medium' ? 'text-yellow-700 dark:text-yellow-300' :
                  'text-green-700 dark:text-green-300'
                }`}>
                  {config.label} Threats ({severityThreats.length})
                </span>
              </div>

              <div className="space-y-2">
                {severityThreats.map((threat, idx) => {
                  const isOpen = openIdx === threats.indexOf(threat);
                  const TypeIcon = threatTypeIcons[threat.type];

                  return (
                    <div
                      key={idx}
                      className={`rounded-lg border transition-all duration-200 ${
                        severity === 'high' ? 'bg-red-50/70 border-red-200 dark:bg-red-900/20 dark:border-red-800/30' :
                        severity === 'medium' ? 'bg-yellow-50/70 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800/30' :
                        'bg-green-50/70 border-green-200 dark:bg-green-900/20 dark:border-green-800/30'
                      } hover:shadow-md`}
                    >
                      <button
                        className="w-full text-left px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-lg"
                        onClick={() => setOpenIdx(isOpen ? null : threats.indexOf(threat))}
                        aria-expanded={isOpen}
                        data-testid="threat-toggle"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`flex-shrink-0 ${isOpen ? 'transform rotate-90' : ''} transition-transform duration-200`}>
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                          </div>
                          <div className="flex-grow min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <TypeIcon className={`w-4 h-4 ${
                                severity === 'high' ? 'text-red-500' :
                                severity === 'medium' ? 'text-yellow-500' :
                                'text-green-500'
                              }`} />
                              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {threat.description}
                              </span>
                            </div>
                            {threat.matchedText && (
                              <div className="text-xs text-gray-500 dark:text-gray-400 font-mono truncate">
                                Matched: "{threat.matchedText}"
                              </div>
                            )}
                          </div>
                        </div>
                      </button>

                      {/* Remove AnimatePresence and motion.div, use regular div for details */}
                      {isOpen && (
                        <div className="overflow-hidden border-t border-gray-100 dark:border-gray-800">
                          <div className="px-4 py-3 space-y-2 text-sm">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                  Threat Type
                                </div>
                                <div className="font-medium text-gray-900 dark:text-gray-100">
                                  {threat.type.charAt(0).toUpperCase() + threat.type.slice(1)}
                                </div>
                              </div>
                              <div>
                                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                  Detection Source
                                </div>
                                <div className="font-medium text-gray-900 dark:text-gray-100">
                                  {threat.source}
                                </div>
                              </div>
                            </div>

                            {threat.pattern && (
                              <div>
                                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                  Detection Pattern
                                </div>
                                <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-mono">
                                  {threat.pattern}
                                </code>
                              </div>
                            )}

                            {threat.url && (
                              <div>
                                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                  Associated URL
                                </div>
                                <div className="text-xs font-mono break-all text-gray-900 dark:text-gray-100">
                                  {threat.url}
                                </div>
                              </div>
                            )}

                            {threat.position && (
                              <div>
                                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                  Location in Message
                                </div>
                                <div className="text-xs font-mono text-gray-900 dark:text-gray-100">
                                  Characters {threat.position.start}-{threat.position.end}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
});
ThreatList.displayName = 'ThreatList'; 