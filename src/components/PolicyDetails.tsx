import React from 'react';
import { Shield, Settings } from 'lucide-react';
import type { ILMPolicy } from '../types';

interface PolicyDetailsProps {
  policyName: string;
  policy: ILMPolicy;
}

export function PolicyDetails({ policyName, policy }: PolicyDetailsProps) {
  const getPhaseColor = (phase: string): string => {
    switch (phase) {
      case 'hot':
        return 'text-orange-500 dark:text-orange-400';
      case 'warm':
        return 'text-yellow-500 dark:text-yellow-400';
      case 'cold':
        return 'text-sky-500 dark:text-sky-400';
      case 'frozen':
        return 'text-blue-600 dark:text-blue-400';
      default:
        return 'text-gray-900 dark:text-gray-100';
    }
  };

  const formatPolicyJson = (policy: any): string => {
    return JSON.stringify(policy, null, 2);
  };

  if (!policy) {
    return (
      <div className="p-6">
        <div className="text-red-600 dark:text-red-400">Policy not found</div>
      </div>
    );
  }

  const colorPhases = (text: string) => {
    const phaseRegex = /(")(hot|warm|cold|frozen)(")/g;
    let lastIndex = 0;
    const result = [];
    let match;

    while ((match = phaseRegex.exec(text)) !== null) {
      // Add text before the match
      result.push(text.slice(lastIndex, match.index + match[1].length));
      // Add colored phase name
      result.push(<span key={match.index} className={getPhaseColor(match[2])}>{match[2]}</span>);
      // Add the closing quote
      result.push(match[3]);
      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    result.push(text.slice(lastIndex));

    return result;
  };

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <Shield className="w-8 h-8 text-blue-500 mr-3" />
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          Policy: {policyName}
        </h1>
      </div>

      <div className="space-y-6">
        {/* Version and Modified Date */}
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3 flex items-center">
            <Settings className="w-4 h-4 mr-2" />
            Policy Information
          </h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600 dark:text-gray-300">Version:</span>
              <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">{policy.version}</span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-300">Modified:</span>
              <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
                {new Date(policy.modified_date).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Policy Configuration */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">Policy Configuration</h2>
          <pre className="font-mono text-sm bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-auto">
            <code className="text-gray-900 dark:text-gray-100">
              {colorPhases(formatPolicyJson(policy.policy))}
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
}