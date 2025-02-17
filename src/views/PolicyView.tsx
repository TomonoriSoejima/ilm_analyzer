import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Shield, Settings } from 'lucide-react';
import type { ILMPolicies } from '../types';

export function PolicyView() {
  const { policyName } = useParams<{ policyName: string }>();
  const [policy, setPolicy] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/ilm_policies.json')
      .then(res => res.json())
      .then((policies: ILMPolicies) => {
        setPolicy(policies[policyName || '']);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading policy:', error);
        setLoading(false);
      });
  }, [policyName]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading policy data...</div>
      </div>
    );
  }

  if (!policy) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Errors
          </Link>
          <div className="text-red-600">Policy not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Errors
        </Link>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-6">
            <Shield className="w-8 h-8 text-blue-500 mr-3" />
            <h1 className="text-2xl font-bold text-gray-800">
              Policy: {policyName}
            </h1>
          </div>

          <div className="space-y-6">
            {/* Version and Modified Date */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <Settings className="w-4 h-4 mr-2" />
                Policy Information
              </h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Version:</span>
                  <span className="ml-2 font-medium">{policy.version}</span>
                </div>
                <div>
                  <span className="text-gray-600">Modified:</span>
                  <span className="ml-2 font-medium">
                    {new Date(policy.modified_date).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Policy Configuration */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Policy Configuration</h2>
              <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-sm">
                {JSON.stringify(policy.policy, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}