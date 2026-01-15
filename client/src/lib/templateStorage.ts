/**
 * Template Storage - LocalStorage 기반 워크플로우 템플릿 관리
 *
 * 기능:
 * - 템플릿 저장/불러오기
 * - 템플릿 목록 관리
 * - 템플릿 검색 및 필터링
 * - 기본 템플릿 초기화
 * - 템플릿 import/export
 */

import type {
  WorkflowTemplate,
  TemplateCategory,
  ActivityNode,
  WorkflowRelationship,
  WorkflowProject,
} from "@/types/workflow";
import { nanoid } from "nanoid";

const STORAGE_KEY_PREFIX = "flowmatrix_template_";
const TEMPLATES_LIST_KEY = "flowmatrix_templates_list";
const TEMPLATES_INITIALIZED_KEY = "flowmatrix_templates_initialized";

/**
 * 기본 템플릿 데이터 생성
 */
function createBuiltInTemplates(): WorkflowTemplate[] {
  // SW_DEVELOPMENT: "애자일 스프린트 워크플로우"
  const swTemplate: WorkflowTemplate = {
    id: "template_sw_dev",
    name: "애자일 스프린트 워크플로우",
    description: "7주 스프린트 기반 소프트웨어 개발 프로세스",
    category: "SW_DEVELOPMENT",
    tags: ["#애자일", "#스프린트", "#개발", "#QA", "#배포"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    usageCount: 0,
    nodes: [
      {
        id: "sw_1",
        type: "TRIGGER",
        label: "스프린트 기획",
        stage: "PLANNING",
        department: "SW_TEAM",
        attributes: {
          tool: ["Jira", "Slack"],
          avg_time: "4h",
          is_repetitive: true,
          brain_usage: "MEDIUM",
        },
        ontology_tags: ["#기획", "#스프린트"],
        position: { x: 0, y: 0 },
      },
      {
        id: "sw_2",
        type: "ACTION",
        label: "설계 및 아키텍처",
        stage: "PLANNING",
        department: "SW_TEAM",
        attributes: {
          tool: ["Figma", "Notion"],
          avg_time: "8h",
          is_repetitive: false,
          brain_usage: "HIGH",
        },
        ontology_tags: ["#설계", "#아키텍처"],
        position: { x: 300, y: 0 },
      },
      {
        id: "sw_3",
        type: "ACTION",
        label: "코드 개발",
        stage: "DEVELOPMENT",
        department: "SW_TEAM",
        attributes: {
          tool: ["VS Code", "Git", "GitHub"],
          avg_time: "40h",
          is_repetitive: false,
          brain_usage: "HIGH",
        },
        ontology_tags: ["#개발", "#코딩"],
        position: { x: 600, y: 0 },
      },
      {
        id: "sw_4",
        type: "DECISION",
        label: "코드 리뷰",
        stage: "DEVELOPMENT",
        department: "SW_TEAM",
        attributes: {
          tool: ["GitHub", "GitLab"],
          avg_time: "4h",
          is_repetitive: true,
          brain_usage: "HIGH",
        },
        ontology_tags: ["#리뷰", "#품질"],
        position: { x: 900, y: 0 },
        aiScore: 60,
      },
      {
        id: "sw_5",
        type: "ACTION",
        label: "QA 테스트",
        stage: "TESTING",
        department: "QA_TEAM",
        attributes: {
          tool: ["Jira", "TestRail", "Selenium"],
          avg_time: "16h",
          is_repetitive: true,
          brain_usage: "MEDIUM",
        },
        ontology_tags: ["#테스트", "#QA"],
        position: { x: 1200, y: 0 },
        aiScore: 75,
      },
      {
        id: "sw_6",
        type: "ACTION",
        label: "배포",
        stage: "DEPLOYMENT",
        department: "SW_TEAM",
        attributes: {
          tool: ["Jenkins", "Docker", "Kubernetes"],
          avg_time: "2h",
          is_repetitive: true,
          brain_usage: "MEDIUM",
        },
        ontology_tags: ["#배포", "#DevOps"],
        position: { x: 1500, y: 0 },
        aiScore: 80,
      },
      {
        id: "sw_7",
        type: "ARTIFACT",
        label: "스프린트 회고",
        stage: "PLANNING",
        department: "SW_TEAM",
        attributes: {
          tool: ["Notion", "Slack"],
          avg_time: "2h",
          is_repetitive: true,
          brain_usage: "MEDIUM",
        },
        ontology_tags: ["#회고", "#개선"],
        position: { x: 1800, y: 0 },
      },
    ],
    edges: [
      {
        id: "sw_e1",
        source: "sw_1",
        target: "sw_2",
        relation_type: "TRIGGER",
        properties: {},
      },
      {
        id: "sw_e2",
        source: "sw_2",
        target: "sw_3",
        relation_type: "REQUIRES",
        properties: {},
      },
      {
        id: "sw_e3",
        source: "sw_3",
        target: "sw_4",
        relation_type: "REQUIRES",
        properties: {},
      },
      {
        id: "sw_e4",
        source: "sw_4",
        target: "sw_5",
        relation_type: "REQUIRES",
        properties: {},
      },
      {
        id: "sw_e5",
        source: "sw_5",
        target: "sw_6",
        relation_type: "REQUIRES",
        properties: {},
      },
      {
        id: "sw_e6",
        source: "sw_6",
        target: "sw_7",
        relation_type: "REQUIRES",
        properties: {},
      },
    ],
  };

  // HW_DEVELOPMENT: "하드웨어 제품 개발"
  const hwTemplate: WorkflowTemplate = {
    id: "template_hw_dev",
    name: "하드웨어 제품 개발",
    description: "8단계 하드웨어 제품 개발 프로세스",
    category: "HW_DEVELOPMENT",
    tags: ["#하드웨어", "#개발", "#테스트", "#양산"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    usageCount: 0,
    nodes: [
      {
        id: "hw_1",
        type: "TRIGGER",
        label: "요구사항 정의",
        stage: "PLANNING",
        department: "HW_TEAM",
        attributes: {
          tool: ["Notion", "Jira"],
          avg_time: "8h",
          is_repetitive: false,
          brain_usage: "HIGH",
        },
        ontology_tags: ["#요구사항", "#기획"],
        position: { x: 0, y: 0 },
      },
      {
        id: "hw_2",
        type: "ACTION",
        label: "하드웨어 설계",
        stage: "DEVELOPMENT",
        department: "HW_TEAM",
        attributes: {
          tool: ["CAD", "Eagle", "Altium"],
          avg_time: "80h",
          is_repetitive: false,
          brain_usage: "HIGH",
        },
        ontology_tags: ["#설계", "#CAD"],
        position: { x: 300, y: 0 },
      },
      {
        id: "hw_3",
        type: "ACTION",
        label: "시제품 제작",
        stage: "DEVELOPMENT",
        department: "HW_TEAM",
        attributes: {
          tool: ["3D Printer", "CNC"],
          avg_time: "40h",
          is_repetitive: false,
          brain_usage: "MEDIUM",
        },
        ontology_tags: ["#시제품", "#제조"],
        position: { x: 600, y: 0 },
        isBottleneck: true,
      },
      {
        id: "hw_4",
        type: "DECISION",
        label: "성능 테스트",
        stage: "TESTING",
        department: "QA_TEAM",
        attributes: {
          tool: ["Test Equipment", "Multimeter"],
          avg_time: "24h",
          is_repetitive: true,
          brain_usage: "MEDIUM",
        },
        ontology_tags: ["#테스트", "#성능"],
        position: { x: 900, y: 0 },
      },
      {
        id: "hw_5",
        type: "ACTION",
        label: "인증 및 규격",
        stage: "TESTING",
        department: "HW_TEAM",
        attributes: {
          tool: ["Certification Lab"],
          avg_time: "160h",
          is_repetitive: false,
          brain_usage: "MEDIUM",
        },
        ontology_tags: ["#인증", "#규격"],
        position: { x: 1200, y: 0 },
        isBottleneck: true,
      },
      {
        id: "hw_6",
        type: "ACTION",
        label: "양산 준비",
        stage: "DEPLOYMENT",
        department: "HW_TEAM",
        attributes: {
          tool: ["Manufacturing System"],
          avg_time: "40h",
          is_repetitive: false,
          brain_usage: "MEDIUM",
        },
        ontology_tags: ["#양산", "#준비"],
        position: { x: 1500, y: 0 },
      },
      {
        id: "hw_7",
        type: "ACTION",
        label: "출하",
        stage: "DEPLOYMENT",
        department: "HW_TEAM",
        attributes: {
          tool: ["Warehouse System"],
          avg_time: "8h",
          is_repetitive: true,
          brain_usage: "LOW",
        },
        ontology_tags: ["#출하", "#배송"],
        position: { x: 1800, y: 0 },
        aiScore: 85,
      },
      {
        id: "hw_8",
        type: "ARTIFACT",
        label: "모니터링 및 지원",
        stage: "DEPLOYMENT",
        department: "HW_TEAM",
        attributes: {
          tool: ["Support System"],
          avg_time: "4h",
          is_repetitive: true,
          brain_usage: "MEDIUM",
        },
        ontology_tags: ["#모니터링", "#지원"],
        position: { x: 2100, y: 0 },
      },
    ],
    edges: [
      {
        id: "hw_e1",
        source: "hw_1",
        target: "hw_2",
        relation_type: "TRIGGER",
        properties: {},
      },
      {
        id: "hw_e2",
        source: "hw_2",
        target: "hw_3",
        relation_type: "REQUIRES",
        properties: {},
      },
      {
        id: "hw_e3",
        source: "hw_3",
        target: "hw_4",
        relation_type: "REQUIRES",
        properties: {},
      },
      {
        id: "hw_e4",
        source: "hw_4",
        target: "hw_5",
        relation_type: "REQUIRES",
        properties: {},
      },
      {
        id: "hw_e5",
        source: "hw_5",
        target: "hw_6",
        relation_type: "REQUIRES",
        properties: {},
      },
      {
        id: "hw_e6",
        source: "hw_6",
        target: "hw_7",
        relation_type: "REQUIRES",
        properties: {},
      },
      {
        id: "hw_e7",
        source: "hw_7",
        target: "hw_8",
        relation_type: "REQUIRES",
        properties: {},
      },
    ],
  };

  // MARKETING: "캠페인 실행 프로세스"
  const marketingTemplate: WorkflowTemplate = {
    id: "template_marketing",
    name: "캠페인 실행 프로세스",
    description: "6단계 마케팅 캠페인 실행 프로세스",
    category: "MARKETING",
    tags: ["#마케팅", "#캠페인", "#콘텐츠", "#배포"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    usageCount: 0,
    nodes: [
      {
        id: "mk_1",
        type: "TRIGGER",
        label: "캠페인 기획",
        stage: "PLANNING",
        department: "MARKETING_TEAM",
        attributes: {
          tool: ["Notion", "Google Sheets"],
          avg_time: "8h",
          is_repetitive: true,
          brain_usage: "HIGH",
        },
        ontology_tags: ["#기획", "#전략"],
        position: { x: 0, y: 0 },
      },
      {
        id: "mk_2",
        type: "ACTION",
        label: "콘텐츠 제작",
        stage: "DEVELOPMENT",
        department: "DESIGN_TEAM",
        attributes: {
          tool: ["Figma", "Photoshop", "Adobe Creative Suite"],
          avg_time: "24h",
          is_repetitive: false,
          brain_usage: "HIGH",
        },
        ontology_tags: ["#콘텐츠", "#디자인"],
        position: { x: 300, y: 0 },
      },
      {
        id: "mk_3",
        type: "DECISION",
        label: "승인 및 검토",
        stage: "DEVELOPMENT",
        department: "MARKETING_TEAM",
        attributes: {
          tool: ["Slack", "Notion"],
          avg_time: "4h",
          is_repetitive: true,
          brain_usage: "MEDIUM",
        },
        ontology_tags: ["#승인", "#검토"],
        position: { x: 600, y: 0 },
      },
      {
        id: "mk_4",
        type: "ACTION",
        label: "채널별 배포",
        stage: "DEPLOYMENT",
        department: "MARKETING_TEAM",
        attributes: {
          tool: ["Buffer", "Hootsuite", "Email Platform"],
          avg_time: "4h",
          is_repetitive: true,
          brain_usage: "LOW",
        },
        ontology_tags: ["#배포", "#채널"],
        position: { x: 900, y: 0 },
        aiScore: 90,
      },
      {
        id: "mk_5",
        type: "ACTION",
        label: "실시간 모니터링",
        stage: "DEPLOYMENT",
        department: "MARKETING_TEAM",
        attributes: {
          tool: ["Google Analytics", "Tableau"],
          avg_time: "8h",
          is_repetitive: true,
          brain_usage: "MEDIUM",
        },
        ontology_tags: ["#모니터링", "#분석"],
        position: { x: 1200, y: 0 },
      },
      {
        id: "mk_6",
        type: "ARTIFACT",
        label: "성과 분석 및 보고",
        stage: "PLANNING",
        department: "MARKETING_TEAM",
        attributes: {
          tool: ["Google Sheets", "Looker", "PowerPoint"],
          avg_time: "6h",
          is_repetitive: true,
          brain_usage: "MEDIUM",
        },
        ontology_tags: ["#분석", "#보고"],
        position: { x: 1500, y: 0 },
      },
    ],
    edges: [
      {
        id: "mk_e1",
        source: "mk_1",
        target: "mk_2",
        relation_type: "TRIGGER",
        properties: {},
      },
      {
        id: "mk_e2",
        source: "mk_2",
        target: "mk_3",
        relation_type: "REQUIRES",
        properties: {},
      },
      {
        id: "mk_e3",
        source: "mk_3",
        target: "mk_4",
        relation_type: "REQUIRES",
        properties: {},
      },
      {
        id: "mk_e4",
        source: "mk_4",
        target: "mk_5",
        relation_type: "REQUIRES",
        properties: {},
      },
      {
        id: "mk_e5",
        source: "mk_5",
        target: "mk_6",
        relation_type: "REQUIRES",
        properties: {},
      },
    ],
  };

  return [swTemplate, hwTemplate, marketingTemplate];
}

/**
 * 기본 템플릿 초기화
 */
function initializeBuiltInTemplates(): void {
  if (localStorage.getItem(TEMPLATES_INITIALIZED_KEY)) {
    return;
  }

  const templates = createBuiltInTemplates();
  templates.forEach((template) => {
    saveTemplate(template);
  });

  localStorage.setItem(TEMPLATES_INITIALIZED_KEY, "true");
}

/**
 * 템플릿 유효성 검증
 */
function validateTemplate(template: unknown): template is WorkflowTemplate {
  if (!template || typeof template !== "object") {
    return false;
  }

  const t = template as Record<string, unknown>;

  if (typeof t.id !== "string" || !t.id) return false;
  if (typeof t.name !== "string" || !t.name) return false;
  if (typeof t.category !== "string" || !t.category) return false;
  if (!Array.isArray(t.tags)) return false;
  if (!Array.isArray(t.nodes)) return false;
  if (!Array.isArray(t.edges)) return false;
  if (typeof t.createdAt !== "string") return false;
  if (typeof t.updatedAt !== "string") return false;
  if (typeof t.usageCount !== "number" || t.usageCount < 0) return false;

  return true;
}

/**
 * 템플릿 저장
 */
export function saveTemplate(template: WorkflowTemplate): void {
  try {
    const templateKey = `${STORAGE_KEY_PREFIX}${template.id}`;
    localStorage.setItem(templateKey, JSON.stringify(template));
    updateTemplatesList(template);
  } catch (error) {
    console.error("템플릿 저장 실패:", error);
    throw new Error("템플릿을 저장할 수 없습니다. 브라우저 저장 공간을 확인하세요.");
  }
}

/**
 * 템플릿 불러오기
 */
export function loadTemplate(templateId: string): WorkflowTemplate | null {
  try {
    const templateKey = `${STORAGE_KEY_PREFIX}${templateId}`;
    const data = localStorage.getItem(templateKey);

    if (!data) {
      return null;
    }

    const template = JSON.parse(data) as WorkflowTemplate;

    if (!validateTemplate(template)) {
      console.error("손상된 템플릿:", templateId);
      return null;
    }

    return template;
  } catch (error) {
    console.error("템플릿 불러오기 실패:", error);
    return null;
  }
}

/**
 * 모든 템플릿 목록 가져오기
 */
export function getTemplatesList(): WorkflowTemplate[] {
  try {
    initializeBuiltInTemplates();

    const templates: WorkflowTemplate[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(STORAGE_KEY_PREFIX)) {
        const data = localStorage.getItem(key);
        if (data) {
          const template = JSON.parse(data) as WorkflowTemplate;
          if (validateTemplate(template)) {
            templates.push(template);
          }
        }
      }
    }

    // 최근 업데이트 순으로 정렬
    templates.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    return templates;
  } catch (error) {
    console.error("템플릿 목록 불러오기 실패:", error);
    return [];
  }
}

/**
 * 템플릿 목록 업데이트
 */
function updateTemplatesList(template: WorkflowTemplate): void {
  try {
    const templates = getTemplatesList();
    const existingIndex = templates.findIndex((t) => t.id === template.id);

    if (existingIndex >= 0) {
      templates[existingIndex] = template;
    } else {
      templates.push(template);
    }

    localStorage.setItem(TEMPLATES_LIST_KEY, JSON.stringify(templates));
  } catch (error) {
    console.error("템플릿 목록 업데이트 실패:", error);
  }
}

/**
 * 템플릿 삭제
 */
export function deleteTemplate(templateId: string): void {
  try {
    const templateKey = `${STORAGE_KEY_PREFIX}${templateId}`;
    localStorage.removeItem(templateKey);

    const templates = getTemplatesList();
    const filtered = templates.filter((t) => t.id !== templateId);
    localStorage.setItem(TEMPLATES_LIST_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("템플릿 삭제 실패:", error);
  }
}

/**
 * 프로젝트로부터 템플릿 생성
 */
export function createTemplateFromProject(
  project: WorkflowProject,
  category: TemplateCategory
): WorkflowTemplate {
  const template: WorkflowTemplate = {
    id: nanoid(),
    name: project.name,
    description: project.description,
    category,
    tags: [],
    nodes: project.nodes,
    edges: project.edges,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    usageCount: 0,
  };

  return template;
}

/**
 * 템플릿을 프로젝트에 적용 (새 노드/엣지 ID로 복제)
 */
export function applyTemplateToProject(template: WorkflowTemplate): {
  nodes: ActivityNode[];
  edges: WorkflowRelationship[];
} {
  // 기존 ID를 새 ID로 매핑
  const idMap = new Map<string, string>();

  // 새 노드 생성 (ID 재생성)
  const newNodes = template.nodes.map((node) => {
    const newId = nanoid();
    idMap.set(node.id, newId);

    return {
      ...node,
      id: newId,
      status: "PENDING" as const,
      progress: 0,
      position: node.position, // 위치는 유지하되 약간 오프셋할 수도 있음
    };
  });

  // 새 엣지 생성 (source/target ID 업데이트)
  const newEdges = template.edges.map((edge) => {
    const newSourceId = idMap.get(edge.source) || edge.source;
    const newTargetId = idMap.get(edge.target) || edge.target;

    return {
      ...edge,
      id: nanoid(),
      source: newSourceId,
      target: newTargetId,
    };
  });

  // 템플릿 사용 카운트 증가
  const updated = {
    ...template,
    usageCount: template.usageCount + 1,
    updatedAt: new Date().toISOString(),
  };
  saveTemplate(updated);

  return { nodes: newNodes, edges: newEdges };
}

/**
 * 템플릿 내보내기 (JSON)
 */
export function exportTemplate(templateId: string): string | null {
  const template = loadTemplate(templateId);
  if (!template) {
    return null;
  }

  return JSON.stringify(template, null, 2);
}

/**
 * 템플릿 가져오기 (JSON)
 */
export function importTemplate(jsonData: string): WorkflowTemplate | null {
  try {
    const template = JSON.parse(jsonData) as WorkflowTemplate;

    if (!validateTemplate(template)) {
      console.error("유효하지 않은 템플릿");
      return null;
    }

    // 새 ID 할당 (충돌 방지)
    const newTemplate: WorkflowTemplate = {
      ...template,
      id: nanoid(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      usageCount: 0,
    };

    saveTemplate(newTemplate);
    return newTemplate;
  } catch (error) {
    console.error("템플릿 가져오기 실패:", error);
    return null;
  }
}

/**
 * 템플릿 검색
 */
export function searchTemplates(
  query: string,
  category?: TemplateCategory
): WorkflowTemplate[] {
  const templates = getTemplatesList();
  const lowerQuery = query.toLowerCase();

  return templates.filter((template) => {
    // 카테고리 필터
    if (category && template.category !== category) {
      return false;
    }

    // 검색어 필터
    if (query) {
      const nameMatch = template.name.toLowerCase().includes(lowerQuery);
      const descMatch = template.description?.toLowerCase().includes(lowerQuery);
      const tagMatch = template.tags.some((tag) =>
        tag.toLowerCase().includes(lowerQuery)
      );

      if (!nameMatch && !descMatch && !tagMatch) {
        return false;
      }
    }

    return true;
  });
}

/**
 * 카테고리별 템플릿 가져오기
 */
export function getTemplatesByCategory(
  category: TemplateCategory
): WorkflowTemplate[] {
  return getTemplatesList().filter((t) => t.category === category);
}

/**
 * 가장 사용된 템플릿 가져오기
 */
export function getPopularTemplates(limit: number = 5): WorkflowTemplate[] {
  return getTemplatesList()
    .sort((a, b) => b.usageCount - a.usageCount)
    .slice(0, limit);
}
