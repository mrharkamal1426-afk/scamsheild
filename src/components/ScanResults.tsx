import React from 'react';
import { ScanResult } from '../types';
import { PremiumStatusBanner } from './PremiumStatusBanner';
import { KpiStrip } from './KpiStrip';
import { UrlList } from './UrlList';
import { ThreatList } from './ThreatList';
import { AdvisorySection } from './AdvisorySection';
import { ReportActions } from './ReportActions';
// Remove framer-motion and AnimatePresence imports
// import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export interface ScanResultsProps {
  result: ScanResult;
  onReport?: (result: ScanResult) => void;
}

// Utility to extract actionable advice and tips from AI analysis (fallback if not structured)
function extractAdvice(aiAnalysis?: string): { whatToDo: string[]; howToStaySafe: string[] } {
  if (!aiAnalysis) return { whatToDo: [], howToStaySafe: [] };
  // Try to parse sections by headings
  const whatToDoMatch = aiAnalysis.match(/WHAT TO DO NEXT?:([\s\S]*?)(HOW TO STAY SAFE:|ABOUT THIS SCAN:|$)/i);
  const howToStaySafeMatch = aiAnalysis.match(/HOW TO STAY SAFE:([\s\S]*?)(ABOUT THIS SCAN:|$)/i);
  const whatToDo = whatToDoMatch ? whatToDoMatch[1].split(/\n|\u2022|\-/).map(l => l.trim()).filter(Boolean) : [];
  const howToStaySafe = howToStaySafeMatch ? howToStaySafeMatch[1].split(/\n|\u2022|\-/).map(l => l.trim()).filter(Boolean) : [];
  return { whatToDo, howToStaySafe };
}

// Utility to extract concise AI summary aspects
function extractAiSummary(aiAnalysis?: string): { 
  verdict: string; 
  criticalRisk: string; 
  findings: string[];
  actions: string[];
  insight: string;
  confidence: string;
} {
  if (!aiAnalysis) return { 
    verdict: '', 
    criticalRisk: '', 
    findings: [], 
    actions: [],
    insight: '',
    confidence: ''
  };

  const verdictMatch = aiAnalysis.match(/INSTANT VERDICT([\s\S]*?)(?=CRITICAL RISK|$)/i);
  const riskMatch = aiAnalysis.match(/CRITICAL RISK([\s\S]*?)(?=KEY FINDINGS|$)/i);
  const findingsMatch = aiAnalysis.match(/KEY FINDINGS([\s\S]*?)(?=REQUIRED ACTIONS|$)/i);
  const actionsMatch = aiAnalysis.match(/REQUIRED ACTIONS([\s\S]*?)(?=SECURITY INSIGHT|$)/i);
  const insightMatch = aiAnalysis.match(/SECURITY INSIGHT([\s\S]*?)(?=ANALYSIS CONFIDENCE|$)/i);
  const confidenceMatch = aiAnalysis.match(/ANALYSIS CONFIDENCE([\s\S]*?)(?=$)/i);

  return {
    verdict: verdictMatch ? verdictMatch[1].trim() : '',
    criticalRisk: riskMatch ? riskMatch[1].trim() : '',
    findings: findingsMatch 
      ? findingsMatch[1].split(/\n|\u2022/).map(s => s.trim()).filter(Boolean)
      : [],
    actions: actionsMatch
      ? actionsMatch[1].split(/\n|[0-9]+\./).map(s => s.trim()).filter(Boolean)
      : [],
    insight: insightMatch ? insightMatch[1].trim() : '',
    confidence: confidenceMatch ? confidenceMatch[1].trim() : ''
  };
}

export const ScanResults: React.FC<ScanResultsProps> = ({ result, onReport }) => {
  const { whatToDo, howToStaySafe } = extractAdvice(result.aiAnalysis);
  const aiSummary = extractAiSummary(result.aiAnalysis);

  // Calculate URL statistics
  const urlStats = result.urlScanResults ? {
    total: result.urlScanResults.length,
    malicious: result.urlScanResults.filter(scan => scan.isUrlMalicious).length,
    pending: result.urlScanResults.filter(scan => 
      scan.scanSources.some(source => source.result === 'pending')
    ).length
  } : undefined;

  // Highlight suspicious text in the analyzed message
  const renderHighlightedMessage = () => {
    if (!result.detectedThreats.some(t => t.position)) return result.message;
    // Sort by start index
    const highlights = result.detectedThreats.filter(t => t.position).sort((a, b) => (a.position!.start - b.position!.start));
    let lastIdx = 0;
    const parts: React.ReactNode[] = [];
    highlights.forEach((threat, i) => {
      if (threat.position!.start > lastIdx) {
        parts.push(result.message.slice(lastIdx, threat.position!.start));
      }
      parts.push(
        <span
          key={i}
          className={`px-1 rounded font-semibold cursor-help ${
            threat.severity === 'high' ? 'bg-rose-200 text-rose-900' :
            threat.severity === 'medium' ? 'bg-amber-200 text-amber-900' :
            'bg-emerald-200 text-emerald-900'
          }`}
          title={threat.description}
        >
          {result.message.slice(threat.position!.start, threat.position!.end)}
        </span>
      );
      lastIdx = threat.position!.end;
    });
    if (lastIdx < result.message.length) {
      parts.push(result.message.slice(lastIdx));
    }
    return parts;
  };

  return (
    <section
      className="p-6 rounded-2xl w-full max-w-3xl mx-auto bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700"
      aria-label="Scan Results Report Card"
      data-testid="scan-results-root"
    >
      {/* Premium Status Banner */}
      <div>
        <PremiumStatusBanner verdict={result.verdict} confidence={result.confidence} />
      </div>

      {/* KPI Strip */}
      <div className="mb-6">
        <KpiStrip
          score={result.confidence}
          threatCount={result.detectedThreats.length}
          verdict={result.verdict}
          urlStats={urlStats}
        />
      </div>

      {/* Report as Threat Button */}
      <div className="flex justify-end mb-4">
        <button
          className="bg-rose-600 hover:bg-rose-700 text-white font-semibold py-2 px-4 rounded shadow hover:shadow-lg active:scale-95"
          onClick={() => {
            if (onReport) {
              onReport(result);
            } else {
              const reports = JSON.parse(localStorage.getItem('reportedThreats') || '[]');
              reports.push(result);
              localStorage.setItem('reportedThreats', JSON.stringify(reports));
              alert('Thank you for reporting. This will help improve detection!');
            }
          }}
        >
          Report as Threat
        </button>
      </div>

      {/* AI Analysis Card */}
      {(aiSummary.verdict || aiSummary.criticalRisk || aiSummary.findings.length > 0) && (
        <div className="mb-6">
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-lg">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-primary-500" />
                <span className="font-semibold text-gray-900 dark:text-gray-100 text-lg tracking-tight">
                  Security Analysis
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Instant Verdict */}
              {aiSummary.verdict && (
                <div className="font-medium text-lg text-gray-900 dark:text-gray-100 leading-relaxed">
                  {aiSummary.verdict}
                </div>
              )}

              {/* Critical Risk */}
              {aiSummary.criticalRisk && (
                <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/30 rounded-lg p-4">
                  <div className="font-medium text-rose-900 dark:text-rose-300 mb-1">
                    Critical Risk
                  </div>
                  <div className="text-rose-700 dark:text-rose-200">
                    {aiSummary.criticalRisk}
                  </div>
                </div>
              )}

              {/* Key Findings */}
              {aiSummary.findings.length > 0 && (
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                    Key Findings
                  </div>
                  <ul className="space-y-2">
                    {aiSummary.findings.map((finding, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-2 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">{finding}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Required Actions */}
              {aiSummary.actions.length > 0 && (
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                  <div className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                    Required Actions
                  </div>
                  <ol className="list-decimal ml-4 space-y-2">
                    {aiSummary.actions.map((action, idx) => (
                      <li key={idx} className="text-gray-700 dark:text-gray-300 pl-1">
                        {action}
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Security Insight */}
              {aiSummary.insight && (
                <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800/30 rounded-lg p-4">
                  <div className="font-medium text-primary-900 dark:text-primary-300 mb-1">
                    Security Insight
                  </div>
                  <div className="text-primary-700 dark:text-primary-200">
                    {aiSummary.insight}
                  </div>
                </div>
              )}

              {/* Analysis Confidence */}
              {aiSummary.confidence && (
                <div className="text-sm text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-800 pt-4 mt-6">
                  {aiSummary.confidence}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Message Analyzed */}
      <div>
        <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">Analyzed Message</h4>
        <div className="p-4 bg-white/50 dark:bg-dark-700/50 rounded-lg border border-white/30 dark:border-dark-500/30 font-mono text-sm whitespace-pre-wrap">
          {renderHighlightedMessage()}
        </div>
      </div>

      {/* URL List */}
      <div>
        <UrlList
          urlScanResults={result.urlScanResults || []}
          extractedUrls={result.extractedUrls}
        />
      </div>

      {/* Threat List */}
      <div>
        <ThreatList threats={result.detectedThreats} />
      </div>

      {/* Advisory Section (from AI or fallback) */}
      {(whatToDo.length > 0 || howToStaySafe.length > 0) && (
        <div>
          <AdvisorySection whatToDo={whatToDo} howToStaySafe={howToStaySafe} />
        </div>
      )}

      {/* Actions: Copy, Download, Report */}
      <div>
        <ReportActions result={result} onReport={onReport} />
      </div>

      {/* Report ID for reference */}
      <div
        className="mt-4 text-xs text-gray-500 flex items-center"
        data-testid="scan-id"
      >
        Report ID: {result.id.split('_')[2]}
      </div>
    </section>
  );
};

export default ScanResults;