import React, { useCallback } from 'react';
import { Upload, FileUp, Loader2, Database } from 'lucide-react';
import JSZip from 'jszip';
import type { ILMErrors, ILMPolicies, VersionInfo, ShardInfo, AllocationExplanation, NodesStatsResponse, PipelineConfigs, MLAnomalyDetectors } from '../types';

interface FileUploadProps {
  onDataLoaded: (
    errors: ILMErrors | null, 
    policies: ILMPolicies | null, 
    version?: VersionInfo, 
    shards?: ShardInfo[],
    allocation?: AllocationExplanation,
    settings?: Record<string, any>,
    nodesStats?: NodesStatsResponse,
    pipelines?: PipelineConfigs,
    mlDetectors?: MLAnomalyDetectors
  ) => void;
}

export function FileUpload({ onDataLoaded }: FileUploadProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const safeSetItem = (key: string, value: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (err) {
      console.warn(`Failed to store ${key} in localStorage:`, err);
      return false;
    }
  };

  const processZipFile = async (file: File) => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('Starting to process ZIP file...');
      const zip = new JSZip();
      const contents = await zip.loadAsync(file);
      
      let errorsJson = null;
      let policiesJson = null;
      let versionJson = null;
      let shardsJson = null;
      let allocationJson = null;
      let settingsJson = null;
      let nodesStatsJson = null;
      let pipelinesJson = null;
      let mlDetectorsJson = null;
      const foundFiles: string[] = [];

      // Debug: Log all files in the ZIP
      console.log('Files in ZIP:', Object.keys(contents.files));

      // Process all files
      for (const [path, zipEntry] of Object.entries(contents.files)) {
        if (zipEntry.dir) continue;

        const normalizedPath = path.toLowerCase();
        console.log('Processing file:', normalizedPath);

        try {
          const content = await zipEntry.async('string');
          
          // Debug: Log file content length
          console.log(`File ${normalizedPath} content length:`, content.length);
          
          try {
            const json = JSON.parse(content);
            console.log(`Successfully parsed JSON for ${normalizedPath}`);

            if (normalizedPath.includes('ilm_explain_only_errors.json')) {
              errorsJson = json;
              foundFiles.push('ILM Errors');
            } else if (normalizedPath.includes('ilm_policies.json')) {
              policiesJson = json;
              foundFiles.push('ILM Policies');
            } else if (normalizedPath.includes('version.json')) {
              versionJson = json;
              foundFiles.push('Version Info');
            } else if (normalizedPath.includes('shards.json')) {
              shardsJson = json;
              foundFiles.push('Shards Info');
            } else if (normalizedPath.includes('allocation_explain.json')) {
              allocationJson = json;
              foundFiles.push('Allocation Info');
            } else if (normalizedPath === 'settings.json' || normalizedPath.endsWith('/settings.json')) {
              settingsJson = json;
              foundFiles.push('Settings Info');
            } else if (normalizedPath.includes('nodes_stats.json')) {
              nodesStatsJson = json;
              foundFiles.push('Nodes Stats');
            } else if (normalizedPath.includes('pipelines.json')) {
              pipelinesJson = json;
              foundFiles.push('Pipelines');
            } else if (normalizedPath.includes('ml_anomaly_detectors.json')) {
              console.log('Found ML anomaly detectors file:', normalizedPath);
              console.log('ML file content preview:', content.substring(0, 200));
              mlDetectorsJson = json;
              console.log('Successfully parsed ML detectors JSON:', {
                count: json.count,
                jobsCount: json.jobs?.length
              });
              foundFiles.push('ML Anomaly Detectors');
            }
          } catch (parseError) {
            console.error(`Failed to parse JSON for ${normalizedPath}:`, parseError);
          }
        } catch (err) {
          console.error(`Failed to process file ${path}:`, err);
        }
      }

      // Debug: Log found files and ML data
      console.log('Found files:', foundFiles);
      console.log('ML Detectors data:', mlDetectorsJson);

      // Show warning if ILM files are missing but proceed anyway
      if (!errorsJson || !policiesJson) {
        const missingFiles = [];
        if (!errorsJson) missingFiles.push('ilm_explain_only_errors.json');
        if (!policiesJson) missingFiles.push('ilm_policies.json');
        setError(`Note: Some ILM files are missing (${missingFiles.join(', ')}), but you can still view available data.`);
      }

      // Process optional files in the background
      setTimeout(async () => {
        for (const [path, zipEntry] of Object.entries(contents.files)) {
          if (zipEntry.dir) continue;

          const normalizedPath = path.toLowerCase();
          if (normalizedPath.includes('index_templates.json') || 
              normalizedPath.includes('alias.json') || 
              normalizedPath.includes('aliases.json')) {
            try {
              const content = await zipEntry.async('string');
              const json = JSON.parse(content);

              if (normalizedPath.includes('index_templates.json')) {
                safeSetItem('index_templates', json);
              } else if (normalizedPath.includes('alias.json') || normalizedPath.includes('aliases.json')) {
                safeSetItem('aliases', json);
              }
            } catch (err) {
              console.warn(`Failed to process optional file ${path}:`, err);
            }
          }
        }
      }, 0);

      // Call onDataLoaded with whatever files we found
      console.log('Calling onDataLoaded with ML data:', mlDetectorsJson);
      onDataLoaded(
        errorsJson, 
        policiesJson, 
        versionJson, 
        shardsJson || [], 
        allocationJson, 
        settingsJson,
        nodesStatsJson,
        pipelinesJson,
        mlDetectorsJson
      );
    } catch (err) {
      console.error('ZIP processing error:', err);
      setError(err instanceof Error ? err.message : 'Failed to process ZIP file');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/zip') {
      processZipFile(file);
    } else {
      setError('Please upload a ZIP file');
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processZipFile(file);
    }
  };

  const loadDemoData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Load all files in parallel
      const [errorsRes, policiesRes, templatesRes, aliasesRes, shardsRes, allocationRes, settingsRes, nodesStatsRes, pipelinesRes] = await Promise.all([
        fetch('/ilm_explain_only_errors.json'),
        fetch('/ilm_policies.json'),
        fetch('/index_templates.json'),
        fetch('/aliases.json'),
        fetch('/shards.json'),
        fetch('/allocation_explain.json'),
        fetch('/settings.json'),
        fetch('/nodes_stats.json'),
        fetch('/pipelines.json')
      ]);
      
      const [errorsJson, policiesJson, templatesJson, aliasesJson, shardsJson, allocationJson, settingsJson, nodesStatsJson, pipelinesJson] = await Promise.all([
        errorsRes.json(),
        policiesRes.json(),
        templatesRes.json(),
        aliasesRes.json(),
        shardsRes.json(),
        allocationRes.json(),
        settingsRes.json(),
        nodesStatsRes.json(),
        pipelinesRes.json()
      ]);

      // Store templates and aliases in localStorage
      safeSetItem('index_templates', templatesJson);
      safeSetItem('aliases', aliasesJson);

      onDataLoaded(
        errorsJson, 
        policiesJson, 
        undefined, 
        shardsJson, 
        allocationJson, 
        settingsJson,
        nodesStatsJson,
        pipelinesJson,
        null // ML data is only available from diagnostic ZIP
      );
    } catch (err) {
      setError('Failed to load demo data');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <Upload className="w-24 h-24 text-blue-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">Upload Diagnostic Data</h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Upload a ZIP file containing diagnostic data
          </p>
        </div>

        <div
          className={`border-2 border-dashed rounded-lg p-16 text-center mb-8 ${
            isLoading 
              ? 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800' 
              : 'border-blue-300 dark:border-blue-700 hover:border-blue-400 dark:hover:border-blue-600'
          }`}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          {isLoading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="w-16 h-16 text-blue-500 animate-spin mb-4" />
              <p className="text-xl text-gray-600 dark:text-gray-400">Processing file...</p>
            </div>
          ) : (
            <>
              <FileUp className="w-16 h-16 text-blue-500 mx-auto mb-6" />
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
                Drag and drop your ZIP file here, or
              </p>
              <label className="inline-flex items-center px-6 py-3 text-lg border-2 border-blue-500 dark:border-blue-400 rounded-md text-blue-500 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer">
                <span>Choose file</span>
                <input
                  type="file"
                  className="hidden"
                  accept=".zip"
                  onChange={handleFileChange}
                />
              </label>
            </>
          )}
        </div>

        <div className="text-center">
          <button
            onClick={loadDemoData}
            disabled={isLoading}
            className="inline-flex items-center px-6 py-3 text-lg text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md border-2 border-gray-300 dark:border-gray-600"
          >
            <Database className="w-6 h-6 mr-2" />
            Work with Demo Data
          </button>
        </div>

        {error && (
          <div className={`mt-6 p-4 rounded-md ${
            error.startsWith('Note:')
              ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400'
              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400'
          }`}>
            <p className="text-lg">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}