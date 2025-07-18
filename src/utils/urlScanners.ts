import { SecurityApiConfig, UrlScanResult } from '../types';

/**
 * Scans one or more URLs using Google Safe Browsing API (batch support)
 * @param urls Array of URLs to scan
 * @param apiKey Google Safe Browsing API key
 * @returns Promise with a map of url -> { result, details }
 */
export async function scanWithGoogleSafeBrowsing(urls: string[], apiKey: string): Promise<Record<string, { result: 'safe' | 'malicious' | 'suspicious' | 'error'; details?: string }>> {
  try {
    const response = await fetch(`https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client: {
          clientId: 'scamshield',
          clientVersion: '1.0.0',
        },
        threatInfo: {
          threatTypes: [
            'MALWARE',
            'SOCIAL_ENGINEERING',
            'UNWANTED_SOFTWARE',
            'POTENTIALLY_HARMFUL_APPLICATION',
          ],
          platformTypes: ['ANY_PLATFORM'],
          threatEntryTypes: ['URL'],
          threatEntries: urls.map(url => ({ url })),
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Google Safe Browsing API error: ${response.statusText}`);
    }

    const data = await response.json();
    // Prepare result map
    const resultMap: Record<string, { result: 'safe' | 'malicious' | 'suspicious' | 'error'; details?: string }> = {};
    urls.forEach(url => {
      resultMap[url] = { result: 'safe' };
    });
    if (data.matches && Array.isArray(data.matches)) {
      data.matches.forEach((match: any) => {
        const url = match.threat && match.threat.url;
        if (url && resultMap[url]) {
          resultMap[url] = {
            result: 'malicious',
            details: `Threat types: ${match.threatType}`,
          };
        }
      });
    }
    return resultMap;
  } catch (error) {
    console.error('Google Safe Browsing scan failed:', error);
    // Return error for all URLs
    const resultMap: Record<string, { result: 'safe' | 'malicious' | 'suspicious' | 'error'; details?: string }> = {};
    urls.forEach(url => {
      resultMap[url] = {
        result: 'error',
        details: error instanceof Error ? error.message : 'Unknown error',
      };
    });
    return resultMap;
  }
}

// Backward compatibility: single URL version
export async function scanWithGoogleSafeBrowsingSingle(url: string, apiKey: string) {
  const resultMap = await scanWithGoogleSafeBrowsing([url], apiKey);
  return resultMap[url];
}

/**
 * Scans a URL using VirusTotal API
 * @param url The URL to scan
 * @param apiKey VirusTotal API key
 * @returns Promise with scan result and optional scan ID for pending scans
 */
export async function scanWithVirusTotal(url: string, apiKey: string): Promise<{
  result: 'safe' | 'malicious' | 'suspicious' | 'error' | 'pending';
  details?: string;
  scanId?: string;
}> {
  try {
    // First, try to get existing analysis
    const urlId = btoa(url).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    
    const analysisResponse = await fetch(`https://www.virustotal.com/api/v3/urls/${urlId}`, {
      method: 'GET',
      headers: {
        'x-apikey': apiKey,
      },
    });

    // If URL hasn't been analyzed yet or analysis is too old
    if (analysisResponse.status === 404 || analysisResponse.status === 401) {
      console.log('Submitting new URL scan to VirusTotal...');
      
      // Submit URL for scanning
        const submitResponse = await fetch('https://www.virustotal.com/api/v3/urls', {
          method: 'POST',
          headers: {
            'x-apikey': apiKey,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: `url=${encodeURIComponent(url)}`,
        });

        if (!submitResponse.ok) {
        throw new Error(`VirusTotal submission error: ${submitResponse.statusText}`);
        }

        const submitData = await submitResponse.json();
        const analysisId = submitData.data?.id;

      if (!analysisId) {
        throw new Error('Failed to get analysis ID from VirusTotal');
      }

      // Try to get immediate results
      const immediateResponse = await fetch(`https://www.virustotal.com/api/v3/analyses/${analysisId}`, {
        method: 'GET',
        headers: {
          'x-apikey': apiKey,
        },
      });

      if (!immediateResponse.ok) {
        return {
          result: 'pending',
          details: 'Analysis in progress. Please check back in a few minutes.',
          scanId: analysisId
        };
      }

      const immediateData = await immediateResponse.json();
      const attributes = immediateData.data?.attributes;

      if (!attributes || attributes.status === 'queued' || attributes.status === 'in-progress') {
        return {
          result: 'pending',
          details: 'Analysis in progress. Results will be available shortly.',
          scanId: analysisId
        };
      }
      
      // Process immediate results
      return processVirusTotalResults(attributes);
    }

    if (!analysisResponse.ok) {
      throw new Error(`VirusTotal API error: ${analysisResponse.statusText}`);
    }

    const data = await analysisResponse.json();
    const attributes = data.data?.attributes;
    
    if (!attributes) {
      return {
        result: 'error',
        details: 'No analysis data available'
      };
    }

    return processVirusTotalResults(attributes);
  } catch (error) {
    console.error('VirusTotal scan failed:', error);
    return {
      result: 'error',
      details: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Process VirusTotal analysis results
 */
function processVirusTotalResults(attributes: any): {
  result: 'safe' | 'malicious' | 'suspicious' | 'error';
  details?: string;
} {
  const stats = attributes.stats || attributes.last_analysis_stats;
  if (!stats) {
    return {
      result: 'error',
      details: 'Invalid analysis data'
    };
  }

  const totalEngines = stats.harmless + stats.malicious + stats.suspicious + stats.undetected;
  const maliciousCount = stats.malicious;
  const suspiciousCount = stats.suspicious;

  // Calculate percentage of detections
  const detectionRate = ((maliciousCount + suspiciousCount) / totalEngines) * 100;

  if (maliciousCount > 0) {
    return {
      result: 'malicious',
      details: `Detected as malicious by ${maliciousCount} out of ${totalEngines} security vendors (${detectionRate.toFixed(1)}% detection rate)`,
    };
  } else if (suspiciousCount > 0) {
    return {
      result: 'suspicious',
      details: `Flagged as suspicious by ${suspiciousCount} out of ${totalEngines} security vendors (${detectionRate.toFixed(1)}% detection rate)`,
    };
  }

  return { 
    result: 'safe',
    details: `Analyzed by ${totalEngines} security vendors - no threats detected`
  };
}

/**
 * Retrieves the result of a pending VirusTotal scan
 * @param scanId The scan ID from a previous pending result
 * @param apiKey VirusTotal API key
 * @returns Promise with scan result
 */
export async function getVirusTotalResult(scanId: string, apiKey: string): Promise<{
  result: 'safe' | 'malicious' | 'suspicious' | 'error' | 'pending';
  details?: string;
}> {
  try {
    const response = await fetch(`https://www.virustotal.com/api/v3/analyses/${scanId}`, {
      method: 'GET',
      headers: {
        'x-apikey': apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`VirusTotal API error: ${response.statusText}`);
    }

    const data = await response.json();
    const attributes = data.data?.attributes;

    if (!attributes) {
      return { result: 'error', details: 'No analysis data available' };
    }

    // Check if analysis is still pending
    if (attributes.status === 'queued' || attributes.status === 'in-progress') {
      return {
        result: 'pending',
        details: `Analysis is ${attributes.status}. Results will be available shortly.`
      };
    }

    return processVirusTotalResults(attributes);
  } catch (error) {
    console.error('VirusTotal result fetch failed:', error);
    return {
      result: 'error',
      details: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Scans a URL using all configured security APIs
 * @param url The URL to scan
 * @param securityConfig Security API configuration
 * @returns Promise with combined scan result
 */
export async function scanUrl(url: string, securityConfig: SecurityApiConfig): Promise<UrlScanResult> {
  const scanSources: UrlScanResult['scanSources'] = [];
  const scanPromises: Promise<void>[] = [];

  // Add local scan result
  const localScanResult = performLocalUrlCheck(url);
  scanSources.push({
    source: 'local',
    result: localScanResult.result,
    details: localScanResult.details?.join('; ')
  });

  // Google Safe Browsing scan
  if (securityConfig.googleSafeBrowsing?.enabled && securityConfig.googleSafeBrowsing.apiKey) {
    scanPromises.push(
      scanWithGoogleSafeBrowsingSingle(url, securityConfig.googleSafeBrowsing.apiKey).then(result => {
        scanSources.push({
          source: 'googleSafeBrowsing',
          ...result,
        });
      })
    );
  }

  // VirusTotal scan
  if (securityConfig.virusTotal?.enabled && securityConfig.virusTotal.apiKey) {
    scanPromises.push(
      scanWithVirusTotal(url, securityConfig.virusTotal.apiKey).then(result => {
        scanSources.push({
          source: 'virusTotal',
          ...result,
        });
      })
    );
  }

  // Wait for all scans to complete
  await Promise.all(scanPromises);

  // Check for pending scans
  const hasPendingScans = scanSources.some(source => source.result === 'pending');

  // Determine if URL is malicious based on scan results
  const isUrlMalicious = scanSources.some(source => 
    source.result !== 'pending' && (source.result === 'malicious' || source.result === 'suspicious')
  );

  return {
    url,
    isUrlMalicious,
    scanSources,
    pendingScans: hasPendingScans
  };
}

/**
 * Checks the status of pending scans for a URL
 * @param urlScanResult Previous scan result with pending scans
 * @param securityConfig Security API configuration
 * @returns Promise with updated scan result
 */
export async function checkPendingScans(
  urlScanResult: UrlScanResult,
  securityConfig: SecurityApiConfig
): Promise<UrlScanResult> {
  if (!urlScanResult.pendingScans) {
    return urlScanResult;
  }

  const updatedScanSources = [...urlScanResult.scanSources];
  const updatePromises: Promise<void>[] = [];

  // Check VirusTotal pending scans
  if (securityConfig.virusTotal?.enabled && securityConfig.virusTotal.apiKey) {
    const pendingVirusTotal = updatedScanSources.find(
      source => source.source === 'virusTotal' && source.result === 'pending' && source.scanId
    );
    
    if (pendingVirusTotal?.scanId) {
      updatePromises.push(
        getVirusTotalResult(pendingVirusTotal.scanId, securityConfig.virusTotal.apiKey).then(result => {
          const index = updatedScanSources.findIndex(
            source => source.source === 'virusTotal' && source.scanId === pendingVirusTotal.scanId
          );
          if (index !== -1) {
            updatedScanSources[index] = {
              ...updatedScanSources[index],
              result: result.result,
              details: result.details
            };
          }
        })
      );
    }
  }

  // Wait for all updates to complete
  await Promise.all(updatePromises);

  // Check if there are still pending scans
  const hasPendingScans = updatedScanSources.some(source => source.result === 'pending');

  // Determine if URL is malicious based on updated results
  const isUrlMalicious = updatedScanSources.some(source => 
    source.result !== 'pending' && (source.result === 'malicious' || source.result === 'suspicious')
  );

  return {
    ...urlScanResult,
    isUrlMalicious,
    scanSources: updatedScanSources,
    pendingScans: hasPendingScans
  };
}

type UrlCheckResult = 'safe' | 'suspicious' | 'malicious' | 'error';

/**
 * Performs a detailed local check on the URL
 * @param url The URL to check
 * @returns Result of the local check with detailed analysis
 */
function performLocalUrlCheck(url: string): { 
  result: UrlCheckResult;
  details?: string[];
} {
  const details: string[] = [];
  let riskLevel: UrlCheckResult = 'safe';
  
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    const domain = urlObj.hostname;
    const path = urlObj.pathname;
    const query = urlObj.search;
    
    // Domain Analysis
    const domainParts = domain.split('.');
  
  // Check for suspicious TLDs
    const suspiciousTlds = ['.xyz', '.top', '.click', '.tk', '.ml', '.ga', '.cf', '.gq', '.work', '.fit'];
    if (suspiciousTlds.some(tld => domain.endsWith(tld))) {
      details.push(`Suspicious TLD: ${domainParts[domainParts.length - 1]}`);
      riskLevel = 'suspicious';
    }
    
    // Check for excessive subdomains
    if (domainParts.length > 3) {
      details.push(`Unusual number of subdomains: ${domainParts.length}`);
      riskLevel = 'suspicious';
    }
    
    // Check for numeric or hexadecimal domains
    if (/^[0-9a-f]+$/i.test(domainParts[0])) {
      details.push('Domain contains only numbers or hex characters');
      riskLevel = 'suspicious';
  }
  
  // Check for URL shorteners
  const urlShorteners = [
    'bit.ly', 'tinyurl.com', 'short.link', 'tiny.cc', 't.co', 'goo.gl', 
    'ow.ly', 'buff.ly', 'is.gd', 'rebrand.ly', 'cutt.ly', 'linktr.ee'
  ];
    if (urlShorteners.some(shortener => domain.includes(shortener))) {
      details.push('URL shortener detected');
      riskLevel = 'suspicious';
    }
    
    // Check for IP address URLs
    if (/^\d+\.\d+\.\d+\.\d+$/.test(domain)) {
      details.push('Direct IP address used as domain');
      riskLevel = 'suspicious';
    }
    
    // Path Analysis
    if (path !== '/') {
      // Check for suspicious file extensions
      const suspiciousExtensions = ['.exe', '.zip', '.scr', '.js', '.jar', '.bat', '.cmd', '.vbs', '.ps1'];
      if (suspiciousExtensions.some(ext => path.toLowerCase().endsWith(ext))) {
        details.push(`Suspicious file extension: ${path.split('.').pop()}`);
        riskLevel = 'malicious';
      }
      
      // Check for suspicious path patterns
      const suspiciousPathPatterns = [
        'login', 'signin', 'account', 'verify', 'secure', 'update', 'password',
        'confirm', 'security', 'authenticate', 'wallet', 'recover'
      ];
      if (suspiciousPathPatterns.some(pattern => path.toLowerCase().includes(pattern))) {
        details.push('Path contains suspicious authentication-related terms');
        riskLevel = riskLevel === 'malicious' ? 'malicious' : 'suspicious';
      }
      
      // Check for obfuscated paths
      if (/[%]{2,}/.test(path) || /[.]{2,}/.test(path)) {
        details.push('Path contains suspicious encoding patterns');
        riskLevel = 'suspicious';
      }
    }
    
    // Query Parameter Analysis
    if (query) {
      const params = new URLSearchParams(query);
      
      // Check for sensitive parameter names
      const sensitiveParams = ['token', 'auth', 'key', 'pass', 'pwd', 'secret', 'hash'];
      for (const [key] of params) {
        if (sensitiveParams.some(param => key.toLowerCase().includes(param))) {
          details.push('Query contains sensitive parameters');
          riskLevel = 'suspicious';
          break;
        }
      }
      
      // Check for suspicious parameter values
      for (const [, value] of params) {
        // Check for base64 encoded content
        if (/^[A-Za-z0-9+/]{20,}={0,2}$/.test(value)) {
          details.push('Query contains possible encoded data');
          riskLevel = 'suspicious';
        }
        
        // Check for script injection attempts
        if (/<script|javascript:|data:/i.test(value)) {
          details.push('Query contains possible script injection');
          riskLevel = 'malicious';
        }
      }
      
      // Check for excessive parameters
      if (Array.from(params).length > 10) {
        details.push('Unusually high number of query parameters');
        riskLevel = 'suspicious';
      }
    }
    
    // Mixed character set detection
    if (/[\u0080-\uffff]/.test(domain)) {
      details.push('Domain contains non-ASCII characters');
      riskLevel = 'suspicious';
    }
    
    // Length checks
    if (domain.length > 50) {
      details.push('Unusually long domain name');
      riskLevel = 'suspicious';
    }
    
    return {
      result: riskLevel,
      details: details.length > 0 ? details : undefined
    };
  } catch (error) {
    return {
      result: 'error',
      details: ['Invalid URL format']
    };
  }
}