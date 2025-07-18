import { DetectionRule, ScanResult, SecurityApiConfig, ThreatDetail, UrlScanResult } from '../types';
import { scanUrl } from './urlScanners';
import { analyzeWithAI } from './aiAnalysis';
import { ApiConfig } from '../types';

// Comprehensive detection rules
const DETECTION_RULES: DetectionRule[] = [
  {
    type: 'keyword',
    patterns: [
      'click here', 'urgent', 'kyc update', 'otp', 'claim now', 'congratulations',
      'you have won', 'lottery', 'prize', 'immediate action', 'verify now',
      'suspended account', 'click link', 'limited time', 'act now', 'expires today',
      'free gift', 'cash prize', 'bank account', 'credit card', 'social security',
      'tax refund', 'government grant', 'inheritance', 'prince', 'attorney',
      'beneficiary', 'transfer money', 'wire transfer', 'bitcoin', 'cryptocurrency'
    ],
    severity: 'high',
    description: 'Common scam keywords detected'
  },
  {
    type: 'domain',
    patterns: [
      '.xyz', '.top', '.click', '.tk', '.ml', '.ga', '.cf', 'bit.ly', 'tinyurl.com',
      'short.link', 'tiny.cc', 't.co', 'goo.gl', 'ow.ly', 'buff.ly', 'is.gd',
      'rebrand.ly', 'cutt.ly', 'linktr.ee'
    ],
    severity: 'medium',
    description: 'Suspicious or shortened domains detected'
  },
  {
    type: 'pattern',
    patterns: [
      'secure.*verify', 'account.*suspended', 'update.*payment', 'confirm.*identity',
      'reset.*password', 'unlock.*account', 'verify.*information', 'update.*details',
      'click.*link.*below', 'download.*attachment', 'open.*link', 'visit.*site'
    ],
    severity: 'high',
    description: 'Phishing intent patterns detected'
  }
];

// URL extraction regex
const URL_REGEX = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?)/gi;

export function extractUrls(text: string): string[] {
  const urls = text.match(URL_REGEX) || [];
  return urls.map(url => {
    if (!url.startsWith('http')) {
      return url.startsWith('www.') ? `https://${url}` : `https://${url}`;
    }
    return url;
  });
}

// Helper to get and set AI-suggested rules in localStorage
function getAISuggestedRules(): DetectionRule[] {
  try {
    return JSON.parse(localStorage.getItem('aiSuggestedRules') || '[]');
  } catch {
    return [];
  }
}
function setAISuggestedRules(rules: DetectionRule[]) {
  localStorage.setItem('aiSuggestedRules', JSON.stringify(rules));
}

// Automatically analyze new user-reported threats with AI and update rules
async function updateAISuggestedRulesFromReports(apiConfig: ApiConfig) {
  let userReportedThreats: any[] = [];
  try {
    userReportedThreats = JSON.parse(localStorage.getItem('reportedThreats') || '[]');
  } catch {}
  if (!userReportedThreats.length) return;

  // Concatenate all unique reported messages
  const uniqueMessages = Array.from(new Set(userReportedThreats.map(r => r.message).filter(Boolean)));
  let allPatterns: string[] = [];
  for (const message of uniqueMessages) {
    try {
      const aiAnalysis = await analyzeWithAI(message, apiConfig);
      // Extract patterns/keywords from AI response (simple heuristic: look for KEY FINDINGS and suspicious phrases)
      const keyFindingsMatch = aiAnalysis.match(/KEY FINDINGS([\s\S]*?)(REQUIRED ACTIONS|SECURITY INSIGHT|ANALYSIS CONFIDENCE|$)/i);
      if (keyFindingsMatch) {
        const findings = keyFindingsMatch[1].split(/[\n\u2022\-]/).map(l => l.trim()).filter(Boolean);
        allPatterns.push(...findings);
      }
    } catch (e) {
      // Ignore AI errors for now
    }
  }
  // Create new detection rules from AI patterns
  const aiRules: DetectionRule[] = allPatterns.filter(Boolean).map(pattern => ({
    type: 'pattern',
    patterns: [pattern],
    severity: 'high',
    description: 'AI-suggested threat pattern'
  }));
  if (aiRules.length) {
    setAISuggestedRules(aiRules);
  }
}

export async function analyzeMessage(message: string, securityConfig?: SecurityApiConfig, apiConfig?: ApiConfig): Promise<Omit<ScanResult, 'id' | 'timestamp'>> {
  const extractedUrls = extractUrls(message);
  
  // Load user-reported threats from localStorage
  let userReportedThreats: any[] = [];
  try {
    userReportedThreats = JSON.parse(localStorage.getItem('reportedThreats') || '[]');
  } catch {}

  // Optionally update AI-suggested rules automatically
  if (apiConfig && userReportedThreats.length) {
    updateAISuggestedRulesFromReports(apiConfig);
  }

  // Merge AI-suggested rules
  const aiSuggestedRules = getAISuggestedRules();
  const allDetectionRules = [...DETECTION_RULES, ...aiSuggestedRules];

  // Scan URLs if security APIs are configured
  const urlScanResults: UrlScanResult[] = [];
  const detectedThreats: ThreatDetail[] = [];
  let totalScore = 0;
  let maxSeverityScore = 0;

  // Check against user-reported threats
  userReportedThreats.forEach((report) => {
    // Match by message content
    if (report.message && message && report.message.trim() === message.trim()) {
      detectedThreats.push({
        type: 'pattern',
        severity: 'high',
        description: 'This message was reported as a threat by a user.',
        source: 'user',
        matchedText: message
      });
      totalScore += 5;
      maxSeverityScore = Math.max(maxSeverityScore, 5);
    }
    // Match by URL
    if (report.extractedUrls && Array.isArray(report.extractedUrls)) {
      report.extractedUrls.forEach((reportedUrl: string) => {
        if (extractedUrls.includes(reportedUrl)) {
          detectedThreats.push({
            type: 'url',
            severity: 'high',
            description: `This URL was reported as a threat by a user: ${reportedUrl}`,
            source: 'user',
            url: reportedUrl
          });
          totalScore += 5;
          maxSeverityScore = Math.max(maxSeverityScore, 5);
        }
      });
    }
  });

  if (securityConfig && extractedUrls.length > 0) {
    const scanPromises = extractedUrls.map(url => scanUrl(url, securityConfig));
    const results = await Promise.all(scanPromises);
    urlScanResults.push(...results);
    // Add threats from URL scans
    results.forEach(result => {
      if (result.isUrlMalicious) {
        const maliciousSources = result.scanSources
          .filter(source => source.result === 'malicious' || source.result === 'suspicious')
          .map(source => `${source.source}: ${source.details || source.result}`);
        if (maliciousSources.length > 0) {
          detectedThreats.push({
            type: 'url',
            severity: 'high',
            description: `Malicious URL detected: ${result.url} (${maliciousSources.join(', ')})`,
            source: 'urlScan',
            url: result.url
          });
          totalScore += 3;
          maxSeverityScore = Math.max(maxSeverityScore, 3);
        }
      }
    });
  }

  // Analyze against detection rules
  allDetectionRules.forEach(rule => {
    const severityWeight = rule.severity === 'high' ? 3 : rule.severity === 'medium' ? 2 : 1;
    rule.patterns.forEach(pattern => {
      const regex = new RegExp(pattern.replace(/\*/g, '.*'), 'ig');
      let match;
      if (rule.type === 'keyword' || rule.type === 'pattern') {
        while ((match = regex.exec(message)) !== null) {
          detectedThreats.push({
            type: rule.type,
            pattern,
            severity: rule.severity,
            description: rule.description,
            source: 'local',
            position: { start: match.index, end: match.index + match[0].length },
            matchedText: match[0]
          });
          totalScore += severityWeight;
          maxSeverityScore = Math.max(maxSeverityScore, severityWeight);
        }
      } else if (rule.type === 'domain') {
        extractedUrls.forEach(url => {
          if (regex.test(url.toLowerCase())) {
            detectedThreats.push({
              type: 'domain',
              pattern,
              severity: rule.severity,
              description: rule.description,
              source: 'local',
              url
            });
            totalScore += severityWeight;
            maxSeverityScore = Math.max(maxSeverityScore, severityWeight);
          }
        });
      }
    });
  });

  // Additional URL analysis
  extractedUrls.forEach(url => {
    const domain = extractDomain(url);
    if (domain) {
      // Suspicious structure
      if (url.includes('secure') || url.includes('verify') || url.includes('account')) {
        detectedThreats.push({
          type: 'structure',
          severity: 'medium',
          description: `Suspicious URL structure: ${url}`,
          source: 'local',
          url
        });
        totalScore += 2;
        maxSeverityScore = Math.max(maxSeverityScore, 2);
      }
      // Direct IP
      if (/\d+\.\d+\.\d+\.\d+/.test(domain)) {
        detectedThreats.push({
          type: 'ip',
          severity: 'high',
          description: `Direct IP address used: ${domain}`,
          source: 'local',
          url
        });
        totalScore += 3;
        maxSeverityScore = Math.max(maxSeverityScore, 3);
      }
      // Excessive subdomains
      if (domain.split('.').length > 4) {
        detectedThreats.push({
          type: 'subdomain',
          severity: 'medium',
          description: `Excessive subdomains: ${domain}`,
          source: 'local',
          url
        });
        totalScore += 2;
        maxSeverityScore = Math.max(maxSeverityScore, 2);
      }
    }
  });

  // Determine verdict based on score and severity
  let verdict: 'safe' | 'suspicious' | 'scam';
  let confidence: number;
  if (maxSeverityScore >= 3 || totalScore >= 6) {
    verdict = 'scam';
    confidence = Math.min(95, 70 + (totalScore * 3));
  } else if (maxSeverityScore >= 2 || totalScore >= 3) {
    verdict = 'suspicious';
    confidence = Math.min(85, 50 + (totalScore * 5));
  } else {
    verdict = 'safe';
    confidence = Math.max(15, 90 - (totalScore * 10));
  }

  return {
    message,
    verdict,
    confidence,
    detectedThreats,
    extractedUrls,
    urlScanResults: urlScanResults.length > 0 ? urlScanResults : undefined
  };
}

function extractDomain(url: string): string | null {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    return urlObj.hostname;
  } catch {
    return null;
  }
}

export function generateScanId(): string {
  return `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}