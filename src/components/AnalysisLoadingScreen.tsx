import { useState, useEffect } from 'react';
import { Shield, Search, Link, Brain, CheckCircle, AlertTriangle, Gem } from 'lucide-react';

interface AnalysisStep {
  icon: JSX.Element;
  title: string;
  description: string;
  status: 'pending' | 'loading' | 'complete' | 'error';
  result?: string;
  externalSource?: boolean;
  threatCheck?: boolean; // New: does this step check for threats?
}

interface Props {
  isVisible: boolean;
  onComplete?: () => void;
  threatsFound?: boolean;
}

export default function AnalysisLoadingScreen({ isVisible, onComplete, threatsFound }: Props) {
  const [steps, setSteps] = useState<AnalysisStep[]>([
    {
      icon: <Search className="w-5 h-5" />,
      title: "Initializing Premium Analysis",
      description: "Activating advanced security modules",
      status: "pending"
    },
    {
      icon: <Link className="w-5 h-5" />,
      title: "Deep URL Pattern Scan",
      description: "Detecting sophisticated threats and malicious links",
      status: "pending",
      externalSource: true,
      threatCheck: true
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: "Elite Security Check",
      description: "Cross-referencing with global threat intelligence",
      status: "pending",
      externalSource: true,
      threatCheck: true
    },
    {
      icon: <Brain className="w-5 h-5" />,
      title: "AI-Powered Threat Analysis",
      description: "Leveraging AI for next-gen threat detection",
      status: "pending",
      threatCheck: true
    }
  ]);
  const [percent, setPercent] = useState(0);
  const [allDone, setAllDone] = useState(false);

  // Responsive timings for steps
  const timings = [0, 1500, 3000, 4500];
  const completionTimings = [1400, 2900, 4400, 5900];
  const totalDuration = completionTimings[completionTimings.length - 1] + 800;

  useEffect(() => {
    let percentInterval: ReturnType<typeof setInterval> | null = null;
    if (!isVisible) {
      setSteps(steps.map(step => ({ ...step, status: 'pending', result: undefined })));
      setPercent(0);
      setAllDone(false);
      if (percentInterval) clearInterval(percentInterval);
      return;
    }
    timings.forEach((timing, index) => {
      setTimeout(() => {
        setSteps(current =>
          current.map((step, i) =>
            i === index ? { ...step, status: 'loading' } : step
          )
        );
      }, timing);
      setTimeout(() => {
        setSteps(current =>
          current.map((step, i) => {
            if (i !== index) return step;
            // Show threat result only for threatCheck steps
            let result = undefined;
            if (step.threatCheck) {
              if (threatsFound) {
                result = 'Threat detected!';
              } else {
                result = 'No threat detected';
              }
            } else if (step.externalSource) {
              result = 'Checked external sources';
            }
            return {
              ...step,
              status: 'complete',
              result
            };
          })
        );
      }, completionTimings[index]);
    });
    let start = Date.now();
    percentInterval = setInterval(() => {
      const elapsed = Date.now() - start;
      let p = Math.min(100, Math.round((elapsed / totalDuration) * 100));
      setPercent(p);
      if (p >= 100) {
        clearInterval(percentInterval!);
      }
    }, 20);
    setTimeout(() => {
      setPercent(100);
      setAllDone(true);
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 200); // 5 second delay for user to see the message
    }, totalDuration);
    return () => {
      if (percentInterval) clearInterval(percentInterval);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible, threatsFound]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md">
      {/* Container Box */}
      <div className="w-[90%] max-w-md mx-auto bg-gradient-to-b from-white to-gray-50/95 dark:from-dark-800 dark:to-dark-900/95 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-white/20 dark:border-dark-700/40 overflow-hidden">
        {/* Header Section */}
        <div className="relative px-8 pt-8 pb-8 text-center bg-gradient-to-br from-primary-500/5 via-secondary-500/10 to-primary-500/5 dark:from-primary-900/20 dark:via-secondary-900/30 dark:to-primary-900/20 border-b border-primary-100/20 dark:border-dark-700/40">
          {/* Premium Brand Section */}
          <div className="relative">
            {/* Logo & Title */}
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl blur-lg opacity-50"></div>
                <div className="relative p-3 bg-gradient-to-br from-primary-500 via-secondary-500 to-primary-600 rounded-xl shadow-xl">
                  <Gem className="w-8 h-8 text-white drop-shadow-lg" />
                </div>
              </div>
              <div className="text-left">
                <h1 className="text-3xl font-extrabold bg-gradient-to-r from-gray-900 via-red-600 to-gray-900 dark:from-white dark:via-red-500 dark:to-white bg-[length:200%_100%] animate-gradient-x bg-clip-text text-transparent tracking-tight">
                  ScamShield
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <div className="h-0.5 w-3 bg-red-500/30 rounded-full"></div>
                  <span className="text-xs font-bold tracking-widest text-gray-800/90 dark:text-gray-100/90">
                    ENTERPRISE PROTECTION
                  </span>
                  <div className="h-0.5 flex-1 bg-red-500/30 rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Premium Status */}
            <div className="flex items-center justify-center gap-3">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-red-500/20 to-transparent"></div>
              <div className="px-4 py-1.5 bg-gradient-to-r from-gray-900/10 via-red-500/10 to-gray-900/10 dark:from-white/5 dark:via-red-500/20 dark:to-white/5 border border-red-500/20 rounded-full shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
                  <span className="text-sm font-medium bg-gradient-to-r from-gray-900 via-red-600 to-gray-900 dark:from-white dark:via-red-500 dark:to-white bg-[length:200%_100%] animate-gradient-x bg-clip-text text-transparent">
                    Premium Security Active
                  </span>
                </div>
              </div>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-red-500/20 to-transparent"></div>
            </div>
          </div>
        </div>

        {/* Progress Section */}
        <div className="px-6 pb-6">
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Analysis Progress</span>
              <span className="text-sm font-bold text-primary-600 dark:text-primary-400">{percent}%</span>
            </div>
            <div className="h-1.5 bg-gray-100 dark:bg-dark-600 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full transition-all duration-300"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-3">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
                  step.status === 'loading'
                    ? 'bg-primary-50 dark:bg-primary-900/20 ring-1 ring-primary-500/20'
                    : step.status === 'complete'
                    ? 'bg-green-50 dark:bg-green-900/20'
                    : ''
                }`}
              >
                <div
                  className={`p-2 rounded-lg ${
                    step.status === 'loading'
                      ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400'
                      : step.status === 'complete'
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                      : 'bg-gray-100 dark:bg-dark-600 text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {step.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {step.title}
                    </h3>
                    {step.externalSource && (
                      <span className="px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded text-[10px] font-medium">API</span>
                    )}
                  </div>
                  {step.status === 'complete' && step.result && (
                    <p className={`text-xs mt-0.5 ${
                      step.result === 'Threat detected!' 
                        ? 'text-red-600 dark:text-red-400 font-medium' 
                        : 'text-green-600 dark:text-green-400'
                    }`}>{step.result}</p>
                  )}
                </div>
                <div className="flex-shrink-0">
                  {step.status === 'loading' && (
                    <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                  )}
                  {step.status === 'complete' && (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                  {step.status === 'error' && (
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Status Message */}
          {allDone && (
            <div className="mt-6 text-center space-y-2">
              <div 
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${
                  threatsFound 
                    ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' 
                    : 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                }`}
              >
                <CheckCircle className="w-4 h-4" />
                {threatsFound ? 'Threats detected!' : 'Analysis complete'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Now showing result screen...
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-dark-900/50 border-t border-gray-100 dark:border-dark-700/50 text-center">
          <div className="text-sm font-medium text-gray-900 dark:text-white">Developed by Black_Lotus</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Enterprise Security Solution</div>
        </div>
      </div>
    </div>
  );
} 