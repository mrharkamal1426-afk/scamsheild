import { useState, useEffect } from 'react';
import { Shield, Github, ExternalLink, Sparkles } from 'lucide-react';
import MessageInput from './components/MessageInput';
import ScanResults from './components/ScanResults';
import ScanHistory from './components/ScanHistory';
import ApiSettings from './components/ApiSettings';
import SecurityApiSettings from './components/SecurityApiSettings';
import ThemeToggle from './components/ThemeToggle';
import Modal from './components/Modal';
import Footer from './components/Footer';
import AnalysisLoadingScreen from './components/AnalysisLoadingScreen';
import { ScanResult, ApiConfig, SecurityApiConfig } from './types';
import { analyzeMessage, generateScanId } from './utils/detectionEngine';
import { analyzeWithAI } from './utils/aiAnalysis';
import { saveScanResult, getScanHistory, clearScanHistory } from './utils/storage';

function App() {
  const [message, setMessage] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [currentResult, setCurrentResult] = useState<ScanResult | null>(null);
  const [scanHistory, setScanHistory] = useState<ScanResult[]>([]);
  const [apiConfig, setApiConfig] = useState<ApiConfig | null>(null);
  const [securityApiConfig, setSecurityApiConfig] = useState<SecurityApiConfig | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setScanHistory(getScanHistory());
    
    // Load API config from localStorage
    const savedConfig = localStorage.getItem('scamshield_api_config');
    if (savedConfig) {
      try {
        setApiConfig(JSON.parse(savedConfig));
      } catch (error) {
        console.error('Failed to load API config:', error);
      }
    }
    
    // Load security API config from localStorage
    const savedSecurityConfig = localStorage.getItem('scamshield_security_api_config');
    if (savedSecurityConfig) {
      try {
        setSecurityApiConfig(JSON.parse(savedSecurityConfig));
      } catch (error) {
        console.error('Failed to load security API config:', error);
        setSecurityApiConfig({});
      }
    } else {
      setSecurityApiConfig({});
    }
  }, []);

  const handleApiConfigSave = (config: ApiConfig | null) => {
    setApiConfig(config);
    if (config) {
      localStorage.setItem('scamshield_api_config', JSON.stringify(config));
    } else {
      localStorage.removeItem('scamshield_api_config');
    }
  };
  
  const handleSecurityApiConfigSave = (config: SecurityApiConfig) => {
    setSecurityApiConfig(config);
    if (Object.keys(config).length > 0) {
      localStorage.setItem('scamshield_security_api_config', JSON.stringify(config));
    } else {
      localStorage.removeItem('scamshield_security_api_config');
    }
  };

  const handleScan = async () => {
    if (!message.trim()) return;

    setIsScanning(true);
    
    try {
      // Perform analysis with security APIs if configured
      const analysis = await analyzeMessage(message, securityApiConfig || undefined);
      
      let aiAnalysis = '';
      if (apiConfig) {
        try {
          aiAnalysis = await analyzeWithAI(message, apiConfig);
        } catch (error) {
          console.error('AI analysis failed:', error);
          aiAnalysis = 'AI analysis failed - using local detection only';
        }
      }

      const result: ScanResult = {
        id: generateScanId(),
        timestamp: new Date(),
        aiAnalysis: aiAnalysis || undefined,
        ...analysis
      };

      setCurrentResult(result);
      setIsModalOpen(true);
      saveScanResult(result);
      setScanHistory(getScanHistory());
      
    } catch (error) {
      console.error('Scan failed:', error);
      // Show error result
      const errorResult: ScanResult = {
        id: generateScanId(),
        message,
        verdict: 'suspicious',
        confidence: 0,
        detectedThreats: [{
          type: 'keyword',
          severity: 'high',
          description: 'Analysis failed - please try again',
          source: 'local',
        }],
        extractedUrls: [],
        timestamp: new Date()
      };
      setCurrentResult(errorResult);
      setIsModalOpen(true);
    } finally {
      setIsScanning(false);
    }
  };

  const handleSelectHistoryResult = (result: ScanResult) => {
    setCurrentResult(result);
    setMessage(result.message);
    setIsModalOpen(true);
  };

  const handleClearHistory = () => {
    clearScanHistory();
    setScanHistory([]);
  };

  const handleReport = (result: ScanResult) => {
    // In a real application, this would send the report to a backend
    console.log('Scam reported:', result);
    alert('Thank you for reporting! This helps improve our detection algorithms.');
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-800 via-purple-900 to-gray-900 dark:from-blue-950 dark:via-purple-950 dark:to-black transition-colors duration-300">
      {/* Gradient Overlay for Contrast */}
      <div className="absolute inset-0 bg-white/40 dark:bg-black/70 pointer-events-none z-0"></div>
      <AnalysisLoadingScreen
        isVisible={isScanning}
        onComplete={() => {
          if (currentResult) setIsModalOpen(true);
          setIsScanning(false);
        }}
        threatsFound={!!(currentResult && currentResult.detectedThreats && currentResult.detectedThreats.length > 0)}
      />
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%239C92AC%22 fill-opacity=%220.03%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%224%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40 dark:opacity-20"></div>
      
      <div className="relative z-10">
        {/* Header */}
        <header className="glass-card sticky top-0 z-20 border-b border-white/20 dark:border-dark-500/30">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-xl shadow-lg group animate-pulse-slow">
                  <Shield className="w-8 h-8 text-white group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                    ScamShield
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Professional Scam & Phishing Detection
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <SecurityApiSettings config={securityApiConfig || {}} onSave={handleSecurityApiConfigSave} />
                <ApiSettings config={apiConfig} onSave={handleApiConfigSave} />
                
                <ThemeToggle />
                
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-500 rounded-lg transition-colors"
                >
                  <Github className="w-4 h-4" />
                  <span className="hidden sm:inline text-sm">Source</span>
                </a>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Input & Results */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <MessageInput
                  message={message}
                  onChange={setMessage}
                  onScan={handleScan}
                  isScanning={isScanning}
                />
              </div>
              {/* Modal for Scan Results */}
              <Modal isOpen={!!currentResult && isModalOpen} onClose={() => setIsModalOpen(false)}>
                {currentResult && (
                  <ScanResults
                    result={currentResult}
                    onReport={handleReport}
                  />
                )}
              </Modal>
              {/* Always show the Ready to Protect box */}
              <div className="glass-card p-12 text-center mt-8">
                <div className="max-w-md mx-auto">
                  <div className="p-4 bg-primary-500/10 dark:bg-primary-400/10 rounded-2xl w-fit mx-auto mb-6">
                    <Shield className="w-12 h-12 text-primary-600 dark:text-primary-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3">
                    Ready to Protect You
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Paste any suspicious message above and we'll analyze it for scam indicators, phishing attempts, and malicious links using advanced detection algorithms.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800/30 transition-all duration-300 hover:shadow-md">
                      <div className="font-medium text-green-800 dark:text-green-400">Local Analysis</div>
                      <div className="text-green-600 dark:text-green-500">Works Offline</div>
                    </div>
                    <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-100 dark:border-primary-800/30 transition-all duration-300 hover:shadow-md">
                      <div className="font-medium text-primary-800 dark:text-primary-400">URL Detection</div>
                      <div className="text-primary-600 dark:text-primary-500">Link Scanning</div>
                    </div>
                    <div className="p-3 bg-secondary-50 dark:bg-secondary-900/20 rounded-lg border border-secondary-100 dark:border-secondary-800/30 transition-all duration-300 hover:shadow-md">
                      <div className="font-medium text-secondary-800 dark:text-secondary-400">AI Enhanced</div>
                      <div className="text-secondary-600 dark:text-secondary-500">When Available</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - History */}
            <div className="space-y-8">
              <div>
                <ScanHistory
                  history={scanHistory}
                  onSelectResult={handleSelectHistoryResult}
                  onClearHistory={handleClearHistory}
                />
              </div>

              {/* Info Card */}
              <div className="bg-white/90 dark:bg-dark-800/90 rounded-2xl p-6 border border-primary-300 dark:border-primary-800 shadow-glass backdrop-blur-md">
                <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-secondary-500" />
                  Stay Protected
                </h3>
                <div className="space-y-3 text-sm text-gray-700 dark:text-gray-200">
                  <div className="flex items-start gap-3 hover:translate-x-1 transition-transform duration-300">
                    <div className="w-2 h-2 bg-secondary-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Never click suspicious links or download attachments from unknown sources</span>
                  </div>
                  <div className="flex items-start gap-3 hover:translate-x-1 transition-transform duration-300">
                    <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Verify sender identity before sharing personal information</span>
                  </div>
                  <div className="flex items-start gap-3 hover:translate-x-1 transition-transform duration-300">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Use ScamShield to analyze suspicious messages before responding</span>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-white/20 dark:border-dark-500/30">
                  <a
                    href="https://www.fbi.gov/how-we-can-help-you/scams-and-safety"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-secondary-600 dark:text-secondary-400 hover:text-secondary-700 dark:hover:text-secondary-300 text-sm font-medium transition-colors"
                  >
                    Learn more about scam prevention
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}

export default App;