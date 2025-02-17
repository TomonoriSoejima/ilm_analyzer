import React from 'react';
import { AlertCircle, Clock, Activity, Calendar, Shield, RefreshCcw, AlertTriangle, Settings, ExternalLink } from 'lucide-react';
import { ILMError, ILMPolicy } from '../types';

interface IndexCardProps {
  indexName: string;
  error: ILMError;
  policy?: ILMPolicy;
  onPolicyClick: () => void;
  isSelected: boolean;
}

export function IndexCard({ indexName, error, policy, onPolicyClick, isSelected }: IndexCardProps) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 transition-all ${
      isSelected ? 'ring-2 ring-blue-500 shadow-xl' : 'hover:shadow-xl'
    }`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 break-all">{indexName}</h3>
          <button
            onClick={onPolicyClick}
            className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mt-1"
          >
            Policy: {error.policy}
            <ExternalLink className="w-3 h-3 ml-1" />
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Phase Information */}
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
            <Settings className="w-4 h-4 mr-2" />
            Phase Details
          </h4>
          <div className="space-y-1 text-sm">
            <div>
              <span className="text-gray-600 dark:text-gray-400">Current Phase:</span>
              <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">{error.phase}</span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Action:</span>
              <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">{error.action}</span>
            </div>
          </div>
        </div>

        {/* Timing Information */}
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
            <Clock className="w-4 h-4 mr-2" />
            Timing
          </h4>
          <div className="space-y-1 text-sm">
            <div>
              <span className="text-gray-600 dark:text-gray-400">Age:</span>
              <span className="ml-2 text-gray-900 dark:text-gray-100">{error.age}</span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Last Action:</span>
              <span className="ml-2 text-gray-900 dark:text-gray-100">{new Date(error.action_time).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Error Information */}
        <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg md:col-span-2">
          <h4 className="text-sm font-semibold text-red-700 dark:text-red-400 mb-2 flex items-center">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Error Details
          </h4>
          <div className="space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-red-600 dark:text-red-400">Failed Step:</span>
                <span className="ml-2 font-medium text-red-700 dark:text-red-300">{error.failed_step}</span>
              </div>
              <div>
                <span className="text-red-600 dark:text-red-400">Retry Count:</span>
                <span className="ml-2 text-red-700 dark:text-red-300">{error.failed_step_retry_count}</span>
              </div>
            </div>
            <div>
              <span className="text-red-600 dark:text-red-400 block mb-1">Error Message:</span>
              <p className="text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/40 p-2 rounded text-xs break-words">
                {error.step_info.reason}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}