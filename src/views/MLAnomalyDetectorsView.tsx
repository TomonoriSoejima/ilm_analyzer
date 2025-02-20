import React, { useState } from 'react';
import { Search, Brain, Activity, Clock, Database, AlertTriangle, ChevronDown, ChevronRight, Code, Copy, Check, X } from 'lucide-react';
import type { MLAnomalyDetectors, MLJob } from '../types';

interface MLAnomalyDetectorsViewProps {
  detectors: MLAnomalyDetectors | null;
}

interface JsonViewModalProps {
  job: MLJob;
  onClose: () => void;
}

function JsonViewModal({ job, onClose }: JsonViewModalProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(job, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <Code className="w-5 h-5 mr-2" />
            JSON Configuration
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={copyToClipboard}
              className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              title="Copy to clipboard"
            >
              {copied ? (
                <Check className="w-5 h-5 text-green-500" />
              ) : (
                <Copy className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="overflow-auto p-4 max-h-[calc(90vh-5rem)]">
          <pre className="text-sm font-mono bg-gray-50 dark:bg-gray-800 p-4 rounded-lg overflow-auto whitespace-pre-wrap text-gray-900 dark:text-gray-100">
            {JSON.stringify(job, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}

export function MLAnomalyDetectorsView({ detectors }: MLAnomalyDetectorsViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedJobs, setExpandedJobs] = useState<Set<string>>(new Set());
  const [selectedJobForJson, setSelectedJobForJson] = useState<MLJob | null>(null);

  if (!detectors) {
    return (
      <div className="text-center py-12">
        <Brain className="w-12 h-12 text-purple-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          ML Jobs Not Available
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          No machine learning jobs information is available in the uploaded diagnostic data.
        </p>
      </div>
    );
  }

  const jobs = Array.isArray(detectors.jobs) ? detectors.jobs : [];

  const toggleJob = (jobId: string) => {
    setExpandedJobs(prev => {
      const next = new Set(prev);
      if (next.has(jobId)) {
        next.delete(jobId);
      } else {
        next.add(jobId);
      }
      return next;
    });
  };

  const filteredJobs = jobs.filter(job =>
    job?.job_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job?.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (timestamp: number) => {
    if (!timestamp) return 'N/A';
    try {
      return new Date(timestamp).toLocaleString();
    } catch (error) {
      return 'Invalid Date';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Brain className="w-8 h-8 text-purple-500 mr-3" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            ML Anomaly Detectors
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          {jobs.length} anomaly detection jobs configured
        </p>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search jobs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredJobs.map((job) => {
          if (!job) return null;

          return (
            <div key={job.job_id} className="bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-800">
              <div className="px-6 py-4 flex items-center justify-between">
                <button
                  onClick={() => toggleJob(job.job_id)}
                  className="flex-1 flex items-center text-left"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                      <Activity className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {job.job_id}
                      </h3>
                      <div className="flex items-center space-x-4 mt-1">
                        {job.analysis_limits?.model_memory_limit && (
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            Memory: {job.analysis_limits.model_memory_limit}
                          </span>
                        )}
                        {Array.isArray(job.groups) && job.groups.map((group) => (
                          <span
                            key={group}
                            className="px-2 py-1 text-xs rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-700"
                          >
                            {group}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </button>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSelectedJobForJson(job)}
                    className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                    title="View JSON"
                  >
                    <Code className="w-5 h-5" />
                  </button>
                  {expandedJobs.has(job.job_id) ? (
                    <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  )}
                </div>
              </div>

              {expandedJobs.has(job.job_id) && (
                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800">
                  {/* Description */}
                  {job.description && (
                    <div className="mb-6">
                      <p className="text-gray-700 dark:text-gray-200">{job.description}</p>
                    </div>
                  )}

                  {/* Analysis Configuration */}
                  {job.analysis_config && (
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                        Analysis Configuration
                      </h4>
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                        <div className="grid grid-cols-2 gap-4">
                          {job.analysis_config.bucket_span && (
                            <div>
                              <span className="text-sm text-gray-600 dark:text-gray-400">Bucket Span:</span>
                              <span className="ml-2 text-sm text-gray-900 dark:text-white">
                                {job.analysis_config.bucket_span}
                              </span>
                            </div>
                          )}
                          {job.analysis_config.model_prune_window && (
                            <div>
                              <span className="text-sm text-gray-600 dark:text-gray-400">Model Prune Window:</span>
                              <span className="ml-2 text-sm text-gray-900 dark:text-white">
                                {job.analysis_config.model_prune_window}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Detectors */}
                  {job.analysis_config?.detectors && job.analysis_config.detectors.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                        Detectors
                      </h4>
                      <div className="space-y-3">
                        {job.analysis_config.detectors.map((detector, index) => (
                          <div
                            key={index}
                            className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                          >
                            <div className="grid grid-cols-2 gap-4">
                              {detector.detector_description && (
                                <div className="col-span-2">
                                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    {detector.detector_description}
                                  </span>
                                </div>
                              )}
                              {detector.function && (
                                <div>
                                  <span className="text-sm text-gray-600 dark:text-gray-400">Function:</span>
                                  <span className="ml-2 text-sm text-gray-900 dark:text-white">
                                    {detector.function}
                                  </span>
                                </div>
                              )}
                              {detector.field_name && (
                                <div>
                                  <span className="text-sm text-gray-600 dark:text-gray-400">Field:</span>
                                  <span className="ml-2 text-sm text-gray-900 dark:text-white">
                                    {detector.field_name}
                                  </span>
                                </div>
                              )}
                              {detector.partition_field_name && (
                                <div>
                                  <span className="text-sm text-gray-600 dark:text-gray-400">Partition Field:</span>
                                  <span className="ml-2 text-sm text-gray-900 dark:text-white">
                                    {detector.partition_field_name}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Datafeed Configuration */}
                  {job.datafeed_config && (
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                        Datafeed Configuration
                      </h4>
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                        <div className="grid grid-cols-2 gap-4">
                          {job.datafeed_config.indices && job.datafeed_config.indices.length > 0 && (
                            <div>
                              <span className="text-sm text-gray-600 dark:text-gray-400">Indices:</span>
                              <div className="mt-1 space-y-1">
                                {job.datafeed_config.indices.map((index, i) => (
                                  <span
                                    key={i}
                                    className="inline-block text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full mr-2 border border-blue-200 dark:border-blue-700"
                                  >
                                    {index}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {job.datafeed_config.query_delay && (
                            <div>
                              <span className="text-sm text-gray-600 dark:text-gray-400">Query Delay:</span>
                              <span className="ml-2 text-sm text-gray-900 dark:text-white">
                                {job.datafeed_config.query_delay}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Job Details */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                      Job Details
                    </h4>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                      <div className="grid grid-cols-2 gap-4">
                        {job.create_time && (
                          <div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">Created:</span>
                            <span className="ml-2 text-sm text-gray-900 dark:text-white">
                              {formatDate(job.create_time)}
                            </span>
                          </div>
                        )}
                        {job.job_version && (
                          <div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">Version:</span>
                            <span className="ml-2 text-sm text-gray-900 dark:text-white">
                              {job.job_version}
                            </span>
                          </div>
                        )}
                        {job.custom_settings?.created_by && (
                          <div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">Created By:</span>
                            <span className="ml-2 text-sm text-gray-900 dark:text-white">
                              {job.custom_settings.created_by}
                            </span>
                          </div>
                        )}
                        {job.results_index_name && (
                          <div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">Results Index:</span>
                            <span className="ml-2 text-sm text-gray-900 dark:text-white">
                              {job.results_index_name}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedJobForJson && (
        <JsonViewModal
          job={selectedJobForJson}
          onClose={() => setSelectedJobForJson(null)}
        />
      )}
    </div>
  );
}