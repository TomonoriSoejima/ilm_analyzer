import React, { useState } from 'react';
import { Search, Clock, Shield, AlertTriangle, ChevronDown, ChevronRight, Info, Calendar } from 'lucide-react';
import type { ILMPolicies } from '../types';

interface ILMViewProps {
  policies: ILMPolicies;
}

interface PolicyUsage {
  composable_templates: string[];
  data_streams: string[];
}

function formatPhaseConfig(phase: any): JSX.Element {
  if (!phase) return <span className="text-gray-500 dark:text-gray-400">Not configured</span>;

  return (
    <div className="space-y-4">
      {/* Phase Settings */}
      <div className="grid grid-cols-2 gap-4">
        {phase.min_age && (
          <div className="col-span-2">
            <span className="text-gray-600 dark:text-gray-400">Minimum Age:</span>
            <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">{phase.min_age}</span>
          </div>
        )}
      </div>

      {/* Phase Actions */}
      {phase.actions && Object.entries(phase.actions).map(([actionName, config]) => (
        <div key={actionName} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
          <h5 className="text-sm font-medium text-gray-900 dark:text-gray-300 mb-2 capitalize">
            {actionName} Action
          </h5>
          <div className="space-y-2">
            {typeof config === 'object' && Object.entries(config as object).map(([key, value]) => (
              <div key={key} className="grid grid-cols-2 text-sm">
                <span className="text-gray-600 dark:text-gray-400">{key}:</span>
                <span className="text-gray-900 dark:text-gray-100">
                  {typeof value === 'boolean' ? value.toString() : value}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function ILMView({ policies }: ILMViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedPolicies, setExpandedPolicies] = useState<Set<string>>(new Set());

  const togglePolicy = (policyName: string) => {
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

  const filteredPolicies = Object.entries(policies).filter(([name]) =>
    name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Clock className="w-8 h-8 text-blue-500 mr-3" />
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            Index Lifecycle Policies
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Manage and monitor index lifecycle management policies
        </p>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search policies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredPolicies.map(([policyName, policy]) => {
          const usage: PolicyUsage = (policy as any).in_use_by || { composable_templates: [], data_streams: [] };
          const isExpanded = expandedPolicies.has(policyName);
          const meta = (policy as any).policy?._meta;
          const version = (policy as any).version;
          const modifiedDate = (policy as any).modified_date;

          return (
            <div key={policyName} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              <button
                onClick={() => togglePolicy(policyName)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                    <Shield className="w-5 h-5 text-blue-700 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {policyName}
                    </h3>
                    <div className="flex items-center space-x-4 mt-1">
                      {version && (
                        <span className="text-sm text-gray-700 dark:text-gray-400">
                          Version: {version}
                        </span>
                      )}
                      {meta?.managed && (
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                          Managed
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                )}
              </button>

              {isExpanded && (
                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                  {/* Metadata Section */}
                  {(meta || modifiedDate) && (
                    <div className="mb-6">
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-300 mb-3 flex items-center">
                          <Info className="w-4 h-4 mr-2" />
                          Policy Information
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {meta?.description && (
                            <div className="col-span-2">
                              <span className="text-gray-600 dark:text-gray-400">Description:</span>
                              <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                                {meta.description}
                              </p>
                            </div>
                          )}
                          {modifiedDate && (
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-2" />
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                Modified: {new Date(modifiedDate).toLocaleString()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Usage Information */}
                  {(usage.composable_templates.length > 0 || usage.data_streams.length > 0) && (
                    <div className="mb-6">
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                        <div className="flex items-start">
                          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                          <div className="ml-3">
                            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300">
                              Policy Usage
                            </h4>
                            {usage.composable_templates.length > 0 && (
                              <div className="mt-2">
                                <h5 className="text-sm font-medium text-blue-800 dark:text-blue-400">
                                  Used by {usage.composable_templates.length} template{usage.composable_templates.length !== 1 ? 's' : ''}:
                                </h5>
                                <ul className="mt-1 space-y-1">
                                  {usage.composable_templates.map(template => (
                                    <li key={template} className="text-sm text-blue-700 dark:text-blue-400">
                                      {template}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {usage.data_streams.length > 0 && (
                              <div className="mt-2">
                                <h5 className="text-sm font-medium text-blue-800 dark:text-blue-400">
                                  Associated with {usage.data_streams.length} data stream{usage.data_streams.length !== 1 ? 's' : ''}:
                                </h5>
                                <ul className="mt-1 space-y-1">
                                  {usage.data_streams.map(stream => (
                                    <li key={stream} className="text-sm text-blue-700 dark:text-blue-400">
                                      {stream}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Policy Phases */}
                  <div className="space-y-4">
                    {['hot', 'warm', 'cold', 'frozen', 'delete'].map(phase => {
                      const phaseConfig = (policy as any).policy?.phases?.[phase];
                      if (!phaseConfig) return null;

                      return (
                        <div key={phase} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-300 mb-3 capitalize">
                            {phase} Phase
                          </h4>
                          {formatPhaseConfig(phaseConfig)}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}