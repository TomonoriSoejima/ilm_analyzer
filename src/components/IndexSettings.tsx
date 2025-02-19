import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Settings, Calendar, Database } from 'lucide-react';

interface IndexSettingsProps {
  settings: Record<string, any>;
}

export function IndexSettings({ settings }: IndexSettingsProps) {
  const [expandedIndex, setExpandedIndex] = useState<string | null>(null);

  // Debug log when component mounts or settings prop changes
  React.useEffect(() => {
    console.log('IndexSettings component received settings:', settings);
    console.log('Settings keys in IndexSettings:', Object.keys(settings));
  }, [settings]);

  const formatDate = (timestamp: string) => {
    if (!timestamp) return 'N/A';
    try {
      const date = new Date(parseInt(timestamp));
      return date.toLocaleString();
    } catch {
      return timestamp;
    }
  };

  return (
    <div className="space-y-4">
      {Object.entries(settings).map(([indexName, indexData]) => {
        console.log(`Rendering settings for index: ${indexName}`, indexData);
        return (
          <div key={indexName} className="bg-gray-800 rounded-lg overflow-hidden">
            <button
              onClick={() => setExpandedIndex(expandedIndex === indexName ? null : indexName)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Database className="w-5 h-5 text-blue-400" />
                <div>
                  <span className="font-medium text-gray-100">{indexName}</span>
                  {indexData?.settings?.index?.hidden === "true" && (
                    <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-700 text-gray-300">
                      Hidden
                    </span>
                  )}
                </div>
              </div>
              {expandedIndex === indexName ? (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-500" />
              )}
            </button>

            {expandedIndex === indexName && (
              <div className="px-6 py-4 border-t border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Settings */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-gray-300 flex items-center">
                      <Settings className="w-4 h-4 mr-2" />
                      Basic Settings
                    </h4>
                    <div className="space-y-2">
                      {indexData?.settings?.index?.number_of_shards && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Number of Shards:</span>
                          <span className="text-gray-200">
                            {indexData.settings.index.number_of_shards}
                          </span>
                        </div>
                      )}
                      {indexData?.settings?.index?.number_of_replicas && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Number of Replicas:</span>
                          <span className="text-gray-200">
                            {indexData.settings.index.number_of_replicas}
                          </span>
                        </div>
                      )}
                      {indexData?.settings?.index?.auto_expand_replicas && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Auto-expand Replicas:</span>
                          <span className="text-gray-200">
                            {indexData.settings.index.auto_expand_replicas}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-gray-300 flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      Dates
                    </h4>
                    <div className="space-y-2">
                      {indexData?.settings?.index?.creation_date && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Creation Date:</span>
                          <span className="text-gray-200">
                            {formatDate(indexData.settings.index.creation_date)}
                          </span>
                        </div>
                      )}
                      {indexData?.settings?.index?.creation_date_string && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Creation Date String:</span>
                          <span className="text-gray-200">
                            {indexData.settings.index.creation_date_string}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Full Settings */}
                  <div className="md:col-span-2 space-y-4">
                    <h4 className="text-sm font-medium text-gray-300">Full Settings</h4>
                    <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                      <pre className="text-sm text-gray-200">
                        {JSON.stringify(indexData.settings.index, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}