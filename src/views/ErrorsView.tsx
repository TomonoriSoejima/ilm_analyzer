import React, { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { IndexCard } from '../components/IndexCard';
import type { ILMErrors, ILMPolicies } from '../types';

export function ErrorsView() {
  const [errors, setErrors] = useState<ILMErrors | null>(null);
  const [policies, setPolicies] = useState<ILMPolicies | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/ilm_explain_only_errors.json'),
      fetch('/ilm_policies.json')
    ])
      .then(([errorsRes, policiesRes]) => 
        Promise.all([errorsRes.json(), policiesRes.json()])
      )
      .then(([errorsData, policiesData]) => {
        setErrors(errorsData);
        setPolicies(policiesData);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading data:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading data...</div>
      </div>
    );
  }

  if (!errors || !policies) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-600">Failed to load data</div>
      </div>
    );
  }

  const findPolicyForIndex = (indexName: string) => {
    const policyName = indexName.split('-')[0].replace('.ds', '');
    return policies[policyName];
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center mb-8">
          <AlertTriangle className="w-8 h-8 text-red-500 mr-3" />
          <h1 className="text-2xl font-bold text-gray-800">
            ILM Error Analysis
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(errors.indices).map(([indexName, error]) => (
            <IndexCard
              key={indexName}
              indexName={indexName}
              error={error}
              policy={findPolicyForIndex(indexName)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}