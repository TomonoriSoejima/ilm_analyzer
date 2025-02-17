import React, { useMemo } from 'react';
import { BarChart3, Clock, AlertTriangle, Shield } from 'lucide-react';
import type { ILMErrors, ILMPolicies } from '../types';

interface DashboardProps {
  errors: ILMErrors;
  policies: ILMPolicies;
}

export function Dashboard({ errors, policies }: DashboardProps) {
  const stats = useMemo(() => {
    const errorsList = Object.values(errors.indices);
    if (errorsList.length === 0) {
      return {
        totalErrors: 0,
        uniquePolicies: 0,
        failedSteps: {},
        oldestError: null
      };
    }

    const totalErrors = errorsList.length;
    const uniquePolicies = new Set(errorsList.map(e => e.policy)).size;
    const failedSteps = errorsList.reduce((acc, error) => {
      acc[error.failed_step] = (acc[error.failed_step] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const oldestError = errorsList.reduce((oldest, current) => {
      return new Date(current.action_time) < new Date(oldest.action_time) ? current : oldest;
    }, errorsList[0]);

    return {
      totalErrors,
      uniquePolicies,
      failedSteps,
      oldestError
    };
  }, [errors]);

  if (!stats.oldestError) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">ILM Error Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">No errors found in the system</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">ILM Error Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">Overview of Index Lifecycle Management errors</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-red-100 dark:bg-red-900/20 p-3 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <span className="text-3xl font-bold text-gray-800 dark:text-gray-100">{stats.totalErrors}</span>
          </div>
          <h3 className="text-gray-600 dark:text-gray-400 text-sm">Total Errors</h3>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-lg">
              <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-3xl font-bold text-gray-800 dark:text-gray-100">{stats.uniquePolicies}</span>
          </div>
          <h3 className="text-gray-600 dark:text-gray-400 text-sm">Affected Policies</h3>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-yellow-100 dark:bg-yellow-900/20 p-3 rounded-lg">
              <BarChart3 className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <span className="text-3xl font-bold text-gray-800 dark:text-gray-100">
              {Object.keys(stats.failedSteps).length}
            </span>
          </div>
          <h3 className="text-gray-600 dark:text-gray-400 text-sm">Unique Failed Steps</h3>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-100 dark:bg-purple-900/20 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
              {new Date(stats.oldestError.action_time).toLocaleDateString()}
            </span>
          </div>
          <h3 className="text-gray-600 dark:text-gray-400 text-sm">Oldest Error</h3>
        </div>
      </div>

      {/* Failed Steps Breakdown */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-6">Failed Steps Breakdown</h2>
        <div className="space-y-4">
          {Object.entries(stats.failedSteps).map(([step, count]) => (
            <div key={step} className="flex items-center">
              <div className="w-48 text-sm text-gray-600 dark:text-gray-400">{step}</div>
              <div className="flex-1">
                <div className="relative h-8 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="absolute h-full bg-red-500 dark:bg-red-600 rounded-full transition-all"
                    style={{ width: `${(count / stats.totalErrors) * 100}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-end pr-4">
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      {count} ({((count / stats.totalErrors) * 100).toFixed(1)}%)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}