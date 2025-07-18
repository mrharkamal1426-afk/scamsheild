export interface ThreatDetail {
  type: 'keyword' | 'domain' | 'pattern' | 'url' | 'structure' | 'ip' | 'subdomain';
  pattern?: string; // The pattern or keyword that matched
  severity: 'low' | 'medium' | 'high';
  description: string;
  source: 'local' | 'ai' | 'urlScan' | string;
  position?: { start: number; end: number }; // Where in the message
  matchedText?: string; // The actual matched text
  url?: string; // For URL-related threats
}

export interface ScanResult {
  id: string;
  message: string;
  verdict: 'safe' | 'suspicious' | 'scam';
  confidence: number;
  detectedThreats: ThreatDetail[];
  extractedUrls: string[];
  timestamp: Date;
  aiAnalysis?: string;
  urlScanResults?: UrlScanResult[];
}

export interface DetectionRule {
  type: 'keyword' | 'domain' | 'pattern';
  patterns: string[];
  severity: 'low' | 'medium' | 'high';
  description: string;
}

export interface ApiConfig {
  provider: 'openrouter' | 'groq';
  apiKey: string;
  model?: string;
}

export interface SecurityApiConfig {
  googleSafeBrowsing?: {
    apiKey: string;
    enabled: boolean;
  };
  virusTotal?: {
    apiKey: string;
    enabled: boolean;
  };
}

export interface UrlScanResult {
  url: string;
  isUrlMalicious: boolean;
  scanSources: {
    source: 'local' | 'googleSafeBrowsing' | 'virusTotal';
    result: 'safe' | 'malicious' | 'suspicious' | 'error' | 'pending';
    details?: string;
    scanId?: string; // For tracking pending scans
  }[];
  pendingScans?: boolean; // Indicates if any scans are still pending
}