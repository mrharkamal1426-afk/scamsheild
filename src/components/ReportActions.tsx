import React, { useState } from 'react';
import { Download, CheckCircle, Copy } from 'lucide-react';
import { ScanResult } from '../types';
// Removed: import { motion, AnimatePresence } from 'framer-motion';

interface ReportActionsProps {
  result: ScanResult;
  onReport?: (result: ScanResult) => void;
}

function formatTextReport(result: ScanResult): string {
  const mainBorder = '═'.repeat(68);
  const subBorder = '─'.repeat(68);
  
  let text = '';
  
  // Top Border with Title
  text += `
╔${mainBorder}╗
║                SCAMSHIELD ADVANCED SECURITY ANALYSIS               ║
╚${mainBorder}╝\n\n`;

  // Executive Summary
  text += `EXECUTIVE SUMMARY\n`;
  text += `${subBorder}\n`;
  text += `VERDICT: ${result.verdict.toUpperCase()}\n`;
  text += `RISK LEVEL: ${result.verdict === 'scam' ? 'HIGH' : 
    result.verdict === 'suspicious' ? 'MEDIUM' : 'LOW'}\n`;
  text += `THREAT SCORE: ${result.confidence}%\n`;
  text += `DETECTED THREATS: ${result.detectedThreats.length}\n`;
  text += `SUSPICIOUS URLs: ${result.urlScanResults ? 
    result.urlScanResults.filter(scan => scan.isUrlMalicious).length : 0}/${result.extractedUrls.length}\n\n`;

  // Analysis Metadata
  text += `ANALYSIS METADATA\n`;
  text += `${subBorder}\n`;
  text += `• Report ID: ${result.id}\n`;
  text += `• Scan Timestamp: ${result.timestamp instanceof Date ? 
    result.timestamp.toLocaleString() : result.timestamp}\n`;
  text += `• Analysis Duration: Real-time\n`;
  text += `• Threat Intelligence: Multiple Security Providers\n`;
  text += `• Analysis Methods: Pattern Analysis, URL Inspection, Behavioral Analysis${
    result.aiAnalysis ? ', AI Assessment' : ''}\n\n`;

  // Analyzed Message Content
  text += `ANALYZED MESSAGE CONTENT\n`;
  text += `${subBorder}\n`;
  text += `${result.message}\n\n`;

  // Network Security Analysis
  if (result.extractedUrls && result.extractedUrls.length > 0) {
    text += `NETWORK SECURITY ANALYSIS\n`;
    text += `${subBorder}\n`;
    text += `URLs Identified: ${result.extractedUrls.length}\n`;
    text += `Security Scan Status: Complete\n\n`;
    text += `Detailed URL Analysis:\n`;
    result.urlScanResults?.forEach((scan, idx) => {
      text += `• URL: ${scan.url}\n`;
      text += `  RISK SCORE: ${scan.isUrlMalicious ? 'HIGH ⚠️' : 'LOW ✓'}\n`;
      text += `  SECURITY ALERTS:\n`;
      scan.scanSources.forEach(source => {
        text += `    - ${source.source}: ${source.result}${
          source.details ? ` (${source.details})` : ''}\n`;
      });
      text += '\n';
    });
  }

  // Threat Intelligence Report
  if (result.detectedThreats.length > 0) {
    text += `THREAT INTELLIGENCE REPORT\n`;
    text += `${subBorder}\n`;
    text += `Total Security Findings: ${result.detectedThreats.length}\n\n`;
    
    const highThreats = result.detectedThreats.filter(t => t.severity === 'high');
    const mediumThreats = result.detectedThreats.filter(t => t.severity === 'medium');
    const lowThreats = result.detectedThreats.filter(t => t.severity === 'low');

    if (highThreats.length > 0) {
      text += `⚠️ CRITICAL/HIGH SEVERITY (${highThreats.length}):\n`;
      highThreats.forEach(threat => {
        text += `• ${threat.description}\n`;
        text += `  - Category: ${threat.type}\n`;
        if (threat.pattern) text += `  - Pattern: ${threat.pattern}\n`;
        if (threat.url) text += `  - Target URL: ${threat.url}\n`;
        text += `  - Detection Engine: ${threat.source}\n\n`;
      });
    }

    if (mediumThreats.length > 0) {
      text += `⚠️ MEDIUM SEVERITY (${mediumThreats.length}):\n`;
      mediumThreats.forEach(threat => {
        text += `• ${threat.description}\n`;
      });
      text += '\n';
    }
  }

  // Behavioral Analysis (AI)
  if (result.aiAnalysis) {
    text += `BEHAVIORAL ANALYSIS (AI)\n`;
    text += `${subBorder}\n`;
    text += `${result.aiAnalysis}\n\n`;
  }

  // Security Advisory
  text += `SECURITY ADVISORY\n`;
  text += `${subBorder}\n`;
  text += `IMMEDIATE ACTIONS:\n`;
  text += `1. ⛔ DO NOT INTERACT with any suspicious links/attachments\n`;
  text += `2. 🚫 Block and report suspicious senders\n`;
  text += `3. 🚨 Report this incident to relevant authorities\n`;
  text += `4. 🔍 Run a complete device security scan\n`;
  text += `5. 🔐 Update passwords for critical accounts\n`;
  text += `6. 📱 Enable 2FA where available\n\n`;

  text += `PREVENTION GUIDELINES:\n`;
  text += `• Never provide sensitive information through unverified channels\n`;
  text += `• Verify unusual requests through alternate communication methods\n`;
  text += `• Keep software and security tools updated\n`;
  text += `• Enable multi-factor authentication when available\n\n`;

  // Technical Details
  text += `TECHNICAL DETAILS\n`;
  text += `${subBorder}\n`;
  text += `• Analysis Engine: ScamShield v1.0\n`;
  text += `• Detection Methods: Pattern Matching, URL Analysis${
    result.aiAnalysis ? ', AI Analysis' : ''}\n`;
  text += `• Security Providers: ${result.urlScanResults?.[0]?.scanSources
    .map(s => s.source).join(', ') || 'local'}\n`;
  text += `• Analysis Mode: Real-time\n`;
  text += `• Report Generation: ${new Date().toISOString()}\n\n`;

  // Footer
  const footerBorder = '─'.repeat(80);
  text += `${footerBorder}\n`;
  text += `Generated by ScamShield - Enterprise-Grade Threat Detection\n`;
  text += `Developed by BLACK_LOTUS | Report ID: ${result.id}\n`;
  text += `Stay Safe, Stay Secure, Stay Protected\n`;
  text += `${footerBorder}\n`;

  return text;
}

export const ReportActions: React.FC<ReportActionsProps> = React.memo(({ result }) => {
  const [downloaded, setDownloaded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleDownload = () => {
    const text = formatTextReport(result);
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scan_report_${result.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  const handleCopy = async () => {
    const text = formatTextReport(result);
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4" data-testid="report-actions">
      {/* Success Message */}
      {downloaded && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle className="w-4 h-5 text-green-500" />
          <span className="text-sm text-green-700 dark:text-green-300">
            Report downloaded as TXT!
          </span>
        </div>
      )}
      {copied && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle className="w-4 h-5 text-blue-500" />
          <span className="text-sm text-blue-700 dark:text-blue-300">
            Report copied as TXT!
          </span>
        </div>
      )}

      {/* Download/Copy TXT Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg shadow transition-colors"
        >
          <Download className="w-4 h-4" />
          Download TXT
        </button>
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow transition-colors"
        >
          <Copy className="w-4 h-4" />
          Copy TXT
        </button>
      </div>
    </div>
  );
});

export default ReportActions; 