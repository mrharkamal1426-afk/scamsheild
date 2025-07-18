import React, { Suspense } from 'react';
import { Sparkles, ChevronDown, ChevronRight, Brain, AlertTriangle, ShieldCheck, Lightbulb } from 'lucide-react';
// Removed: import { motion, AnimatePresence } from 'framer-motion';

interface AiAnalysisSectionProps {
  aiAnalysis: string;
}

const parseAiAnalysis = (analysis: string) => {
  const sections = {
    summary: '',
    findings: [] as string[],
    actions: [] as string[],
    prevention: [] as string[]
  };

  const summaryMatch = analysis.match(/SUMMARY:(.*?)(?=WHAT WE FOUND:|$)/is);
  const findingsMatch = analysis.match(/WHAT WE FOUND:(.*?)(?=WHAT TO DO NEXT:|$)/is);
  const actionsMatch = analysis.match(/WHAT TO DO NEXT:(.*?)(?=HOW TO STAY SAFE:|$)/is);
  const preventionMatch = analysis.match(/HOW TO STAY SAFE:(.*?)(?=ABOUT THIS SCAN:|$)/is);

  if (summaryMatch) sections.summary = summaryMatch[1].trim();
  if (findingsMatch) sections.findings = findingsMatch[1].split(/\n|\u2022|\-/).map(s => s.trim()).filter(Boolean);
  if (actionsMatch) sections.actions = actionsMatch[1].split(/\n|\u2022|\-/).map(s => s.trim()).filter(Boolean);
  if (preventionMatch) sections.prevention = preventionMatch[1].split(/\n|\u2022|\-/).map(s => s.trim()).filter(Boolean);

  return sections;
};

const AiAnalysisContent = ({ aiAnalysis }: { aiAnalysis: string }) => {
  const sections = parseAiAnalysis(aiAnalysis);
  return (
    <div className="space-y-6" data-testid="ai-analysis-content">
      {/* Summary */}
      {sections.summary && (
        <div className="bg-gradient-to-r from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/10 rounded-xl border border-purple-200/50 dark:border-purple-800/30 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Brain className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <h5 className="font-semibold text-purple-900 dark:text-purple-300">AI Analysis Summary</h5>
          </div>
          <p className="text-sm text-purple-800 dark:text-purple-200">{sections.summary}</p>
        </div>
      )}
      {/* Findings */}
      {sections.findings.length > 0 && (
        <div className="bg-gradient-to-r from-yellow-50 to-yellow-100/50 dark:from-yellow-900/20 dark:to-yellow-800/10 rounded-xl border border-yellow-200/50 dark:border-yellow-800/30 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h5 className="font-semibold text-yellow-900 dark:text-yellow-300">Key Findings</h5>
          </div>
          <ul className="space-y-2">
            {sections.findings.map((finding, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-yellow-800 dark:text-yellow-200">
                <span className="text-yellow-500 dark:text-yellow-400">•</span>
                {finding}
              </li>
            ))}
          </ul>
        </div>
      )}
      {/* Actions */}
      {sections.actions.length > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/10 rounded-xl border border-green-200/50 dark:border-green-800/30 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <ShieldCheck className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
            <h5 className="font-semibold text-green-900 dark:text-green-300">Recommended Actions</h5>
          </div>
          <ul className="space-y-2">
            {sections.actions.map((action, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-green-800 dark:text-green-200">
                <span className="text-green-500 dark:text-green-400">•</span>
                {action}
              </li>
            ))}
          </ul>
        </div>
      )}
      {/* Prevention */}
      {sections.prevention.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 rounded-xl border border-blue-200/50 dark:border-blue-800/30 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Lightbulb className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <h5 className="font-semibold text-blue-900 dark:text-blue-300">Prevention Tips</h5>
          </div>
          <ul className="space-y-2">
            {sections.prevention.map((tip, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-blue-800 dark:text-blue-200">
                <span className="text-blue-500 dark:text-blue-400">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export const AiAnalysisSection: React.FC<AiAnalysisSectionProps> = React.memo(({ aiAnalysis }) => {
  const [open, setOpen] = React.useState(false);
  if (!aiAnalysis) return null;

  return (
    <section className="mb-6" aria-labelledby="ai-analysis-section-title" data-testid="ai-analysis-section">
      <button
        className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/10 rounded-xl border border-purple-200/50 dark:border-purple-800/30 focus:outline-none"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="ai-analysis-content"
      >
        <span className="font-semibold text-purple-900 dark:text-purple-300">AI Analysis</span>
        <span className="text-xs text-purple-700 dark:text-purple-400">{open ? 'Hide' : 'Show'}</span>
      </button>
      {open && (
        <div className="overflow-hidden pt-4" id="ai-analysis-content">
          <AiAnalysisContent aiAnalysis={aiAnalysis} />
        </div>
      )}
    </section>
  );
});
AiAnalysisSection.displayName = 'AiAnalysisSection'; 