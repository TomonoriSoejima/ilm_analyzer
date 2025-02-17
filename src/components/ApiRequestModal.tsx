import React from 'react';
import { X, Copy, Check } from 'lucide-react';

interface ApiRequestModalProps {
  request: {
    method: string;
    endpoint: string;
    body: any;
  };
  onClose: () => void;
}

export function ApiRequestModal({ request, onClose }: ApiRequestModalProps) {
  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = async () => {
    // Format with a space after the method
    const text = `${request.method} ${request.endpoint}\n${JSON.stringify(request.body, null, 2)}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">API Request</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={copyToClipboard}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              title="Copy to clipboard"
            >
              {copied ? (
                <Check className="w-5 h-5 text-green-500" />
              ) : (
                <Copy className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="p-4">
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <pre className="text-sm font-mono text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
              {/* Render with a space after the method */}
              <span className="text-blue-600 dark:text-blue-400">{request.method}</span>
              <span className="text-gray-800 dark:text-gray-200"> {request.endpoint}</span>
              {'\n'}
              {JSON.stringify(request.body, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}