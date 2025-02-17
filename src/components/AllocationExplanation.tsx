import React, { useState } from 'react';
import { AlertTriangle, Server, Clock, Info, ExternalLink, ChevronDown, ChevronRight, Code } from 'lucide-react';
import type { AllocationExplanation } from '../types';

interface AllocationExplanationProps {
  explanation: AllocationExplanation;
}

export function AllocationExplanation({ explanation }: AllocationExplanationProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showApiTooltip, setShowApiTooltip] = useState(false);

  const getDocumentationLink = () => {
    if (explanation.can_allocate === 'no_valid_shard_copy') {
      return {
        url: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/cluster-allocation-explain.html#_no_valid_shard_copy',
        text: 'No valid shard copy'
      };
    }

    if (explanation.can_allocate === 'no') {
      if (explanation.allocate_explanation?.toLowerCase().includes('no valid shard copy')) {
        return {
          url: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/cluster-allocation-explain.html#_no_valid_shard_copy',
          text: 'No valid shard copy'
        };
      }
      if (explanation.allocate_explanation?.includes('maximum number of retries exceeded')) {
        return {
          url: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/cluster-allocation-explain.html#maximum-number-of-retries-exceeded',
          text: 'Maximum number of retries exceeded'
        };
      }
      if (explanation.allocate_explanation?.includes('must remain on current node')) {
        return {
          url: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/cluster-allocation-explain.html#_must_remain_on_current_node',
          text: 'Must remain on current node'
        };
      }
    } else if (explanation.can_allocate === 'throttled') {
      return {
        url: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/cluster-allocation-explain.html#_allocation_throttled',
        text: 'Allocation throttled'
      };
    }
    return null;
  };

  const docLink = getDocumentationLink();

  const apiRequest = {
    method: 'GET',
    endpoint: '_cluster/allocation/explain',
    body: {
      index: explanation.index,
      shard: explanation.shard,
      primary: explanation.primary,
      current_node: explanation.current_node
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center mb-2">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mr-2">
                Shard Allocation Explanation
              </h2>
              <div className="relative inline-block">
                <button
                  onMouseEnter={() => setShowApiTooltip(true)}
                  onMouseLeave={() => setShowApiTooltip(false)}
                  className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Show API request"
                >
                  <Code className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
                {showApiTooltip && (
                  <div className="absolute left-0 top-full mt-2 w-96 p-4 bg-gray-900 text-gray-100 rounded-lg shadow-xl z-50">
                    <div className="text-xs font-mono">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-blue-400">{apiRequest.method}</span>
                        <span className="text-green-400">{apiRequest.endpoint}</span>
                      </div>
                      <pre className="whitespace-pre-wrap break-all">
                        {JSON.stringify(apiRequest.body, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Index: {explanation.index}, Shard: {explanation.shard} ({explanation.primary ? 'Primary' : 'Replica'})
            </p>
          </div>
          <div className="flex items-center">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              explanation.current_state === 'unassigned'
                ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
            }`}>
              {explanation.current_state}
            </span>
          </div>
        </div>
      </div>

      {/* Documentation Link */}
      {docLink && (
        <div className="px-6 py-3 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-800">
          <a 
            href={docLink.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
          >
            <Info className="w-4 h-4 mr-2" />
            <span>Learn more about: {docLink.text}</span>
            <ExternalLink className="w-4 h-4 ml-1" />
          </a>
        </div>
      )}

      {/* Unassigned Info */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
        <div className="flex items-start space-x-4">
          <div className="bg-orange-100 dark:bg-orange-900/20 p-2 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-2">Unassignment Details</h3>
            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <span className="text-gray-600 dark:text-gray-400 min-w-32">Reason:</span>
                <span className="text-gray-800 dark:text-gray-200 font-medium">{explanation.unassigned_info.reason}</span>
              </div>
              <div className="flex items-center text-sm">
                <Clock className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-2" />
                <span className="text-gray-600 dark:text-gray-400">
                  {new Date(explanation.unassigned_info.at).toLocaleString()}
                </span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {explanation.unassigned_info.details}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Allocation Status */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-start space-x-4">
          <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-lg">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-2">Allocation Status</h3>
            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <span className="text-gray-600 dark:text-gray-400 min-w-32">Can Allocate:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  explanation.can_allocate === 'no'
                    ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                    : explanation.can_allocate === 'throttled'
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
                    : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                }`}>
                  {explanation.can_allocate}
                </span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {explanation.allocate_explanation}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Node Allocation Decisions */}
      <div className="p-6">
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full text-left mb-4"
        >
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 flex items-center">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 mr-2" />
            ) : (
              <ChevronRight className="w-4 h-4 mr-2" />
            )}
            Node Allocation Decisions ({explanation.node_allocation_decisions.length} nodes)
          </h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {isExpanded ? 'Click to collapse' : 'Click to expand'}
          </span>
        </button>

        {isExpanded && (
          <div className="space-y-4">
            {explanation.node_allocation_decisions.map((decision) => (
              <div key={decision.node_id} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-start space-x-4">
                  <div className="bg-gray-100 dark:bg-gray-600 p-2 rounded-lg">
                    <Server className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-800 dark:text-gray-100">
                        {decision.node_name}
                      </h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        decision.node_decision === 'no'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                          : decision.node_decision === 'throttled'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
                          : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                      }`}>
                        {decision.node_decision}
                      </span>
                    </div>
                    
                    {/* Node Attributes */}
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      {Object.entries(decision.node_attributes).map(([key, value]) => (
                        <div key={key} className="text-xs">
                          <span className="text-gray-500 dark:text-gray-400">{key}:</span>
                          <span className="ml-1 text-gray-700 dark:text-gray-300">
                            {typeof value === 'object' ? JSON.stringify(value) : value.toString()}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Store Info */}
                    {decision.store && (
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                        Store size: {Math.round(decision.store.matching_size_in_bytes / 1024)} KB
                      </div>
                    )}

                    {/* Deciders */}
                    {decision.deciders && decision.deciders.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {decision.deciders.map((decider, index) => (
                          <div key={index} className="text-xs p-2 bg-gray-100 dark:bg-gray-600 rounded">
                            <div className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                              {decider.decider} ({decider.decision})
                            </div>
                            <div className="text-gray-600 dark:text-gray-400">
                              {decider.explanation}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Note */}
      {explanation.note && (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border-t border-yellow-100 dark:border-yellow-800">
          <p className="text-sm text-yellow-800 dark:text-yellow-300">
            <strong>Note:</strong> {explanation.note}
          </p>
        </div>
      )}
    </div>
  );
}