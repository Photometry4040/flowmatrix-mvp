// Workspace Configuration Management
// Manages dynamic departments and stages with LocalStorage persistence

import type { DepartmentConfig, StageConfig, WorkspaceConfig, ActivityNode } from "@/types/workflow";

const WORKSPACE_CONFIG_KEY = "flowmatrix_workspace_config";

// 기본 설정값
const DEFAULT_DEPARTMENTS: DepartmentConfig[] = [
  { id: "PRODUCT_TEAM", label: "제품팀", order: 0 },
  { id: "DESIGN_TEAM", label: "디자인팀", order: 1 },
  { id: "SW_TEAM", label: "소프트웨어팀", order: 2 },
  { id: "HW_TEAM", label: "하드웨어팀", order: 3 },
  { id: "QA_TEAM", label: "QA팀", order: 4 },
  { id: "MARKETING_TEAM", label: "마케팅팀", order: 5 },
];

const DEFAULT_STAGES: StageConfig[] = [
  { id: "PLANNING", label: "기획", order: 0 },
  { id: "DEVELOPMENT", label: "개발", order: 1 },
  { id: "TESTING", label: "테스트", order: 2 },
  { id: "DEPLOYMENT", label: "배포", order: 3 },
  { id: "MAINTENANCE", label: "유지보수", order: 4 },
];

/**
 * 기본 WorkspaceConfig 생성
 */
function createDefaultConfig(): WorkspaceConfig {
  return {
    id: "default",
    departments: DEFAULT_DEPARTMENTS,
    stages: DEFAULT_STAGES,
  };
}

/**
 * WorkspaceConfig를 LocalStorage에서 로드
 * 없으면 기본값 반환
 */
export function loadWorkspaceConfig(): WorkspaceConfig {
  try {
    const stored = localStorage.getItem(WORKSPACE_CONFIG_KEY);
    if (!stored) {
      const defaultConfig = createDefaultConfig();
      saveWorkspaceConfig(defaultConfig);
      return defaultConfig;
    }
    return JSON.parse(stored) as WorkspaceConfig;
  } catch (error) {
    console.error("Failed to load workspace config:", error);
    return createDefaultConfig();
  }
}

/**
 * WorkspaceConfig를 LocalStorage에 저장
 */
export function saveWorkspaceConfig(config: WorkspaceConfig): void {
  try {
    localStorage.setItem(WORKSPACE_CONFIG_KEY, JSON.stringify(config));
  } catch (error) {
    console.error("Failed to save workspace config:", error);
  }
}

/**
 * 새로운 부서 추가
 */
export function addDepartment(
  id: string,
  label: string,
  config: WorkspaceConfig
): { success: boolean; config?: WorkspaceConfig; error?: string } {
  // 최대 10개 부서 제한
  if (config.departments.length >= 10) {
    return { success: false, error: "최대 10개의 부서까지만 추가할 수 있습니다." };
  }

  // 중복 확인
  if (config.departments.some((d) => d.id === id)) {
    return { success: false, error: "이미 존재하는 부서 ID입니다." };
  }

  const newDept: DepartmentConfig = {
    id,
    label,
    order: config.departments.length,
  };

  const updated = {
    ...config,
    departments: [...config.departments, newDept],
  };

  saveWorkspaceConfig(updated);
  return { success: true, config: updated };
}

/**
 * 부서 삭제 (노드 존재 여부 확인)
 */
export function canDeleteDepartment(
  deptId: string,
  nodes: ActivityNode[]
): { canDelete: boolean; nodeCount: number } {
  const nodeCount = nodes.filter((n) => n.department === deptId).length;
  return { canDelete: nodeCount === 0, nodeCount };
}

/**
 * 부서 실제 삭제
 */
export function deleteDepartment(
  deptId: string,
  config: WorkspaceConfig
): { success: boolean; config?: WorkspaceConfig; error?: string } {
  const deptIndex = config.departments.findIndex((d) => d.id === deptId);
  if (deptIndex === -1) {
    return { success: false, error: "존재하지 않는 부서입니다." };
  }

  // 부서 제거 후 order 재정렬
  const updated = {
    ...config,
    departments: config.departments
      .filter((d) => d.id !== deptId)
      .map((d, idx) => ({ ...d, order: idx })),
  };

  saveWorkspaceConfig(updated);
  return { success: true, config: updated };
}

/**
 * 부서 수정
 */
export function updateDepartment(
  deptId: string,
  label: string,
  config: WorkspaceConfig
): { success: boolean; config?: WorkspaceConfig; error?: string } {
  const deptIndex = config.departments.findIndex((d) => d.id === deptId);
  if (deptIndex === -1) {
    return { success: false, error: "존재하지 않는 부서입니다." };
  }

  const updated = {
    ...config,
    departments: config.departments.map((d) =>
      d.id === deptId ? { ...d, label } : d
    ),
  };

  saveWorkspaceConfig(updated);
  return { success: true, config: updated };
}

/**
 * 부서 순서 변경 (드래그 정렬)
 */
export function reorderDepartments(
  departments: DepartmentConfig[],
  config: WorkspaceConfig
): { success: boolean; config?: WorkspaceConfig } {
  const reordered = departments.map((d, idx) => ({ ...d, order: idx }));
  const updated = { ...config, departments: reordered };
  saveWorkspaceConfig(updated);
  return { success: true, config: updated };
}

/**
 * 새로운 단계 추가
 */
export function addStage(
  id: string,
  label: string,
  config: WorkspaceConfig
): { success: boolean; config?: WorkspaceConfig; error?: string } {
  // 최대 7개 단계 제한
  if (config.stages.length >= 7) {
    return { success: false, error: "최대 7개의 단계까지만 추가할 수 있습니다." };
  }

  // 중복 확인
  if (config.stages.some((s) => s.id === id)) {
    return { success: false, error: "이미 존재하는 단계 ID입니다." };
  }

  const newStage: StageConfig = {
    id,
    label,
    order: config.stages.length,
  };

  const updated = {
    ...config,
    stages: [...config.stages, newStage],
  };

  saveWorkspaceConfig(updated);
  return { success: true, config: updated };
}

/**
 * 단계 삭제 (노드 존재 여부 확인)
 */
export function canDeleteStage(
  stageId: string,
  nodes: ActivityNode[]
): { canDelete: boolean; nodeCount: number } {
  const nodeCount = nodes.filter((n) => n.stage === stageId).length;
  return { canDelete: nodeCount === 0, nodeCount };
}

/**
 * 단계 실제 삭제
 */
export function deleteStage(
  stageId: string,
  config: WorkspaceConfig
): { success: boolean; config?: WorkspaceConfig; error?: string } {
  const stageIndex = config.stages.findIndex((s) => s.id === stageId);
  if (stageIndex === -1) {
    return { success: false, error: "존재하지 않는 단계입니다." };
  }

  // 단계 제거 후 order 재정렬
  const updated = {
    ...config,
    stages: config.stages
      .filter((s) => s.id !== stageId)
      .map((s, idx) => ({ ...s, order: idx })),
  };

  saveWorkspaceConfig(updated);
  return { success: true, config: updated };
}

/**
 * 단계 수정
 */
export function updateStage(
  stageId: string,
  label: string,
  config: WorkspaceConfig
): { success: boolean; config?: WorkspaceConfig; error?: string } {
  const stageIndex = config.stages.findIndex((s) => s.id === stageId);
  if (stageIndex === -1) {
    return { success: false, error: "존재하지 않는 단계입니다." };
  }

  const updated = {
    ...config,
    stages: config.stages.map((s) =>
      s.id === stageId ? { ...s, label } : s
    ),
  };

  saveWorkspaceConfig(updated);
  return { success: true, config: updated };
}

/**
 * 단계 순서 변경 (드래그 정렬)
 */
export function reorderStages(
  stages: StageConfig[],
  config: WorkspaceConfig
): { success: boolean; config?: WorkspaceConfig } {
  const reordered = stages.map((s, idx) => ({ ...s, order: idx }));
  const updated = { ...config, stages: reordered };
  saveWorkspaceConfig(updated);
  return { success: true, config: updated };
}

/**
 * 기본값으로 리셋
 */
export function resetToDefaults(): WorkspaceConfig {
  const defaultConfig = createDefaultConfig();
  saveWorkspaceConfig(defaultConfig);
  return defaultConfig;
}
