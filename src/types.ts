export interface StepInfo {
  type: string;
  reason: string;
}

export interface PhaseDefinition {
  min_age: string;
  actions: {
    [key: string]: {
      priority?: number;
      [key: string]: any;
    };
  };
}

export interface PhaseExecution {
  policy: string;
  phase_definition: PhaseDefinition;
  version: number;
  modified_date: string;
  modified_date_in_millis: number;
}

export interface ILMError {
  index: string;
  managed: boolean;
  policy: string;
  index_creation_date: string;
  index_creation_date_millis: number;
  time_since_index_creation: string;
  lifecycle_date: string;
  lifecycle_date_millis: number;
  age: string;
  phase: string;
  phase_time: string;
  phase_time_millis: number;
  action: string;
  action_time: string;
  action_time_millis: number;
  step: string;
  step_time: string;
  step_time_millis: number;
  failed_step: string;
  is_auto_retryable_error: boolean;
  failed_step_retry_count: number;
  step_info: StepInfo;
  previous_step_info: StepInfo;
  phase_execution: PhaseExecution;
}

export interface ILMErrors {
  indices: {
    [key: string]: ILMError;
  };
}

export interface ILMPolicy {
  phases?: {
    hot?: any;
    warm?: any;
    cold?: any;
    delete?: any;
  };
}

export interface ILMPolicies {
  [key: string]: ILMPolicy;
}

export interface VersionInfo {
  name: string;
  cluster_name: string;
  cluster_uuid: string;
  version: {
    number: string;
    build_flavor: string;
    build_type: string;
    build_hash: string;
    build_date: string;
    build_snapshot: boolean;
    lucene_version: string;
    minimum_wire_compatibility_version: string;
    minimum_index_compatibility_version: string;
  };
  tagline: string;
}

export interface ShardInfo {
  docs: string | null;
  index: string;
  ip: string | null;
  node: string | null;
  prirep: string;
  shard: string;
  state: string;
  store: string | null;
}

export interface NodeDecider {
  decider: string;
  decision: string;
  explanation: string;
}

export interface NodeStore {
  matching_size_in_bytes: number;
}

export interface NodeAttributes {
  instance_configuration?: string;
  availability_zone?: string;
  logical_availability_zone?: string;
  data?: string;
  'ml.config_version'?: string;
  'xpack.installed'?: string;
  'transform.config_version'?: string;
  server_name?: string;
  region?: string;
  [key: string]: any;
}

export interface NodeAllocationDecision {
  node_id: string;
  node_name: string;
  transport_address: string;
  node_attributes: NodeAttributes;
  node_decision: string;
  store?: NodeStore;
  deciders?: NodeDecider[];
}

export interface UnassignedInfo {
  reason: string;
  at: string;
  details: string;
  last_allocation_status: string;
}

export interface AllocationExplanation {
  note?: string;
  index: string;
  shard: number;
  primary: boolean;
  current_state: string;
  unassigned_info: UnassignedInfo;
  can_allocate: string;
  allocate_explanation: string;
  node_allocation_decisions: NodeAllocationDecision[];
}

export interface NodeInfo {
  name: string;
  transport_address: string;
  host: string;
  ip: string;
  version: string;
  build_flavor: string;
  build_type: string;
  build_hash: string;
  roles: string[];
  attributes: NodeAttributes;
  total_indexing_buffer_in_bytes: string;
  transport_version?: number;
  index_version?: number;
  component_versions?: {
    transform_config_version?: number;
    ml_config_version?: number;
  };
  aggregations?: {
    [key: string]: any;
  };
}

export interface NodesResponse {
  _nodes: {
    total: number;
    successful: number;
    failed: number;
  };
  cluster_name: string;
  nodes: {
    [key: string]: NodeInfo;
  };
}

export interface MasterNode {
  id: string;
  host: string;
  ip: string;
  node: string;
}

export interface NodesViewProps {
  nodesData: NodesResponse;
  masterNode?: MasterNode;
}

export interface ProcessorStats {
  type: string;
  stats: {
    count: number;
    current: number;
    failed: number;
    time: string;
    time_in_millis: number;
  };
}

export interface PipelineStats {
  count: number;
  current: number;
  failed: number;
  processors: Array<{
    [key: string]: {
      type: string;
      stats: {
        count: number;
        current: number;
        failed: number;
        time: string;
        time_in_millis: number;
      };
    };
  }>;
}

export interface NodeStats {
  ingest?: {
    pipelines: {
      [key: string]: PipelineStats;
    };
  };
}

export interface NodesStatsResponse {
  _nodes: {
    total: number;
    successful: number;
    failed: number;
  };
  cluster_name: string;
  nodes: {
    [key: string]: NodeStats;
  };
}

export interface PipelineProcessor {
  type: string;
  description?: string;
  field?: string;
  target_field?: string;
  patterns?: string[];
  pattern?: string;
  ignore_failure?: boolean;
  ignore_missing?: boolean;
  [key: string]: any;
}

export interface Pipeline {
  description?: string;
  _meta?: {
    managed?: boolean;
    managed_by?: string;
  };
  processors: PipelineProcessor[];
  on_failure?: PipelineProcessor[];
  version?: number;
}

export interface PipelineConfigs {
  [key: string]: Pipeline;
}

export interface MLDetector {
  detector_description: string;
  detector_index: number;
  field_name: string;
  partition_field_name?: string;
  use_null: boolean;
  function: string;
}

export interface MLAnalysisConfig {
  bucket_span: string;
  detectors: MLDetector[];
  influencers: string[];
  model_prune_window: string;
}

export interface MLDatafeedConfig {
  authorization: {
    roles: string[];
  };
  chunking_config: {
    mode: string;
  };
  datafeed_id: string;
  delayed_data_check_config: {
    enabled: boolean;
  };
  indices: string[];
  indices_options: {
    allow_no_indices: boolean;
    expand_wildcards: string[];
    ignore_throttled: boolean;
    ignore_unavailable: boolean;
  };
  job_id: string;
  max_empty_searches: number;
  query: any;
  query_delay: string;
  scroll_size: number;
}

export interface MLJob {
  allow_lazy_open: boolean;
  analysis_config: MLAnalysisConfig;
  analysis_limits: {
    categorization_examples_limit: number;
    model_memory_limit: string;
  };
  create_time: number;
  custom_settings: {
    created_by: string;
    custom_urls: any[];
  };
  daily_model_snapshot_retention_after_days: number;
  data_description: {
    time_field: string;
    time_format: string;
  };
  datafeed_config: MLDatafeedConfig;
  description: string;
  groups: string[];
  job_id: string;
  job_type: string;
  job_version: string;
  model_snapshot_id: string;
  model_snapshot_retention_days: number;
  results_index_name: string;
}

export interface MLAnomalyDetectors {
  count: number;
  jobs: MLJob[];
}