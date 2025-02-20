import React, { useState } from 'react';
import { Server, Shield, Activity, Database, Cpu, ChevronDown, ChevronRight, Crown } from 'lucide-react';
import type { NodesResponse, MasterNode, NodesStatsResponse } from '../types';

interface NodesViewProps {
  nodesData: NodesResponse;
  masterNode?: MasterNode;
  nodesStats?: NodesStatsResponse;
}

interface NodeAttributesProps {
  attributes: Record<string, any>;
}

const getRoleColor = (role: string) => {
  switch (role) {
    case 'data_hot':
      return 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-300';
    case 'data_warm':
      return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300';
    case 'data_cold':
      return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300';
    case 'data_frozen':
      return 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-300';
    case 'master':
      return 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300';
    case 'ingest':
      return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300';
    default:
      return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
  }
};

function NodeAttributes({ attributes }: NodeAttributesProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="mt-6">
      <button
        onClick={toggleExpand}
        className="flex items-center justify-between w-full text-left mb-3"
      >
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 mr-2" />
          ) : (
            <ChevronRight className="w-4 h-4 mr-2" />
          )}
          Node Attributes
        </h4>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {isExpanded ? 'Click to collapse' : 'Click to expand'}
        </span>
      </button>

      {isExpanded && (
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
          <div className="grid grid-cols-1 gap-4">
            {Object.entries(attributes || {}).map(([key, value]) => (
              <div key={key} className="text-sm break-words">
                <span className="text-gray-500 dark:text-gray-400">{key}:</span>
                <span className="ml-2 text-gray-800 dark:text-gray-200">
                  {typeof value === 'object' ? JSON.stringify(value) : value.toString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function NodesView({ nodesData, masterNode, nodesStats }: NodesViewProps) {
  const { _nodes, cluster_name, nodes } = nodesData;

  // Helper function to check if a node is the master node
  const isMasterNode = (nodeId: string, nodeName: string) => {
    if (!masterNode) return false;
    return masterNode.id === nodeId || masterNode.node === nodeName;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Cluster Nodes</h1>
        <div className="text-gray-600 dark:text-gray-400">
          <p>Cluster: {cluster_name}</p>
          <p>Nodes: {_nodes.total} total, {_nodes.successful} successful, {_nodes.failed} failed</p>
        </div>
      </div>

      {/* Role Legend */}
      <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg">
        <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">Node Roles</h2>
        <div className="flex flex-wrap gap-2">
          <span className={`px-3 py-1 text-xs font-medium rounded-full ${getRoleColor('data_hot')}`}>
            Hot Data
          </span>
          <span className={`px-3 py-1 text-xs font-medium rounded-full ${getRoleColor('data_warm')}`}>
            Warm Data
          </span>
          <span className={`px-3 py-1 text-xs font-medium rounded-full ${getRoleColor('data_cold')}`}>
            Cold Data
          </span>
          <span className={`px-3 py-1 text-xs font-medium rounded-full ${getRoleColor('data_frozen')}`}>
            Frozen Data
          </span>
          <span className={`px-3 py-1 text-xs font-medium rounded-full ${getRoleColor('master')}`}>
            Master
          </span>
          <span className={`px-3 py-1 text-xs font-medium rounded-full ${getRoleColor('ingest')}`}>
            Ingest
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Object.entries(nodes).map(([nodeId, node]) => {
          const isMaster = isMasterNode(nodeId, node.name);
          
          return (
            <div 
              key={nodeId} 
              className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden ${
                isMaster ? 'ring-2 ring-purple-400 dark:ring-purple-500' : ''
              }`}
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-lg ${
                      isMaster 
                        ? 'bg-purple-100 dark:bg-purple-900/20' 
                        : 'bg-blue-100 dark:bg-blue-900/20'
                    }`}>
                      {isMaster ? (
                        <Crown className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      ) : (
                        <Server className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      )}
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center">
                        {node.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {node.ip}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {node.roles?.map(role => (
                      <span key={role} className={`px-3 py-1 text-xs font-medium rounded-full ${getRoleColor(role)}`}>
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="p-6">
                <div className="grid grid-cols-2 gap-6">
                  {/* Version Info */}
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <Shield className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-2" />
                      <span className="text-gray-600 dark:text-gray-400">Version:</span>
                      <span className="ml-2 text-gray-800 dark:text-gray-200">
                        {node.version}
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Activity className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-2" />
                      <span className="text-gray-600 dark:text-gray-400">Build:</span>
                      <span className="ml-2 text-gray-800 dark:text-gray-200">
                        {node.build_flavor} ({node.build_type})
                      </span>
                    </div>
                  </div>

                  {/* System Info */}
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <Database className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-2" />
                      <span className="text-gray-600 dark:text-gray-400">Buffer Size:</span>
                      <span className="ml-2 text-gray-800 dark:text-gray-200">
                        {node.total_indexing_buffer_in_bytes}
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Cpu className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-2" />
                      <span className="text-gray-600 dark:text-gray-400">Transport:</span>
                      <span className="ml-2 text-gray-800 dark:text-gray-200">
                        {node.transport_version}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Node Attributes */}
                <NodeAttributes attributes={node.attributes} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}