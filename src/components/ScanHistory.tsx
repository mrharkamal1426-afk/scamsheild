import React, { useState } from 'react';
import { History, Trash2, Calendar } from 'lucide-react';
import { ScanResult } from '../types';

interface ScanHistoryProps {
  history: ScanResult[];
  onSelectResult: (result: ScanResult) => void;
  onClearHistory: () => void;
}

export default function ScanHistory({ history, onSelectResult, onClearHistory }: ScanHistoryProps) {
  const [showAll, setShowAll] = useState(false);

  if (history.length === 0) {
    return null;
  }

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'safe': return 'text-green-600 bg-green-50';
      case 'suspicious': return 'text-yellow-600 bg-yellow-50';
      case 'scam': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  // Show only the latest 3 scans unless showAll is true
  const displayedHistory = showAll ? history : history.slice(0, 3);

  return (
    <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/10 rounded-lg">
            <History className="w-5 h-5 text-purple-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-800">
            Recent Scans
          </h2>
        </div>
        
        <button
          onClick={onClearHistory}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Clear
        </button>
      </div>

      <div className="space-y-3">
        {displayedHistory.map((result) => (
          <div
            key={result.id}
            onClick={() => onSelectResult(result)}
            className="p-4 border border-gray-200 rounded-xl hover:bg-gray-50/50 cursor-pointer transition-colors group"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getVerdictColor(result.verdict)}`}>
                    {result.verdict}
                  </span>
                  <span className="text-xs text-gray-500">
                    {result.confidence}% confidence
                  </span>
                </div>
                
                <p className="text-sm text-gray-700 line-clamp-2 mb-2">
                  {result.message.length > 100 
                    ? `${result.message.substring(0, 100)}...` 
                    : result.message
                  }
                </p>
                
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {result.timestamp.toLocaleDateString()}
                  </div>
                  {result.detectedThreats.length > 0 && (
                    <span>{result.detectedThreats.length} threats detected</span>
                  )}
                  {result.extractedUrls.length > 0 && (
                    <span>{result.extractedUrls.length} URLs found</span>
                  )}
                </div>
              </div>
              
              <div className="text-gray-400 group-hover:text-gray-600 transition-colors">
                →
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Show button if there are more than 3 scans */}
      {history.length > 3 && (
        <div className="flex justify-center mt-4">
          <button
            onClick={() => setShowAll((prev) => !prev)}
            className="px-4 py-2 text-sm font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
          >
            {showAll ? 'Show less' : 'Load older scans'}
          </button>
        </div>
      )}
    </div>
  );
}