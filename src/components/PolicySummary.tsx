import React from 'react';
import { AlertTriangle, ChevronRight, ChevronDown } from 'lucide-react';
import type { ILMErrors } from '../types';

interface PolicySummaryProps {
  errors: ILMErrors;
  onPolicyClick: (policyName: string) => void;
  selectedPolicy: string | null;
}

interface PolicyErrorCount {
  policyName: string;
  count: number;
  errorTypes: { [key: string]: number };
  uniqueErrors: Set<string>;
}

export function PolicySummary({ errors, onPolicyClick, selectedPolicy }: PolicySummaryProps) {
  const [expandedPolicies, setExpandedPolicies] = React.useState<Set<string>>(new Set());

  // Calculate error counts and collect unique errors by policy
  const policyErrors = React.useMemo(() => {
    return Object.values(errors.indices).reduce((acc: PolicyErrorCount[], error) => {
      const existing = acc.find(p => p.policyName === error.policy);
      if (existing) {
        existing.count++;
        existing.errorTypes[error.failed_step] = (existing.errorTypes[error.failed_step] || 0) + 1;
        existing.uniqueErrors.add(error.step_info.reason);
      } else {
        acc.push({
          policyName: error.policy,
          count: 1,
          errorTypes: { [error.failed_step]: 1 },
          uniqueErrors: new Set([error.step_info.reason])
        });
      }
      return acc;
    }, []).sort((a, b) => b.count - a.count);
  }, [errors]);

  const togglePolicyErrors = (policyName: string) => {
    setExpandedPolicies(prev => {
      const next = new Set(prev);
      if (next.has(policyName)) {
        next.delete(policyName);
      } else {
        next.add(policyName);
      }
      return next;
    });
  };

  return (
    <div className="space-y-6 mb-6">
      {/* Policy-specific error summary */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
          <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
          Policy Error Summary
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {policyErrors.map(({ policyName, count, errorTypes, uniqueErrors }) => (
            <div
              key={policyName}
              className={`p-4 rounded-lg border transition-all ${
                selectedPolicy === policyName
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <button
                  onClick={() => onPolicyClick(policyName)}
                  className="font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  {policyName}
                </button>
                <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Total Errors:</span>
                <span className="text-sm font-semibold text-red-600 dark:text-red-400">{count}</span>
              </div>
              <div className="mt-2 space-y-1">
                {Object.entries(errorTypes).map(([type, typeCount]) => (
                  <div key={type} className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 dark:text-gray-400">{type}:</span>
                    <span className="text-gray-700 dark:text-gray-300">{typeCount}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePolicyErrors(policyName);
                  }}
                  className="flex items-center text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  {expandedPolicies.has(policyName) ? (
                    <ChevronDown className="w-4 h-4 mr-1" />
                  ) : (
                    <ChevronRight className="w-4 h-4 mr-1" />
                  )}
                  <span>Unique Errors: {uniqueErrors.size}</span>
                </button>
                {expandedPolicies.has(policyName) && (
                  <div className="mt-2 space-y-2">
                    {Array.from(uniqueErrors).map((error, index) => (
                      <div
                        key={index}
                        className="text-xs p-2 bg-red-50 dark:bg-red-900/20 rounded text-red-700 dark:text-red-300"
                      >
                        {error}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}