import React, { useState, useEffect, useRef } from 'react';
import { Shield, Key, X, Check, AlertTriangle } from 'lucide-react';
import { SecurityApiConfig } from '../types';

interface SecurityApiSettingsProps {
  config: SecurityApiConfig;
  onSave: (config: SecurityApiConfig) => void;
}

export default function SecurityApiSettings({ config, onSave }: SecurityApiSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempConfig, setTempConfig] = useState<SecurityApiConfig>(config || {});
  const [isLoading, setIsLoading] = useState(true);

  // Initialize state for each API provider
  const [googleSafeBrowsingKey, setGoogleSafeBrowsingKey] = useState('');
  const [googleSafeBrowsingEnabled, setGoogleSafeBrowsingEnabled] = useState(false);

  const [virusTotalKey, setVirusTotalKey] = useState('');
  const [virusTotalEnabled, setVirusTotalEnabled] = useState(false);

  // PhishTank is now always enabled with public API
  const [phishTankEnabled] = useState(true);

  // Update state when config changes (e.g., after loading from localStorage)
  useEffect(() => {
    if (config) {
      setGoogleSafeBrowsingKey(config.googleSafeBrowsing?.apiKey || '');
      setGoogleSafeBrowsingEnabled(config.googleSafeBrowsing?.enabled || false);
      
      setVirusTotalKey(config.virusTotal?.apiKey || '');
      setVirusTotalEnabled(config.virusTotal?.enabled || false);
      
      setTempConfig(config);
    }
    setIsLoading(false);
  }, [config]);

  // Scroll modal to top when opened
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.scrollTop = 0;
    }
  }, [isOpen]);

  const handleSave = () => {
    const newConfig: SecurityApiConfig = {};

    // Only add configurations for APIs with keys
    if (googleSafeBrowsingKey.trim()) {
      newConfig.googleSafeBrowsing = {
        apiKey: googleSafeBrowsingKey.trim(),
        enabled: googleSafeBrowsingEnabled,
      };
    }

    if (virusTotalKey.trim()) {
      newConfig.virusTotal = {
        apiKey: virusTotalKey.trim(),
        enabled: virusTotalEnabled,
      };
    }

    setTempConfig(newConfig);
    onSave(newConfig);
    setIsOpen(false);
  };

  const getConfiguredApisCount = () => {
    let count = 0;
    if (googleSafeBrowsingKey.trim() && googleSafeBrowsingEnabled) count++;
    if (virusTotalKey.trim() && virusTotalEnabled) count++;
    return count;
  };

  const modalRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <button
        onClick={() => {
          console.log('Opening modal, isLoading:', isLoading);
          setIsOpen(true);
        }}
        disabled={isLoading}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors shadow-sm ${
          isLoading
            ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
            : getConfiguredApisCount() > 0
            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800/40 border border-blue-200 dark:border-blue-800/50'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
        }`}
      >
        <Shield className={`w-4 h-4 ${isLoading ? 'animate-pulse' : ''}`} />
        <span className="text-sm font-medium">
          {isLoading
            ? 'Loading...'
            : getConfiguredApisCount() > 0
            ? `Security APIs (${getConfiguredApisCount()})`
            : 'Setup Security APIs'}
        </span>
      </button>

      {isOpen && !isLoading && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm">
          <div className="relative flex flex-col w-full max-w-lg h-auto max-h-[calc(100vh-5rem)] mt-20 bg-white dark:bg-gray-800 rounded-lg shadow-xl m-4">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Security API Settings</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* Scrollable Content */}
            <div className="flex-1 min-h-0 overflow-y-auto space-y-6 px-6 py-4">
              {/* Google Safe Browsing */}
              <div className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-800 dark:text-gray-100">Google Safe Browsing</h4>
                  <div className="relative inline-block w-10 mr-2 align-middle select-none transition-all duration-200">
                    <input
                      type="checkbox"
                      id="google-toggle"
                      checked={googleSafeBrowsingEnabled}
                      onChange={() => setGoogleSafeBrowsingEnabled(!googleSafeBrowsingEnabled)}
                      className="toggle-checkbox"
                      disabled={!googleSafeBrowsingKey.trim()}
                    />
                    <label
                      htmlFor="google-toggle"
                      className="toggle-label"
                    ></label>
                  </div>
                </div>
                <div className="relative">
                  <Key className="absolute left-3 top-3 w-5 h-5 text-gray-400 dark:text-gray-300" />
                  <input
                    type="password"
                    value={googleSafeBrowsingKey}
                    onChange={(e) => setGoogleSafeBrowsingKey(e.target.value)}
                    placeholder="Enter Google Safe Browsing API key..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-gray-600 dark:text-white dark:placeholder-gray-300"
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-300 mt-2">
                  Checks URLs against Google's Safe Browsing database of malicious websites.
                </p>
              </div>

              {/* VirusTotal */}
              <div className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-800 dark:text-gray-100">VirusTotal</h4>
                  <div className="relative inline-block w-10 mr-2 align-middle select-none transition-all duration-200">
                    <input
                      type="checkbox"
                      id="virustotal-toggle"
                      checked={virusTotalEnabled}
                      onChange={() => setVirusTotalEnabled(!virusTotalEnabled)}
                      className="toggle-checkbox"
                      disabled={!virusTotalKey.trim()}
                    />
                    <label
                      htmlFor="virustotal-toggle"
                      className="toggle-label"
                    ></label>
                  </div>
                </div>
                <div className="relative">
                  <Key className="absolute left-3 top-3 w-5 h-5 text-gray-400 dark:text-gray-300" />
                  <input
                    type="password"
                    value={virusTotalKey}
                    onChange={(e) => setVirusTotalKey(e.target.value)}
                    placeholder="Enter VirusTotal API key..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-gray-600 dark:text-white dark:placeholder-gray-300"
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-300 mt-2">
                  Scans URLs against multiple antivirus engines and website scanners.
                </p>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-yellow-800 dark:text-yellow-300">
                    <strong>Note:</strong> API keys are stored locally in your browser. No data is sent to our servers.
                    Each API may have rate limits or require registration.
                  </p>
                </div>
              </div>
            </div>
            {/* Sticky Footer */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <button
                onClick={handleSave}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white font-medium py-3 rounded-lg transition-colors shadow-sm"
              >
                <Check className="w-4 h-4" />
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}