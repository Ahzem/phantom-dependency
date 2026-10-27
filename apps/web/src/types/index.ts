export type GraveyardStatus = 'resting' | 'aging' | 'whispering' | 'haunted';

export type FindingCategory = 'outdated' | 'inactive' | 'security' | 'unused' | 'unresolved';

export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export type DependencyType = 'dependencies' | 'devDependencies' | 'optionalDependencies' | 'peerDependencies';

export interface Dependency {
  name: string;
  declared_range: string;
  installed_version?: string | null;
  dependency_type: DependencyType;
  is_direct: boolean;
  manifest_path: string;
  is_used_in_source?: boolean | null;
  source_reference_count: number;
  resolved_registry?: string | null;
  latest_version?: string | null;
  last_published?: string | null;
  homepage?: string | null;
  repository_url?: string | null;
  is_archived?: boolean | null;
}

export interface Finding {
  id: string;
  package_name: string;
  category: FindingCategory;
  severity: Severity;
  graveyard_status: GraveyardStatus;
  title: string;
  explanation: string;
  evidence: string[];
  evidence_source: string;
  confidence: string;
  recommended_action: string;
  is_verified: boolean;
  ai_explanation?: string | null;
  advisory_id?: string | null;
  current_version?: string | null;
  target_version?: string | null;
  details?: Record<string, any>;
}

export interface InvestigationReport {
  id: string;
  project_name: string;
  project_version?: string | null;
  project_path: string;
  created_at: string;
  tool_version: string;
  total_dependencies: number;
  direct_dependencies: number;
  outdated_count: number;
  inactive_count: number;
  security_count: number;
  unused_count: number;
  unresolved_count: number;
  graveyard_summary: {
    resting: number;
    aging: number;
    whispering: number;
    haunted: number;
  };
  overall_health_score: number;
  ai_summary?: string | null;
  ai_model_used?: string | null;
  is_ai_generated: boolean;
  dependencies: Dependency[];
  findings: Finding[];
  limitations: string[];
}

export interface ReportListItem {
  id: string;
  project_name: string;
  project_path: string;
  created_at: string;
  total_dependencies: number;
  findings_count: number;
  haunted_count: number;
  overall_health_score: number;
}

export interface ProjectValidateResponse {
  is_valid: boolean;
  project_path: string;
  project_name?: string | null;
  project_version?: string | null;
  has_lockfile: boolean;
  lockfile_type?: string | null;
  error?: string | null;
}

export interface AIStatusResponse {
  is_available: boolean;
  model_present: boolean;
  installed_models: string[];
  target_model: string;
  message: string;
}
