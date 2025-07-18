import React, { useState } from 'react';
import { Settings, Key, Brain, X, Check } from 'lucide-react';
import { ApiConfig } from '../types';

interface ApiSettingsProps {
  config: ApiConfig | null;
  onSave: (config: ApiConfig | null) => void;
}

export default function ApiSettings({ config, onSave }: ApiSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempConfig, setTempConfig] = useState<ApiConfig | null>(config);
  const [provider, setProvider] = useState<'openrouter' | 'groq'>(config?.provider || 'openrouter');
  const [apiKey, setApiKey] = useState(config?.apiKey || '');

  const handleSave = () => {
    if (apiKey.trim()) {
      const newConfig: ApiConfig = {
        provider,
        apiKey: apiKey.trim(),
        model: provider === 'openrouter' ? 'anthropic/claude-3-haiku' : 'llama3-8b-8192'
      };
      setTempConfig(newConfig);
      onSave(newConfig);
    } else {
      setTempConfig(null);
      onSave(null);
    }
    setIsOpen(false);
  };

  const handleRemove = () => {
    setTempConfig(null);
    setApiKey('');
    onSave(null);
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
          config 
            ? 'bg-green-100 text-green-700 hover:bg-green-200' 
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        {config ? <Brain className="w-4 h-4" /> : <Settings className="w-4 h-4" />}
        <span className="text-sm font-medium">
          {config ? `AI: ${config.provider}` : 'Setup AI'}
        </span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800">AI Enhancement Settings</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  AI Provider
                </label>
                <select
                  value={provider}
                  onChange={(e) => setProvider(e.target.value as 'openrouter' | 'groq')}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="openrouter">OpenRouter (Recommended)</option>
                  <option value="groq">Groq (Fast & Free)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API Key
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter your API key..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {provider === 'openrouter' 
                    ? 'Get your API key from openrouter.ai' 
                    : 'Get your API key from console.groq.com'
                  }
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> AI analysis is optional. ScamShield works fully offline with local detection algorithms. AI provides enhanced analysis when available.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSave}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors"
                >
                  <Check className="w-4 h-4" />
                  Save Settings
                </button>
                
                {config && (
                  <button
                    onClick={handleRemove}
                    className="px-4 py-3 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}