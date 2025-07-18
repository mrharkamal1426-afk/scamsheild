import { ApiConfig } from '../types';

const AI_PROMPT = `You are ScamShield's elite security analyst. Your task is to deliver a precise, authoritative analysis of potential security threats. Be direct, professional, and impactful.

Format your response EXACTLY as follows:

INSTANT VERDICT
[One authoritative statement about the security status. Be precise and confident.]
Example: "Critical security threat detected. This is a sophisticated phishing attempt targeting personal information."

CRITICAL RISK
[Most severe threat identified, with professional real-world analogy]
Example: "This message employs advanced impersonation techniques, similar to a counterfeit document that perfectly mimics official credentials."

KEY FINDINGS
• [Primary security concern]
• [Secondary security concern]
• [Additional security element]
Maximum 3 points. Be precise and authoritative.

REQUIRED ACTIONS
1. [Primary mitigation step]
2. [Secondary mitigation step]
3. [Final security measure]
Must be specific, actionable directives.

SECURITY INSIGHT
[One crucial security principle relevant to this threat]
Example: "Financial institutions utilize secure channels with multi-factor authentication - they never request credential verification through email links."

ANALYSIS CONFIDENCE
[Percentage] followed by brief, authoritative justification.
Example: "95% Confidence - Multiple confirmed indicators of sophisticated social engineering tactics."

Maintain professional tone. Focus on precision and authority. Every word must serve a security purpose.

Message to analyze:`;

function findSuspiciousLinks(message: string): string[] {
  // Simple regex for URLs
  const urlRegex = /https?:\/\/[\w.-]+(?:\.[\w\.-]+)+(?:[\w\-\._~:/?#[\]@!$&'()*+,;=]*)?/gi;
  const urls = message.match(urlRegex) || [];
  // List of suspicious TLDs and patterns
  const suspiciousTlds = ['.ru', '.cn', '.tk', '.ml', '.ga', '.cf', '.gq', '.work', '.zip', '.review'];
  const urlShorteners = ['bit.ly', 'tinyurl.com', 'goo.gl', 't.co', 'ow.ly', 'is.gd', 'buff.ly', 'adf.ly', 'bit.do'];
  return urls.filter(url => {
    try {
      const parsed = new URL(url);
      const hostname = parsed.hostname.toLowerCase();
      // Check for suspicious TLDs
      if (suspiciousTlds.some(tld => hostname.endsWith(tld))) return true;
      // Check for URL shorteners
      if (urlShorteners.some(short => hostname.includes(short))) return true;
      // Check for punycode (IDN homograph attacks)
      if (hostname.startsWith('xn--')) return true;
      // Check for excessive subdomains (e.g., phishing)
      if (hostname.split('.').length > 4) return true;
    } catch {
      return false;
    }
    return false;
  });
}

export async function analyzeWithAI(message: string, config: ApiConfig): Promise<string> {
  try {
    const response = await fetch(getApiEndpoint(config.provider), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
        ...(config.provider === 'openrouter' && {
          'HTTP-Referer': window.location.origin,
          'X-Title': 'ScamShield'
        })
      },
      body: JSON.stringify({
        model: config.model || getDefaultModel(config.provider),
        messages: [
          {
            role: 'user',
            content: `${AI_PROMPT}\n\n"${message}"`
          }
        ],
        max_tokens: 1024,
        temperature: 0.2
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    let aiResult = extractAiResponse(data, config.provider);

    // Scan for suspicious links
    const suspiciousLinks = findSuspiciousLinks(message);
    if (suspiciousLinks.length > 0) {
      aiResult += '\n\nHYPERLINK SCAM WARNING\nPossible suspicious links detected:';
      suspiciousLinks.forEach(link => {
        aiResult += `\n- ${link}`;
      });
    }

    return aiResult;
  } catch (error) {
    console.error('AI analysis failed:', error);
    throw new Error('AI analysis temporarily unavailable');
  }
}

function getApiEndpoint(provider: 'openrouter' | 'groq'): string {
  switch (provider) {
    case 'openrouter':
      return 'https://openrouter.ai/api/v1/chat/completions';
    case 'groq':
      return 'https://api.groq.com/openai/v1/chat/completions';
    default:
      throw new Error('Unsupported AI provider');
  }
}

function getDefaultModel(provider: 'openrouter' | 'groq'): string {
  switch (provider) {
    case 'openrouter':
      return 'anthropic/claude-3-haiku';
    case 'groq':
      return 'llama3-8b-8192';
    default:
      return 'gpt-3.5-turbo';
  }
}

function extractAiResponse(data: any, _provider: 'openrouter' | 'groq'): string {
  try {
    return data.choices?.[0]?.message?.content || 'AI analysis completed but no response received';
  } catch {
    return 'Unable to parse AI response';
  }
}