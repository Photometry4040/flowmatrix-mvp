// FlowMatrix Workflow Types
// Based on PRD Section 3.2: Node & Workflow Definition

export type NodeType = "TRIGGER" | "ACTION" | "DECISION" | "ARTIFACT";

// 동적 부서/단계 지원을 위해 string 타입으로 변경
export type Department = string;
export type ProjectStage = string;

// 부서/단계 설정 관리를 위한 새로운 타입들
export interface DepartmentConfig {
  id: string;
  label: string;
  order: number;
}

export interface StageConfig {
  id: string;
  label: string;
  order: number;
}

export interface WorkspaceConfig {
  id: string;
  departments: DepartmentConfig[];
  stages: StageConfig[];
}

export type BrainUsage = "LOW" | "MEDIUM" | "HIGH";

export type NodeStatus = "PENDING" | "READY" | "IN_PROGRESS" | "COMPLETED" | "BLOCKED";

export interface ActivityNode {
  id: string;
  type: NodeType;
  label: string;
  stage: ProjectStage;
  department: Department;
  attributes: {
    tool: string[];
    avg_time: string;
    is_repetitive: boolean;
    brain_usage: BrainUsage;
    assignee?: string;
  };
  ontology_tags: string[];
  position: { x: number; y: number };
  // 실행 상태 관련
  status?: NodeStatus;
  completedAt?: string;
  startedAt?: string;
  progress?: number; // 0-100
  // 분석 결과 관련
  isBottleneck?: boolean;
  aiScore?: number; // 0-100
}

export type RelationType = "TRIGGER" | "BLOCKS" | "REQUIRES" | "FEEDBACK_TO";

export interface WorkflowRelationship {
  id: string;
  source: string;
  target: string;
  relation_type: RelationType;
  properties: {
    lag_time?: string;
    condition?: string;
  };
}

export interface AIScoreResult {
  node_id: string;
  ai_score: number; // 0-100
  reasoning: string;
  suggested_solution?: string;
}

export interface BottleneckAnalysis {
  node_id: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  lead_time: string;
  impact_score: number;
}

export interface WorkflowProject {
  id: string;
  name: string;
  description?: string;
  nodes: ActivityNode[];
  edges: WorkflowRelationship[];
  createdAt: string;
  updatedAt: string;
  version: number;
}

// Panel UI State Types
export interface PanelState {
  isCollapsed: boolean;
  isFloating: boolean;
  position?: { x: number; y: number };
  width: number;
}

export interface PanelPreferences {
  leftPanel: PanelState;
  rightPanel: PanelState;
}

// Template System Types
export type TemplateCategory =
  | "SW_DEVELOPMENT"
  | "HW_DEVELOPMENT"
  | "MARKETING"
  | "DESIGN"
  | "CUSTOM";

export interface WorkflowTemplate {
  id: string;
  name: string;
  description?: string;
  category: TemplateCategory;
  tags: string[];
  thumbnail?: string; // base64 encoded screenshot
  nodes: ActivityNode[];
  edges: WorkflowRelationship[];
  createdAt: string;
  updatedAt: string;
  usageCount: number;
}

// Lead Time Analysis Types
export interface CriticalPathNode {
  id: string;
  label: string;
  leadTime: number;
  position: number;
}

export interface LeadTimeResult {
  totalMinutes: number;
  totalHours: number;
  totalDays: number;
  formatted: string; // "5d 3h 20m"
  criticalPath: string[]; // node IDs
  criticalPathNodes: CriticalPathNode[];
  stageBreakdown: Record<string, number>;
  departmentBreakdown: Record<string, number>;
}
