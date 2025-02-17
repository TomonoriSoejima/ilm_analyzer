import React from 'react';
import { X, Settings } from 'lucide-react';

interface IndexSettingsModalProps {
  indexName: string;
  onClose: () => void;
}

export function IndexSettingsModal({ indexName, onClose }: IndexSettingsModalProps) {
  const [settings, setSettings] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // In a real application, this would be an API call
    // For now, we'll simulate loading the settings from localStorage
    const loadSettings = async () => {
      try {
        const settingsJson = localStorage.getItem('settings');
        if (settingsJson) {
          const allSettings = JSON.parse(settingsJson);
          setSettings(allSettings[indexName]?.settings || null);
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [indexName]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <Settings className="w-5 h-5 text-blue-500 mr-2" />
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Index Settings: {indexName}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-8rem)]">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Loading settings...</p>
            </div>
          ) : settings ? (
            <div className="space-y-4">
              {Object.entries(settings.index).map(([key, value]) => (
                <div key={key} className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {key}
                  </h3>
                  <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                    {JSON.stringify(value, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">No settings available for this index</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}