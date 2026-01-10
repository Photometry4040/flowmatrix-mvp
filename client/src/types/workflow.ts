// FlowMatrix Workflow Types
// Based on PRD Section 3.2: Node & Workflow Definition

export type NodeType = "TRIGGER" | "ACTION" | "DECISION" | "ARTIFACT";

export type Department = 
  | "HW_TEAM" 
  | "SW_TEAM" 
  | "DESIGN_TEAM" 
  | "QA_TEAM" 
  | "PRODUCT_TEAM"
  | "MARKETING_TEAM";

export type ProjectStage = 
  | "PLANNING" 
  | "DEVELOPMENT" 
  | "TESTING" 
  | "DEPLOYMENT" 
  | "MAINTENANCE";

export type BrainUsage = "LOW" | "MEDIUM" | "HIGH";

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
