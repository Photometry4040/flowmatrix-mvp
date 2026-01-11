/**
 * Workflow Storage - LocalStorage 기반 워크플로우 영속성 관리
 * 
 * 기능:
 * - 워크플로우 프로젝트 저장/불러오기
 * - 프로젝트 목록 관리
 * - 자동 저장 (Debounce)
 * - 버전 관리
 */

import type { WorkflowProject, ActivityNode, WorkflowRelationship } from "@/types/workflow";
import { nanoid } from "nanoid";

const STORAGE_KEY_PREFIX = "flowmatrix_";
const PROJECTS_LIST_KEY = `${STORAGE_KEY_PREFIX}projects`;
const CURRENT_PROJECT_KEY = `${STORAGE_KEY_PREFIX}current`;

/**
 * 워크플로우 프로젝트 저장
 */
export function saveProject(project: WorkflowProject): void {
  try {
    // 저장 공간 확인
    const canSave = checkStorageQuota();
    if (!canSave) {
      throw new Error("저장 공간이 가득 찼습니다. 일부 프로젝트를 삭제하거나 내보내기하세요.");
    }

    const projectKey = `${STORAGE_KEY_PREFIX}project_${project.id}`;
    const updatedProject = {
      ...project,
      updatedAt: new Date().toISOString(),
      version: project.version + 1
    };

    localStorage.setItem(projectKey, JSON.stringify(updatedProject));

    // 프로젝트 목록 업데이트
    updateProjectsList(updatedProject);

    console.log(`✅ 프로젝트 저장 완료: ${project.name} (v${updatedProject.version})`);
  } catch (error) {
    console.error("프로젝트 저장 실패:", error);
    if (error instanceof Error && error.message.includes("저장 공간")) {
      throw error;
    }
    throw new Error("워크플로우를 저장할 수 없습니다. 브라우저 저장 공간을 확인하세요.");
  }
}

/**
 * 프로젝트 유효성 검증
 */
function validateProject(project: unknown): project is WorkflowProject {
  if (!project || typeof project !== 'object') {
    return false;
  }

  const p = project as Record<string, unknown>;

  // 필수 필드 확인
  if (typeof p.id !== 'string' || !p.id) return false;
  if (typeof p.name !== 'string' || !p.name) return false;
  if (!Array.isArray(p.nodes)) return false;
  if (!Array.isArray(p.edges)) return false;
  if (typeof p.createdAt !== 'string') return false;
  if (typeof p.updatedAt !== 'string') return false;
  if (typeof p.version !== 'number' || p.version < 1) return false;

  return true;
}

/**
 * 손상된 프로젝트 복구 시도
 */
function attemptProjectRecovery(projectData: unknown): WorkflowProject | null {
  if (!projectData || typeof projectData !== 'object') {
    return null;
  }

  const p = projectData as Record<string, unknown>;

  try {
    // 기본 필드 복구 시도
    const recovered: WorkflowProject = {
      id: typeof p.id === 'string' ? p.id : nanoid(),
      name: typeof p.name === 'string' ? p.name : '복구된 프로젝트',
      description: typeof p.description === 'string' ? p.description : undefined,
      nodes: Array.isArray(p.nodes) ? p.nodes : [],
      edges: Array.isArray(p.edges) ? p.edges : [],
      createdAt: typeof p.createdAt === 'string' ? p.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: typeof p.version === 'number' ? p.version : 1
    };

    // 복구된 프로젝트 유효성 재검증
    if (validateProject(recovered)) {
      console.log(`⚠️ 프로젝트 복구 성공: ${recovered.name}`);
      return recovered;
    }

    return null;
  } catch (error) {
    console.error('프로젝트 복구 실패:', error);
    return null;
  }
}

/**
 * 워크플로우 프로젝트 불러오기
 */
export function loadProject(projectId: string): WorkflowProject | null {
  try {
    const projectKey = `${STORAGE_KEY_PREFIX}project_${projectId}`;
    const data = localStorage.getItem(projectKey);

    if (!data) {
      return null;
    }

    let project: WorkflowProject;

    try {
      const parsed = JSON.parse(data);

      // 프로젝트 유효성 검증
      if (!validateProject(parsed)) {
        const { toast } = require('sonner');
        toast.warning('손상된 프로젝트 감지', {
          description: '프로젝트 데이터가 손상되었습니다. 복구를 시도합니다.',
        });

        // 복구 시도
        const recovered = attemptProjectRecovery(parsed);
        if (recovered) {
          // 복구된 프로젝트 저장
          saveProject(recovered);
          toast.success('프로젝트 복구 완료', {
            description: `"${recovered.name}" 프로젝트가 복구되었습니다.`,
          });
          project = recovered;
        } else {
          toast.error('프로젝트 복구 실패', {
            description: '프로젝트를 복구할 수 없습니다. 삭제 후 다시 생성하세요.',
          });
          return null;
        }
      } else {
        project = parsed;
      }

      console.log(`✅ 프로젝트 불러오기 완료: ${project.name} (v${project.version})`);
      return project;
    } catch (parseError) {
      const { toast } = require('sonner');
      toast.error('프로젝트 파싱 실패', {
        description: 'JSON 데이터가 손상되었습니다. 프로젝트를 삭제하세요.',
      });
      console.error('JSON 파싱 실패:', parseError);
      return null;
    }
  } catch (error) {
    console.error("프로젝트 불러오기 실패:", error);
    return null;
  }
}

/**
 * 새 프로젝트 생성
 */
export function createNewProject(name: string, description?: string): WorkflowProject {
  const project: WorkflowProject = {
    id: nanoid(),
    name,
    description,
    nodes: [],
    edges: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: 1
  };
  
  saveProject(project);
  setCurrentProject(project.id);
  
  return project;
}

/**
 * 프로젝트 삭제
 */
export function deleteProject(projectId: string): void {
  try {
    const projectKey = `${STORAGE_KEY_PREFIX}project_${projectId}`;
    localStorage.removeItem(projectKey);
    
    // 프로젝트 목록에서 제거
    const projects = getProjectsList();
    const updatedProjects = projects.filter(p => p.id !== projectId);
    localStorage.setItem(PROJECTS_LIST_KEY, JSON.stringify(updatedProjects));
    
    // 현재 프로젝트였다면 초기화
    if (getCurrentProjectId() === projectId) {
      localStorage.removeItem(CURRENT_PROJECT_KEY);
    }
    
    console.log(`✅ 프로젝트 삭제 완료: ${projectId}`);
  } catch (error) {
    console.error("프로젝트 삭제 실패:", error);
  }
}

/**
 * 모든 프로젝트 목록 가져오기
 */
export function getProjectsList(): Array<{
  id: string;
  name: string;
  description?: string;
  updatedAt: string;
  version: number;
}> {
  try {
    const data = localStorage.getItem(PROJECTS_LIST_KEY);
    if (!data) {
      return [];
    }
    return JSON.parse(data);
  } catch (error) {
    console.error("프로젝트 목록 불러오기 실패:", error);
    return [];
  }
}

/**
 * 프로젝트 목록 업데이트
 */
function updateProjectsList(project: WorkflowProject): void {
  const projects = getProjectsList();
  const existingIndex = projects.findIndex(p => p.id === project.id);
  
  const projectSummary = {
    id: project.id,
    name: project.name,
    description: project.description,
    updatedAt: project.updatedAt,
    version: project.version
  };
  
  if (existingIndex >= 0) {
    projects[existingIndex] = projectSummary;
  } else {
    projects.push(projectSummary);
  }
  
  // 최근 업데이트 순으로 정렬
  projects.sort((a, b) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
  
  localStorage.setItem(PROJECTS_LIST_KEY, JSON.stringify(projects));
}

/**
 * 현재 작업 중인 프로젝트 ID 설정
 */
export function setCurrentProject(projectId: string): void {
  localStorage.setItem(CURRENT_PROJECT_KEY, projectId);
}

/**
 * 현재 작업 중인 프로젝트 ID 가져오기
 */
export function getCurrentProjectId(): string | null {
  return localStorage.getItem(CURRENT_PROJECT_KEY);
}

/**
 * 현재 작업 중인 프로젝트 불러오기
 */
export function loadCurrentProject(): WorkflowProject | null {
  const projectId = getCurrentProjectId();
  if (!projectId) {
    return null;
  }
  return loadProject(projectId);
}

/**
 * 프로젝트 복제
 */
export function duplicateProject(projectId: string): WorkflowProject | null {
  const original = loadProject(projectId);
  if (!original) {
    return null;
  }
  
  const duplicate: WorkflowProject = {
    ...original,
    id: nanoid(),
    name: `${original.name} (복사본)`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: 1
  };
  
  saveProject(duplicate);
  return duplicate;
}

/**
 * 프로젝트 내보내기 (JSON)
 */
export function exportProject(projectId: string): string | null {
  const project = loadProject(projectId);
  if (!project) {
    return null;
  }
  
  return JSON.stringify(project, null, 2);
}

/**
 * 프로젝트 가져오기 (JSON)
 */
export function importProject(jsonData: string): WorkflowProject | null {
  try {
    const project = JSON.parse(jsonData) as WorkflowProject;
    
    // 새 ID 할당 (충돌 방지)
    project.id = nanoid();
    project.createdAt = new Date().toISOString();
    project.updatedAt = new Date().toISOString();
    project.version = 1;
    
    saveProject(project);
    return project;
  } catch (error) {
    console.error("프로젝트 가져오기 실패:", error);
    return null;
  }
}

/**
 * 자동 저장 (Debounce)
 */
let autoSaveTimeout: NodeJS.Timeout | null = null;

export function autoSaveProject(
  projectId: string,
  nodes: ActivityNode[],
  edges: WorkflowRelationship[],
  delay: number = 2000
): void {
  if (autoSaveTimeout) {
    clearTimeout(autoSaveTimeout);
  }
  
  autoSaveTimeout = setTimeout(() => {
    const project = loadProject(projectId);
    if (project) {
      saveProject({
        ...project,
        nodes,
        edges
      });
    }
  }, delay);
}

/**
 * 저장 공간 사용량 확인 (MB)
 */
export function getStorageUsage(): { used: number; total: number; percentage: number } {
  let used = 0;

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(STORAGE_KEY_PREFIX)) {
      const value = localStorage.getItem(key);
      if (value) {
        used += new Blob([value]).size;
      }
    }
  }

  // LocalStorage는 일반적으로 5-10MB 제한
  const total = 5 * 1024 * 1024; // 5MB
  const usedMB = used / (1024 * 1024);
  const totalMB = total / (1024 * 1024);

  return {
    used: usedMB,
    total: totalMB,
    percentage: (usedMB / totalMB) * 100
  };
}

/**
 * 저장 공간 할당량 확인 및 경고
 * @param threshold 경고 임계값 (기본: 90%)
 * @returns 저장 가능 여부
 */
export function checkStorageQuota(threshold = 90): boolean {
  const { used, total, percentage } = getStorageUsage();

  if (percentage >= 100) {
    const { toast } = require('sonner');
    toast.error('저장 공간이 가득 찼습니다', {
      description: `${used.toFixed(2)}MB / ${total.toFixed(0)}MB 사용 중. 일부 프로젝트를 삭제하거나 내보내기하세요.`,
    });
    return false;
  }

  if (percentage >= threshold) {
    const { toast } = require('sonner');
    toast.warning('저장 공간이 부족합니다', {
      description: `${percentage.toFixed(0)}% 사용 중 (${used.toFixed(2)}MB / ${total.toFixed(0)}MB). ${(total - used).toFixed(1)}MB 남음.`,
    });
    return true; // 경고만 표시, 저장은 가능
  }

  return true;
}

/**
 * 모든 프로젝트 삭제 (초기화)
 */
export function clearAllProjects(): void {
  const keys: string[] = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(STORAGE_KEY_PREFIX)) {
      keys.push(key);
    }
  }
  
  keys.forEach(key => localStorage.removeItem(key));
  console.log(`✅ 모든 프로젝트 삭제 완료 (${keys.length}개)`);
}
