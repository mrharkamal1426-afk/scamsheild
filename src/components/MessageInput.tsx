import React, { useState, useRef } from 'react';
import { MessageSquare, Scan, Link2, Clipboard, X } from 'lucide-react';

interface MessageInputProps {
  message: string;
  onChange: (message: string) => void;
  onScan: () => void;
  isScanning: boolean;
}

export default function MessageInput({ message, onChange, onScan, isScanning }: MessageInputProps) {
  const [isUrlMode, setIsUrlMode] = useState(false);
  const [clipboardText, setClipboardText] = useState<string | null>(null);
  const [showPastePrompt, setShowPastePrompt] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  // Check clipboard when input is focused and empty
  const handleFocus = async () => {
    if (message.trim() !== '') return;
    if (navigator.clipboard && window.isSecureContext) {
      try {
        const text = await navigator.clipboard.readText();
        if (text && text.trim() !== '') {
          setClipboardText(text);
          setShowPastePrompt(true);
        } else {
          setShowPastePrompt(false);
        }
      } catch {
        setShowPastePrompt(false);
      }
    }
  };

  // Helper: get first line only for URL mode
  const getUrlFromClipboard = (text: string) => {
    return text.split(/\r?\n/)[0].trim();
  };

  const handlePasteFromClipboard = async () => {
    if (clipboardText) {
      if (isUrlMode) {
        onChange(getUrlFromClipboard(clipboardText));
      } else {
        onChange(clipboardText);
      }
      setShowPastePrompt(false);
      setClipboardText(null);
      if (inputRef.current) inputRef.current.blur();
    } else {
      try {
        const text = await navigator.clipboard.readText();
        if (isUrlMode) {
          onChange(getUrlFromClipboard(text));
        } else {
          onChange(text);
        }
        setShowPastePrompt(false);
        setClipboardText(null);
        if (inputRef.current) inputRef.current.blur();
      } catch (error) {
        alert('Failed to read clipboard.');
      }
    }
  };

  const handleClear = () => {
    onChange('');
    setShowPastePrompt(false);
    setClipboardText(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      onScan();
    }
    if (isUrlMode && e.key === 'Enter') {
      e.preventDefault();
      onScan();
    }
  };

  return (
    <div className="glass-card p-6 shadow-glass">
      {/* Header with mode toggle */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xl font-bold text-primary-700 dark:text-primary-300">ScanShield</span>
        <div className="flex gap-2">
          <button
            onClick={() => setIsUrlMode(false)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${!isUrlMode ? 'bg-primary-600 text-white border-primary-600' : 'bg-white dark:bg-dark-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-dark-500 hover:bg-primary-50 dark:hover:bg-dark-600'}`}
            aria-pressed={!isUrlMode}
          >
            <MessageSquare className="w-4 h-4" /> Message
          </button>
          <button
            onClick={() => setIsUrlMode(true)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${isUrlMode ? 'bg-primary-600 text-white border-primary-600' : 'bg-white dark:bg-dark-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-dark-500 hover:bg-primary-50 dark:hover:bg-dark-600'}`}
            aria-pressed={isUrlMode}
          >
            <Link2 className="w-4 h-4" /> URL
          </button>
        </div>
      </div>

      {/* Input area with clipboard and clear buttons inside input, right-aligned */}
      <div className="relative group mb-4">
        {isUrlMode ? (
          <div className="relative">
            <input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              type="text"
              value={message}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={handleFocus}
              placeholder="Paste a suspicious URL here, e.g. https://example.com/login"
              className="input-field w-full h-12 pr-24 pl-4 py-3 rounded-lg border-2 transition-all duration-300 focus:ring-2 focus:ring-primary-400 border-gray-200 dark:border-dark-500 placeholder-gray-500 dark:placeholder-gray-400 text-base shadow-sm"
              disabled={isScanning}
              aria-label="Suspicious URL"
              autoComplete="off"
              style={{paddingRight: '3.5rem'}}
            />
            <div className="absolute inset-y-0 right-2 flex items-center gap-1">
              <button
                onClick={async () => {
                  const text = await navigator.clipboard.readText();
                  onChange(getUrlFromClipboard(text));
                  setShowPastePrompt(false);
                  setClipboardText(null);
                }}
                className="p-1.5 rounded-md text-gray-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900 transition"
                title="Paste from Clipboard"
                type="button"
                tabIndex={0}
                style={{marginRight: '0.25rem'}}
              >
                <Clipboard className="w-4 h-4" />
              </button>
              <button
                onClick={handleClear}
                className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900 transition"
                title="Clear"
                type="button"
                disabled={!message}
                tabIndex={0}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {/* Paste from clipboard prompt */}
            {showPastePrompt && clipboardText && (
              <div className="absolute left-1/2 -translate-x-1/2 top-14 z-20 bg-white dark:bg-dark-700 border border-gray-200 dark:border-dark-500 shadow-lg rounded-lg px-4 py-2 flex items-center gap-2 text-sm">
                <Clipboard className="w-4 h-4 text-primary-600" />
                <span>Paste from clipboard?</span>
                <button
                  onClick={handlePasteFromClipboard}
                  className="ml-2 px-2 py-1 rounded bg-primary-600 text-white text-xs font-semibold hover:bg-primary-700 transition"
                >Paste</button>
                <button
                  onClick={() => setShowPastePrompt(false)}
                  className="ml-1 px-2 py-1 rounded bg-gray-200 dark:bg-dark-500 text-gray-700 dark:text-gray-200 text-xs font-semibold hover:bg-gray-300 dark:hover:bg-dark-400 transition"
                >Dismiss</button>
              </div>
            )}
          </div>
        ) : (
          <div className="relative">
            <textarea
              ref={inputRef as React.RefObject<HTMLTextAreaElement>}
              value={message}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={handleFocus}
              placeholder="Paste the suspicious WhatsApp message, SMS, or email content here. We'll analyze it for scam indicators and phishing links..."
              className="input-field h-32 w-full resize-none placeholder-gray-500 dark:placeholder-gray-400 pr-24 pl-4 py-3 rounded-lg border-2 transition-all duration-300 focus:ring-2 focus:ring-primary-400 border-gray-200 dark:border-dark-500 shadow-sm"
              disabled={isScanning}
              aria-label="Suspicious Message"
              style={{paddingRight: '3.5rem'}}
            />
            <div className="absolute top-2 right-2 flex items-center gap-1">
              <button
                onClick={async () => {
                  const text = await navigator.clipboard.readText();
                  onChange(text);
                  setShowPastePrompt(false);
                  setClipboardText(null);
                }}
                className="p-1.5 rounded-md text-gray-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900 transition"
                title="Paste from Clipboard"
                type="button"
                tabIndex={0}
                style={{marginRight: '0.25rem'}}
              >
                <Clipboard className="w-4 h-4" />
              </button>
              <button
                onClick={handleClear}
                className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900 transition"
                title="Clear"
                type="button"
                disabled={!message}
                tabIndex={0}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {/* Paste from clipboard prompt */}
            {showPastePrompt && clipboardText && (
              <div className="absolute left-1/2 -translate-x-1/2 top-14 z-20 bg-white dark:bg-dark-700 border border-gray-200 dark:border-dark-500 shadow-lg rounded-lg px-4 py-2 flex items-center gap-2 text-sm">
                <Clipboard className="w-4 h-4 text-primary-600" />
                <span>Paste from clipboard?</span>
                <button
                  onClick={handlePasteFromClipboard}
                  className="ml-2 px-2 py-1 rounded bg-primary-600 text-white text-xs font-semibold hover:bg-primary-700 transition"
                >Paste</button>
                <button
                  onClick={() => setShowPastePrompt(false)}
                  className="ml-1 px-2 py-1 rounded bg-gray-200 dark:bg-dark-500 text-gray-700 dark:text-gray-200 text-xs font-semibold hover:bg-gray-300 dark:hover:bg-dark-400 transition"
                >Dismiss</button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Scan button */}
      <button
        onClick={onScan}
        disabled={!message.trim() || isScanning}
        className={`w-full flex items-center justify-center gap-3 py-3 rounded-lg text-lg font-semibold transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-primary-400
          ${isScanning ? 'bg-gray-300 dark:bg-dark-700 text-gray-500 cursor-not-allowed' :
            'bg-primary-600 hover:bg-primary-700 text-white'}`}
        type="button"
        style={{marginTop: '0.5rem'}}
      >
        <Scan className={`w-6 h-6 ${isScanning ? 'animate-spin' : ''}`} />
        {isScanning ? 'Analyzing...' : `Scan for ${isUrlMode ? 'URL Threats' : 'Threats'}`}
      </button>

      {/* Quick scan shortcut */}
      {!isScanning && (
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
          Press <kbd className="px-2 py-1 bg-gray-200 dark:bg-dark-500 rounded text-xs dark:text-gray-300 transition-colors">Ctrl+Enter</kbd> to quick scan
        </p>
      )}
    </div>
  );
}