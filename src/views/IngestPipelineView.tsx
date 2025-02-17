import React, { useState } from 'react';
import { Activity, Search } from 'lucide-react';
import { IngestPipelineStats } from '../components/IngestPipelineStats';
import type { NodesStatsResponse, PipelineConfigs } from '../types';

interface IngestPipelineViewProps {
  stats: NodesStatsResponse;
  pipelines?: PipelineConfigs;
}

export function IngestPipelineView({ stats, pipelines }: IngestPipelineViewProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter stats based on search term
  const filteredStats: NodesStatsResponse = {
    ...stats,
    nodes: Object.entries(stats.nodes).reduce((acc, [nodeId, node]) => {
      if (node.ingest?.pipelines) {
        const filteredPipelines = Object.entries(node.ingest.pipelines)
          .filter(([pipelineId]) => 
            pipelineId.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .reduce((pAcc, [pipelineId, pipeline]) => {
            pAcc[pipelineId] = pipeline;
            return pAcc;
          }, {} as Record<string, any>);

        if (Object.keys(filteredPipelines).length > 0) {
          acc[nodeId] = {
            ...node,
            ingest: {
              ...node.ingest,
              pipelines: filteredPipelines
            }
          };
        }
      }
      return acc;
    }, {} as Record<string, any>)
  };

  // Filter pipelines config based on search term
  const filteredPipelines = pipelines
    ? Object.entries(pipelines)
        .filter(([pipelineId]) => 
          pipelineId.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .reduce((acc, [pipelineId, pipeline]) => {
          acc[pipelineId] = pipeline;
          return acc;
        }, {} as PipelineConfigs)
    : undefined;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Activity className="w-8 h-8 text-blue-500 mr-3" />
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            Ingest Pipeline Statistics
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Monitor and analyze ingest pipeline performance and configuration across your cluster
        </p>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search pipelines..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <IngestPipelineStats stats={filteredStats} pipelines={filteredPipelines} />
    </div>
  );
}