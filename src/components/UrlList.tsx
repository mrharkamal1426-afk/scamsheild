import React, { useState } from 'react';
import { UrlScanResult } from '../types';
import { ChevronDown, ChevronRight, ExternalLink, Shield, AlertTriangle, AlertCircle, Link2, Clock, LucideIcon } from 'lucide-react';
// Removed: import { motion, AnimatePresence } from 'framer-motion';

interface UrlListProps {
  urlScanResults: UrlScanResult[];
  extractedUrls: string[];
}

type UrlStatus = 'malicious' | 'suspicious' | 'safe' | 'error' | 'pending';

const getUrlStatus = (scan?: UrlScanResult): { status: UrlStatus; text: string } => {
  if (!scan) return { status: 'pending', text: 'Scan pending...' };
  
  const hasPendingScans = scan.scanSources.some(source => source.result === 'pending');
  if (hasPendingScans) {
    return { status: 'pending', text: 'Scan in progress...' };
  }

  if (scan.isUrlMalicious) {
    const maliciousSource = scan.scanSources.find(source => source.result === 'malicious');
    if (maliciousSource) {
      return { status: 'malicious', text: maliciousSource.details || 'Malicious URL detected' };
    }
    const suspiciousSource = scan.scanSources.find(source => source.result === 'suspicious');
    if (suspiciousSource) {
      return { status: 'suspicious', text: suspiciousSource.details || 'Suspicious URL detected' };
    }
  }

  return { status: 'safe', text: 'URL appears safe' };
};

const urlStatusIcons: { [K in UrlStatus]: LucideIcon } = {
  malicious: AlertCircle,
  suspicious: AlertTriangle,
  safe: Shield,
  error: AlertTriangle,
  pending: Clock,
};

const urlStatusColors: { [K in UrlStatus]: string } = {
  malicious: 'text-rose-600 dark:text-rose-400',
  suspicious: 'text-amber-600 dark:text-amber-400',
  safe: 'text-emerald-600 dark:text-emerald-400',
  error: 'text-gray-500 dark:text-gray-400',
  pending: 'text-blue-600 dark:text-blue-400',
};

export const UrlList: React.FC<UrlListProps> = React.memo(({ urlScanResults, extractedUrls }) => {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  if (!extractedUrls.length) return null;

  return (
    <section className="mb-6" aria-labelledby="urls-section-title" data-testid="url-list">
      <div className="flex items-center justify-between mb-3">
        <h4 id="urls-section-title" className="font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <Link2 className="w-4 h-4" /> URLs Found ({extractedUrls.length})
        </h4>
        <span className="text-xs text-gray-500">Click items to expand</span>
      </div>
      {/* Remove motion.ul and animation props from here */}
      <ul className="space-y-3">
        {extractedUrls.map((url, idx) => {
          const isOpen = openIdx === idx;
          const scan = urlScanResults.find(s => s.url === url);
          const { status, text } = getUrlStatus(scan);
          const StatusIcon = urlStatusIcons[status];

          return (
            <li key={url} className="bg-white dark:bg-gray-900 rounded-xl shadow-sm">
              <button
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="w-full text-left px-4 py-3 flex items-center gap-3"
              >
                <div className={`${urlStatusColors[status]}`}> {/* Removed animate-spin */}
                  <StatusIcon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {url}
                  </div>
                  <div className={`text-xs ${urlStatusColors[status]}`}>
                    {text}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={url.startsWith('http') ? url : `https://${url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    onClick={e => e.stopPropagation()}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  {isOpen ? (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              </button>

              {/* Remove AnimatePresence and motion.div, use regular div for details */}
              {isOpen && scan && (
                <div className="overflow-hidden border-t border-gray-100 dark:border-gray-800">
                  <div className="px-4 py-3 space-y-3">
                    {scan.scanSources.length ? (
                      <>
                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Security Scan Results
                        </div>
                        <div className="space-y-2">
                          {scan.scanSources.map((source, sourceIdx) => {
                            const SourceIcon = urlStatusIcons[source.result as UrlStatus];
                            return (
                              <div
                                key={sourceIdx}
                                className="flex items-start gap-2 text-sm"
                              >
                                <div className={`mt-0.5 ${urlStatusColors[source.result as UrlStatus]}`}> {/* Removed animate-spin */}
                                  <SourceIcon className="w-4 h-4" />
                                </div>
                                <div>
                                  <div className="font-medium text-gray-700 dark:text-gray-300">
                                    {source.source === 'googleSafeBrowsing' ? 'Google Safe Browsing' :
                                     source.source === 'virusTotal' ? 'VirusTotal' :
                                     source.source === 'phishTank' ? 'PhishTank' : 'Local Check'}
                                  </div>
                                  <div className={`text-sm ${urlStatusColors[source.result as UrlStatus]}`}>
                                    {source.details || `Status: ${source.result}`}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    ) : (
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        No scan results available
                      </div>
                    )}
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
});

UrlList.displayName = 'UrlList'; 