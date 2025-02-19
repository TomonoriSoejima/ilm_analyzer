import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { IndexSettings } from '../components/IndexSettings';

interface SettingsViewProps {
  settings: Record<string, any>;
}

export function SettingsView({ settings }: SettingsViewProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Debug log when component mounts or settings prop changes
  React.useEffect(() => {
    console.log('SettingsView received settings:', settings);
    console.log('Settings keys:', Object.keys(settings));
  }, [settings]);

  // Filter settings based on search term
  const filteredSettings = Object.entries(settings).reduce((acc, [key, value]) => {
    if (key.toLowerCase().includes(searchTerm.toLowerCase())) {
      acc[key] = value;
    }
    return acc;
  }, {} as Record<string, any>);

  // Debug log filtered settings
  React.useEffect(() => {
    console.log('Filtered settings keys:', Object.keys(filteredSettings));
  }, [filteredSettings]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-100 mb-2">Index Settings</h1>
        <p className="text-gray-400">
          View and analyze index settings across your cluster
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search indices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-4 py-2 border border-gray-700 rounded-lg bg-gray-800 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Settings List */}
      <IndexSettings settings={filteredSettings} />
    </div>
  );
}