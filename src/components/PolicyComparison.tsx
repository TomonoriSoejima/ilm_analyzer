import React, { useState } from 'react';
import { Scale, ArrowRight, X } from 'lucide-react';
import type { ILMPolicy } from '../types';

interface PolicyComparisonProps {
  policies: Record<string, ILMPolicy>;
  onClose: () => void;
}

export function PolicyComparison({ policies, onClose }: PolicyComparisonProps) {
  const [selectedPolicies, setSelectedPolicies] = useState<string[]>([]);

  const togglePolicy = (policyName: string) => {
    if (selectedPolicies.includes(policyName)) {
      setSelectedPolicies(selectedPolicies.filter(p => p !== policyName));
    } else if (selectedPolicies.length < 2) {
      setSelectedPolicies([...selectedPolicies, policyName]);
    }
  };

  const formatPhaseConfig = (phase: any) => {
    if (!phase) return 'Not configured';
    
    const details = [];
    
    // Add min_age if present
    if (phase.min_age) {
      details.push(`Min age: ${phase.min_age}`);
    }
    
    // Format actions
    if (phase.actions) {
      Object.entries(phase.actions).forEach(([actionName, config]) => {
        details.push(`\nAction: ${actionName}`);
        if (typeof config === 'object') {
          Object.entries(config as object).forEach(([key, value]) => {
            // Format the key-value pairs with proper indentation
            details.push(`  ${key}: ${value}`);
          });
        }
      });
    }
    
    return details.length > 0 ? details.join('\n') : 'No configuration details available';
  };

  const renderPhaseComparison = (phase: string, policy1: ILMPolicy, policy2: ILMPolicy) => {
    const config1 = policy1.phases?.[phase];
    const config2 = policy2.phases?.[phase];
    
    const hasDifferences = JSON.stringify(config1) !== JSON.stringify(config2);
    
    return (
      <div key={phase} className="grid grid-cols-2 gap-8 mb-6">
        <div className={`bg-gray-50 p-4 rounded-lg ${hasDifferences ? 'ring-2 ring-yellow-200' : ''}`}>
          <h4 className="text-sm font-semibold text-gray-700 mb-2 capitalize">
            {phase} Phase
          </h4>
          <pre className="text-xs whitespace-pre-wrap font-mono">
            {formatPhaseConfig(config1)}
          </pre>
        </div>
        <div className={`bg-gray-50 p-4 rounded-lg ${hasDifferences ? 'ring-2 ring-yellow-200' : ''}`}>
          <h4 className="text-sm font-semibold text-gray-700 mb-2 capitalize">
            {phase} Phase
          </h4>
          <pre className="text-xs whitespace-pre-wrap font-mono">
            {formatPhaseConfig(config2)}
          </pre>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center">
            <Scale className="w-5 h-5 text-blue-500 mr-2" />
            <h2 className="text-xl font-semibold text-gray-800">Policy Comparison</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {selectedPolicies.length < 2 && (
          <div className="p-4 border-b border-gray-200">
            <p className="text-sm text-gray-600 mb-2">Select up to two policies to compare:</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {Object.keys(policies).map(policyName => (
                <button
                  key={policyName}
                  onClick={() => togglePolicy(policyName)}
                  className={`p-2 rounded text-sm ${
                    selectedPolicies.includes(policyName)
                      ? 'bg-blue-100 text-blue-700 border-blue-300'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  } border`}
                >
                  {policyName}
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedPolicies.length === 2 && (
          <div className="overflow-auto p-4">
            <div className="flex items-center justify-between mb-6">
              <div className="grid grid-cols-2 gap-8 w-full">
                {selectedPolicies.map(policyName => (
                  <div key={policyName} className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-800">{policyName}</h3>
                    <button
                      onClick={() => togglePolicy(policyName)}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              {['hot', 'warm', 'cold', 'delete'].map(phase => 
                renderPhaseComparison(
                  phase,
                  policies[selectedPolicies[0]],
                  policies[selectedPolicies[1]]
                )
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}