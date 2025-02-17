import React, { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { AlertTriangle, Database, LayoutDashboard, Cog, Activity } from 'lucide-react';
import { IndexCard } from '../components/IndexCard';
import { PolicyDetails } from '../components/PolicyDetails';
import { PolicySummary } from '../components/PolicySummary';
import { FileUpload } from '../components/FileUpload';
import { ThemeToggle } from '../components/ThemeToggle';
import { Dashboard } from './Dashboard';
import { ShardsView } from './ShardsView';
import { SettingsView } from './SettingsView';
import { IngestPipelineView } from './IngestPipelineView';
import type { ILMErrors, ILMPolicies, VersionInfo, ShardInfo, AllocationExplanation, NodesStatsResponse, PipelineConfigs } from '../types';

export function SplitView() {
  const [errors, setErrors] = useState<ILMErrors | null>(null);
  const [policies, setPolicies] = useState<ILMPolicies | null>(null);
  const [selectedPolicy, setSelectedPolicy] = useState<string | null>(null);
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null);
  const [shards, setShards] = useState<ShardInfo[]>([]);
  const [allocation, setAllocation] = useState<AllocationExplanation | null>(null);
  const [settings, setSettings] = useState<Record<string, any> | null>(null);
  const [nodesStats, setNodesStats] = useState<NodesStatsResponse | null>(null);
  const [pipelines, setPipelines] = useState<PipelineConfigs | null>(null);
  const location = useLocation();

  const handleDataLoaded = (
    errorsData: ILMErrors | null, 
    policiesData: ILMPolicies | null, 
    version?: VersionInfo,
    shardsData?: ShardInfo[],
    allocationData?: AllocationExplanation,
    settingsData?: Record<string, any>,
    nodesStatsData?: NodesStatsResponse,
    pipelinesData?: PipelineConfigs
  ) => {
    setErrors(errorsData);
    setPolicies(policiesData);
    if (version) {
      setVersionInfo(version);
    }
    if (shardsData) {
      setShards(shardsData);
    }
    if (allocationData) {
      setAllocation(allocationData);
    }
    if (settingsData) {
      setSettings(settingsData);
    }
    if (nodesStatsData) {
      setNodesStats(nodesStatsData);
    }
    if (pipelinesData) {
      setPipelines(pipelinesData);
    }
  };

  if (!errors || !policies) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 relative">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <FileUpload onDataLoaded={handleDataLoaded} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation Bar */}
      <nav className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <AlertTriangle className="w-8 h-8 text-red-500" />
              <div className="ml-3">
                <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                  ILM Analysis
                </h1>
                {versionInfo && (
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    ES {versionInfo.version.number}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  location.pathname === '/'
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <AlertTriangle className="w-4 h-4 inline-block mr-2" />
                Errors
              </Link>
              <Link
                to="/dashboard"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  location.pathname === '/dashboard'
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 inline-block mr-2" />
                Dashboard
              </Link>
              <Link
                to="/shards"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  location.pathname === '/shards'
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Database className="w-4 h-4 inline-block mr-2" />
                Shards
              </Link>
              <Link
                to="/settings"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  location.pathname === '/settings'
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Cog className="w-4 h-4 inline-block mr-2" />
                Settings
              </Link>
              <Link
                to="/pipeline"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  location.pathname === '/pipeline'
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Activity className="w-4 h-4 inline-block mr-2" />
                Pipeline
              </Link>
              <div className="flex items-center gap-4">
                <ThemeToggle />
                <button
                  onClick={() => {
                    setErrors(null);
                    setPolicies(null);
                    setSelectedPolicy(null);
                    setVersionInfo(null);
                    setShards([]);
                    setAllocation(null);
                    setSettings(null);
                    setNodesStats(null);
                    setPipelines(null);
                  }}
                  className="px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 border border-blue-600 dark:border-blue-400 hover:border-blue-800 dark:hover:border-blue-300 rounded-md"
                >
                  Upload New File
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={
            <div className="flex">
              {/* Left Panel - Error List */}
              <div className="w-3/5 pr-6">
                <PolicySummary 
                  errors={errors}
                  onPolicyClick={setSelectedPolicy}
                  selectedPolicy={selectedPolicy}
                />

                <div className="space-y-4">
                  {Object.entries(errors.indices)
                    .filter(([_, error]) => !selectedPolicy || error.policy === selectedPolicy)
                    .map(([indexName, error]) => (
                      <div key={indexName} className="w-full">
                        <IndexCard
                          indexName={indexName}
                          error={error}
                          policy={policies[error.policy]}
                          onPolicyClick={() => setSelectedPolicy(error.policy)}
                          isSelected={selectedPolicy === error.policy}
                        />
                      </div>
                    ))}
                </div>
              </div>

              {/* Right Panel - Policy Details */}
              <div className="w-2/5 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                {selectedPolicy ? (
                  <PolicyDetails 
                    policyName={selectedPolicy} 
                    policy={policies[selectedPolicy]} 
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                    Select a policy to view details
                  </div>
                )}
              </div>
            </div>
          } />
          <Route path="/dashboard" element={<Dashboard errors={errors} policies={policies} />} />
          <Route path="/shards" element={<ShardsView shards={shards} allocation={allocation} />} />
          <Route path="/settings" element={settings ? <SettingsView settings={settings} /> : (
            <div className="text-center py-12">
              <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                Settings Not Available
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                No settings information is available in the uploaded diagnostic data.
              </p>
            </div>
          )} />
          <Route path="/pipeline" element={nodesStats && <IngestPipelineView stats={nodesStats} pipelines={pipelines || undefined} />} />
        </Routes>
      </div>
    </div>
  );
}