import React, { useState } from 'react';
import { Database, AlertCircle, Search, ChevronLeft, ChevronRight, Code, Settings } from 'lucide-react';
import { AllocationExplanation } from '../components/AllocationExplanation';
import { ApiRequestModal } from '../components/ApiRequestModal';
import { IndexSettingsModal } from '../components/IndexSettingsModal';
import type { ShardInfo, AllocationExplanation as AllocationExplanationType } from '../types';

interface ShardsViewProps {
  shards: ShardInfo[];
  allocation?: AllocationExplanationType;
}

interface ApiButtonProps {
  shard: ShardInfo;
}

function ApiButton({ shard }: ApiButtonProps) {
  const [showModal, setShowModal] = useState(false);

  const apiRequest = {
    method: 'GET',
    endpoint: '_cluster/allocation/explain',
    body: {
      index: shard.index,
      shard: parseInt(shard.shard),
      primary: shard.prirep === 'p'
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        aria-label="Show API request"
      >
        <Code className="w-4 h-4 text-gray-500 dark:text-gray-400" />
      </button>
      {showModal && (
        <ApiRequestModal
          request={apiRequest}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}

export function ShardsView({ shards, allocation }: ShardsViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIndex, setSelectedIndex] = useState<string | null>(null);
  const itemsPerPage = 10;

  const unassignedShards = shards
    .filter(shard => shard.state === 'UNASSIGNED')
    .filter(shard => 
      searchTerm === '' || 
      shard.index.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const totalPages = Math.ceil(unassignedShards.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedShards = unassignedShards.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Unassigned Shards</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Overview of shards that are currently unassigned in the cluster
        </p>
      </div>

      {allocation && (
        <div className="mb-8">
          <AllocationExplanation explanation={allocation} />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="relative flex items-center">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
          </div>
          <input
            type="text"
            placeholder="Search by index name..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="block w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
          <div className="flex items-center">
            <div className="bg-red-100 dark:bg-red-900/20 p-3 rounded-lg mr-4">
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                {unassignedShards.length}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Unassigned Shards
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Index
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Shard
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Primary/Replica
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Docs
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Store Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedShards.map((shard, index) => (
                <tr key={`${shard.index}-${shard.shard}-${index}`} 
                    className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                    <button
                      onClick={() => setSelectedIndex(shard.index)}
                      className="flex items-center hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      {shard.index}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                    {shard.shard}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      shard.prirep === 'p' 
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                        : 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300'
                    }`}>
                      {shard.prirep === 'p' ? 'Primary' : 'Replica'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                    {shard.docs || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                    {shard.store ? `${Math.round(parseInt(shard.store) / 1024)} KB` : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <ApiButton shard={shard} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {unassignedShards.length === 0 && (
            <div className="text-center py-8">
              <Database className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm ? 'No matching unassigned shards found' : 'No unassigned shards found'}
              </p>
            </div>
          )}
        </div>

        {unassignedShards.length > 0 && (
          <div className="px-6 py-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, unassignedShards.length)} of {unassignedShards.length} results
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  First
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-1 px-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Page {currentPage} of {totalPages}
                  </span>
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Last
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {selectedIndex && (
        <IndexSettingsModal
          indexName={selectedIndex}
          onClose={() => setSelectedIndex(null)}
        />
      )}
    </div>
  );
}