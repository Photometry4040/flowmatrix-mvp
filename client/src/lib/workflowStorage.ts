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
    throw new Error("워크플로우를 저장할 수 없습니다. 브라우저 저장 공간을 확인하세요.");
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
    
    const project = JSON.parse(data) as WorkflowProject;
    console.log(`✅ 프로젝트 불러오기 완료: ${project.name} (v${project.version})`);
    return project;
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
export function getStorageUsage(): { used: number; total: number } {
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
  
  return {
    used: used / (1024 * 1024), // MB로 변환
    total: total / (1024 * 1024)
  };
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
