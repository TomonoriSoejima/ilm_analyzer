import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Activity, AlertTriangle, Clock, CheckCircle2, Filter, Info, Archive, ExternalLink } from 'lucide-react';
import type { NodesStatsResponse, PipelineConfigs, Pipeline } from '../types';

interface IngestPipelineStatsProps {
  stats: NodesStatsResponse;
  pipelines?: PipelineConfigs;
}

function PipelineConfig({ pipeline }: { pipeline: Pipeline }) {
  const [showConfig, setShowConfig] = useState(false);

  return (
    <div className="mb-4">
      <button
        onClick={() => setShowConfig(!showConfig)}
        className="flex items-center justify-between w-full text-left"
      >
        <div className="flex items-center space-x-2">
          <Info className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-gray-900 dark:text-gray-300">
            Pipeline Configuration
          </span>
        </div>
        {showConfig ? (
          <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        )}
      </button>

      {showConfig && (
        <div className="mt-4 space-y-4">
          {pipeline._meta && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">Metadata</h4>
              <div className="space-y-2">
                {pipeline._meta.managed && (
                  <div className="text-sm">
                    <span className="text-blue-700 dark:text-blue-400">Managed:</span>
                    <span className="ml-2 text-blue-900 dark:text-blue-200">Yes</span>
                  </div>
                )}
                {pipeline._meta.managed_by && (
                  <div className="text-sm">
                    <span className="text-blue-700 dark:text-blue-400">Managed By:</span>
                    <span className="ml-2 text-blue-900 dark:text-blue-200">{pipeline._meta.managed_by}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {pipeline.description && (
            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">Description</h4>
              <p className="text-sm text-gray-700 dark:text-gray-400 whitespace-pre-wrap">{pipeline.description}</p>
            </div>
          )}

          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-300">Processors</h4>
            {pipeline.processors.map((processor, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-300">
                    {processor.type}
                  </span>
                </div>
                <pre className="text-xs text-gray-800 dark:text-gray-400 bg-white dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-600 overflow-auto">
                  {JSON.stringify(processor, null, 2)}
                </pre>
              </div>
            ))}
          </div>

          {pipeline.on_failure && pipeline.on_failure.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-300">On Failure Handlers</h4>
              {pipeline.on_failure.map((handler, index) => (
                <div key={index} className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-red-800 dark:text-red-300">
                      {handler.type}
                    </span>
                  </div>
                  <pre className="text-xs text-red-700 dark:text-red-400 bg-white dark:bg-gray-800 p-2 rounded border border-red-200 dark:border-red-700 overflow-auto">
                    {JSON.stringify(handler, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function IngestPipelineStats({ stats, pipelines }: IngestPipelineStatsProps) {
  const [expandedPipelines, setExpandedPipelines] = useState<Set<string>>(new Set());
  const [showInactive, setShowInactive] = useState(false);

  const togglePipeline = (pipelineId: string) => {
    setExpandedPipelines(prev => {
      const next = new Set(prev);
      if (next.has(pipelineId)) {
        next.delete(pipelineId);
      } else {
        next.add(pipelineId);
      }
      return next;
    });
  };

  // Aggregate pipeline stats across all nodes
  const aggregatedStats = Object.values(stats.nodes).reduce((acc, node) => {
    if (node.ingest?.pipelines) {
      Object.entries(node.ingest.pipelines).forEach(([pipelineId, pipeline]) => {
        if (!acc[pipelineId]) {
          acc[pipelineId] = {
            count: 0,
            current: 0,
            failed: 0,
            hasGrok: pipeline.processors.some(p => {
              const [processorName, stats] = Object.entries(p)[0];
              return stats.type === 'grok';
            }),
            processors: pipeline.processors.map(p => {
              const [processorName, stats] = Object.entries(p)[0];
              return {
                name: processorName,
                type: stats.type,
                stats: {
                  count: 0,
                  current: 0,
                  failed: 0,
                  time_in_millis: 0
                }
              };
            })
          };
        }
        
        acc[pipelineId].count += pipeline.count;
        acc[pipelineId].current += pipeline.current;
        acc[pipelineId].failed += pipeline.failed;

        pipeline.processors.forEach((processor, index) => {
          const [_, stats] = Object.entries(processor)[0];
          acc[pipelineId].processors[index].stats.count += stats.stats.count;
          acc[pipelineId].processors[index].stats.current += stats.stats.current;
          acc[pipelineId].processors[index].stats.failed += stats.stats.failed;
          acc[pipelineId].processors[index].stats.time_in_millis += stats.stats.time_in_millis;
        });
      });
    }
    return acc;
  }, {} as Record<string, any>);

  // Split pipelines into active and inactive
  const { active, inactive } = Object.entries(aggregatedStats).reduce(
    (acc, [pipelineId, pipeline]) => {
      if (pipeline.count === 0 && pipeline.current === 0) {
        acc.inactive.push([pipelineId, pipeline]);
      } else {
        acc.active.push([pipelineId, pipeline]);
      }
      return acc;
    },
    { active: [] as any[], inactive: [] as any[] }
  );

  // Sort active pipelines by processed count in descending order
  const sortedActivePipelines = active.sort(([, a], [, b]) => b.count - a.count);
  // Sort inactive pipelines alphabetically
  const sortedInactivePipelines = inactive.sort(([a], [b]) => a.localeCompare(b));

  const renderPipeline = ([pipelineId, pipeline]: [string, any]) => (
    <div 
      key={pipelineId} 
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-all border border-gray-200 dark:border-gray-700 ${
        pipeline.hasGrok 
          ? 'ring-2 ring-cyan-500 dark:ring-cyan-400 shadow-cyan-100 dark:shadow-cyan-900/30' 
          : ''
      }`}
    >
      <button
        onClick={() => togglePipeline(pipelineId)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50"
      >
        <div className="flex items-center space-x-4">
          <div className={`p-2 rounded-lg transition-colors ${
            pipeline.hasGrok 
              ? 'bg-cyan-100 dark:bg-cyan-900/40' 
              : 'bg-blue-100 dark:bg-blue-900/20'
          }`}>
            {pipeline.hasGrok ? (
              <Filter className="w-5 h-5 text-cyan-700 dark:text-cyan-400" />
            ) : (
              <Activity className="w-5 h-5 text-blue-700 dark:text-blue-400" />
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {pipelineId}
              </h3>
              {pipeline.hasGrok && (
                <span className="px-3 py-1 text-xs font-medium rounded-full bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
                  Has Grok
                </span>
              )}
            </div>
            <div className="flex items-center space-x-4 mt-1">
              <span className="text-sm text-gray-700 dark:text-gray-400">
                Processed: {pipeline.count.toLocaleString()}
              </span>
              <span className="text-sm text-gray-700 dark:text-gray-400">
                Current: {pipeline.current.toLocaleString()}
              </span>
              {pipeline.failed > 0 && (
                <span className="text-sm text-red-600 dark:text-red-400">
                  Failed: {pipeline.failed.toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </div>
        {expandedPipelines.has(pipelineId) ? (
          <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        ) : (
          <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        )}
      </button>

      {expandedPipelines.has(pipelineId) && (
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          {/* Pipeline Configuration */}
          {pipelines && pipelines[pipelineId] && (
            <PipelineConfig pipeline={pipelines[pipelineId]} />
          )}

          {/* Pipeline Stats */}
          <div className="space-y-4">
            {pipeline.processors.map((processor: any, index: number) => (
              <div
                key={`${processor.name}-${index}`}
                className={`rounded-lg p-4 transition-all border ${
                  processor.type === 'grok'
                    ? 'bg-cyan-50 dark:bg-cyan-900/20 border-cyan-200 dark:border-cyan-800'
                    : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-300">
                      {processor.name}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full border ${
                      processor.type === 'grok'
                        ? 'bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800'
                        : 'bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-500'
                    }`}>
                      {processor.type}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-300">
                        {processor.stats.count.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        Processed
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-300">
                        {processor.stats.current.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        Current
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-300">
                        {processor.stats.failed.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        Failed
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-300">
                        {(processor.stats.time_in_millis / 1000).toFixed(2)}s
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        Total Time
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Inactive Pipelines Alert */}
      {sortedInactivePipelines.length > 0 && (
        <div className="mb-8">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex">
              <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-900 dark:text-blue-300">
                  Found {sortedInactivePipelines.length} inactive pipeline{sortedInactivePipelines.length > 1 ? 's' : ''}
                </h3>
                <div className="mt-2 text-sm text-blue-800 dark:text-blue-400">
                  <p>These pipelines have not processed any documents. Each unused pipeline configuration still consumes space in the cluster state, which is a limited resource. Consider removing them if they are no longer needed.</p>
                  <p className="mt-2">To delete a pipeline, use the Delete Pipeline API:</p>
                  <pre className="mt-2 bg-blue-100 dark:bg-blue-800/40 p-2 rounded text-xs font-mono overflow-x-auto border border-blue-200 dark:border-blue-700">
                    DELETE _ingest/pipeline/{'{pipeline_id}'}
                  </pre>
                  <p className="mt-2">
                    <a 
                      href="https://www.elastic.co/guide/en/elasticsearch/reference/current/delete-pipeline-api.html" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-700 dark:text-blue-300 hover:underline"
                    >
                      Learn more about the Delete Pipeline API
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Inactive Pipelines Section - Moved to top */}
      {sortedInactivePipelines.length > 0 && (
        <div className="mb-8">
          <button
            onClick={() => setShowInactive(!showInactive)}
            className="flex items-center space-x-2 text-gray-700 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 mb-4"
          >
            <Archive className="w-5 h-5" />
            <span className="text-lg font-medium">
              Inactive Pipelines ({sortedInactivePipelines.length})
            </span>
            {showInactive ? (
              <ChevronDown className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </button>

          {showInactive && (
            <div className="space-y-4 mt-4">
              {sortedInactivePipelines.map(([pipelineId, pipeline]) => (
                <div key={pipelineId} className="relative">
                  {renderPipeline([pipelineId, pipeline])}
                  <div className="mt-2 flex justify-end px-6">
                    <pre className="text-xs text-gray-700 dark:text-gray-400 font-mono bg-gray-50 dark:bg-gray-900 px-3 py-1 rounded border border-gray-200 dark:border-gray-700">
                      DELETE _ingest/pipeline/{pipelineId}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Active Pipelines Section */}
      {sortedActivePipelines.length > 0 && (
        <div>
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-200 mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
            Active Pipelines ({sortedActivePipelines.length})
          </h2>
          <div className="space-y-4">
            {sortedActivePipelines.map(renderPipeline)}
          </div>
        </div>
      )}
    </div>
  );
}