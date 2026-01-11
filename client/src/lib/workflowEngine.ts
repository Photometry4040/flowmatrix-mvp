/**
 * Workflow Engine - 노드 연결 로직 및 데이터 플로우 관리
 * 
 * 기능:
 * - 선행 작업 완료 추적
 * - 후행 작업 활성화 조건 검증
 * - 노드 상태 자동 업데이트
 * - 실행 가능한 노드 탐지
 */

import type { ActivityNode, WorkflowRelationship, NodeStatus } from "@/types/workflow";

/**
 * 노드의 모든 선행 작업이 완료되었는지 확인
 */
export function areAllPredecessorsCompleted(
  nodeId: string,
  nodes: ActivityNode[],
  edges: WorkflowRelationship[]
): boolean {
  // 해당 노드로 들어오는 모든 엣지 찾기
  const incomingEdges = edges.filter(edge => edge.target === nodeId);
  
  if (incomingEdges.length === 0) {
    // 선행 작업이 없으면 항상 준비 상태
    return true;
  }
  
  // 모든 선행 노드가 완료 상태인지 확인
  return incomingEdges.every(edge => {
    const sourceNode = nodes.find(n => n.id === edge.source);
    return sourceNode?.status === "COMPLETED";
  });
}

/**
 * 노드의 다음 상태를 계산
 */
export function calculateNextStatus(
  node: ActivityNode,
  nodes: ActivityNode[],
  edges: WorkflowRelationship[]
): NodeStatus {
  // 이미 완료된 노드는 상태 유지
  if (node.status === "COMPLETED") {
    return "COMPLETED";
  }
  
  // 진행 중인 노드는 상태 유지
  if (node.status === "IN_PROGRESS") {
    return "IN_PROGRESS";
  }
  
  // 선행 작업 완료 여부 확인
  const predecessorsCompleted = areAllPredecessorsCompleted(node.id, nodes, edges);
  
  if (!predecessorsCompleted) {
    return "BLOCKED";
  }
  
  // TRIGGER 타입은 항상 READY
  if (node.type === "TRIGGER") {
    return "READY";
  }
  
  return "READY";
}

/**
 * 전체 워크플로우의 노드 상태를 업데이트
 */
export function updateWorkflowStatus(
  nodes: ActivityNode[],
  edges: WorkflowRelationship[]
): ActivityNode[] {
  return nodes.map(node => ({
    ...node,
    status: calculateNextStatus(node, nodes, edges)
  }));
}

/**
 * 노드의 선행 작업 완료 여부 확인
 */
export function checkPrerequisites(
  nodeId: string,
  nodes: ActivityNode[],
  edges: WorkflowRelationship[]
): { canComplete: boolean; incompletePrerequisites: string[] } {
  // 선행 작업 찾기 (target이 현재 노드인 엣지의 source들)
  const predecessorIds = edges
    .filter(edge => edge.target === nodeId)
    .map(edge => edge.source);

  if (predecessorIds.length === 0) {
    // 선행 작업이 없으면 바로 완료 가능
    return { canComplete: true, incompletePrerequisites: [] };
  }

  // 완료되지 않은 선행 작업 찾기
  const incompletePrerequisites = predecessorIds
    .map(predId => nodes.find(n => n.id === predId))
    .filter(pred => pred && pred.status !== "COMPLETED")
    .map(pred => pred?.label ?? 'Unknown');

  return {
    canComplete: incompletePrerequisites.length === 0,
    incompletePrerequisites
  };
}

/**
 * 노드를 완료 상태로 변경하고 후행 작업 활성화
 * @throws Error 선행 작업이 완료되지 않은 경우
 */
export function completeNode(
  nodeId: string,
  nodes: ActivityNode[],
  edges: WorkflowRelationship[]
): ActivityNode[] {
  // 선행 작업 완료 여부 확인
  const { canComplete, incompletePrerequisites } = checkPrerequisites(nodeId, nodes, edges);

  if (!canComplete) {
    const currentNode = nodes.find(n => n.id === nodeId);
    const nodeName = currentNode?.label ?? nodeId;
    throw new Error(
      `"${nodeName}" 노드를 완료할 수 없습니다. 선행 작업을 먼저 완료하세요: ${incompletePrerequisites.join(', ')}`
    );
  }

  const updatedNodes = nodes.map(node => {
    if (node.id === nodeId) {
      return {
        ...node,
        status: "COMPLETED" as NodeStatus,
        completedAt: new Date().toISOString(),
        progress: 100
      };
    }
    return node;
  });

  // 전체 워크플로우 상태 재계산
  return updateWorkflowStatus(updatedNodes, edges);
}

/**
 * 노드를 진행 중 상태로 변경
 */
export function startNode(
  nodeId: string,
  nodes: ActivityNode[]
): ActivityNode[] {
  return nodes.map(node => {
    if (node.id === nodeId && node.status === "READY") {
      return {
        ...node,
        status: "IN_PROGRESS" as NodeStatus,
        startedAt: new Date().toISOString(),
        progress: 0
      };
    }
    return node;
  });
}

/**
 * 노드의 진행률 업데이트
 */
export function updateNodeProgress(
  nodeId: string,
  progress: number,
  nodes: ActivityNode[]
): ActivityNode[] {
  return nodes.map(node => {
    if (node.id === nodeId) {
      return {
        ...node,
        progress: Math.min(100, Math.max(0, progress))
      };
    }
    return node;
  });
}

/**
 * 실행 가능한 노드 목록 반환 (READY 상태)
 */
export function getExecutableNodes(nodes: ActivityNode[]): ActivityNode[] {
  return nodes.filter(node => node.status === "READY");
}

/**
 * 차단된 노드 목록 반환 (BLOCKED 상태)
 */
export function getBlockedNodes(nodes: ActivityNode[]): ActivityNode[] {
  return nodes.filter(node => node.status === "BLOCKED");
}

/**
 * 워크플로우 완료율 계산
 */
export function calculateWorkflowProgress(nodes: ActivityNode[]): number {
  if (nodes.length === 0) return 0;
  
  const completedCount = nodes.filter(n => n.status === "COMPLETED").length;
  return Math.round((completedCount / nodes.length) * 100);
}

/**
 * 크리티컬 패스 탐지 (가장 긴 경로)
 */
export function findCriticalPath(
  nodes: ActivityNode[],
  edges: WorkflowRelationship[]
): string[] {
  // 간단한 위상 정렬 기반 크리티컬 패스 탐지
  // (실제로는 더 복잡한 알고리즘 필요)
  
  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  const visited = new Set<string>();
  const path: string[] = [];
  
  function dfs(nodeId: string) {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);
    path.push(nodeId);
    
    const outgoingEdges = edges.filter(e => e.source === nodeId);
    for (const edge of outgoingEdges) {
      dfs(edge.target);
    }
  }
  
  // TRIGGER 노드부터 시작
  const triggerNodes = nodes.filter(n => n.type === "TRIGGER");
  triggerNodes.forEach(node => dfs(node.id));
  
  return path;
}

/**
 * 새 엣지 추가 시 순환 의존성 발생 여부 확인
 */
export function wouldCreateCycle(
  newEdge: { source: string; target: string },
  existingEdges: WorkflowRelationship[]
): boolean {
  // 새 엣지를 포함한 임시 엣지 목록 생성
  const testEdges = [...existingEdges, {
    id: 'temp',
    source: newEdge.source,
    target: newEdge.target,
    type: 'DEPENDS_ON' as const
  }];

  // DFS로 순환 감지
  function hasCycle(nodeId: string, visited: Set<string>, recStack: Set<string>): boolean {
    visited.add(nodeId);
    recStack.add(nodeId);

    const outgoingEdges = testEdges.filter(e => e.source === nodeId);
    for (const edge of outgoingEdges) {
      if (!visited.has(edge.target)) {
        if (hasCycle(edge.target, visited, recStack)) {
          return true;
        }
      } else if (recStack.has(edge.target)) {
        return true;
      }
    }

    recStack.delete(nodeId);
    return false;
  }

  const visited = new Set<string>();
  const recStack = new Set<string>();

  // 새 엣지의 source에서 시작하여 순환 검사
  return hasCycle(newEdge.source, visited, recStack);
}

/**
 * 노드 간 의존성 검증
 */
export function validateDependencies(
  nodes: ActivityNode[],
  edges: WorkflowRelationship[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const nodeIds = new Set(nodes.map(n => n.id));

  // 순환 의존성 검사
  function hasCycle(nodeId: string, visited: Set<string>, recStack: Set<string>): boolean {
    visited.add(nodeId);
    recStack.add(nodeId);

    const outgoingEdges = edges.filter(e => e.source === nodeId);
    for (const edge of outgoingEdges) {
      if (!visited.has(edge.target)) {
        if (hasCycle(edge.target, visited, recStack)) {
          return true;
        }
      } else if (recStack.has(edge.target)) {
        return true;
      }
    }

    recStack.delete(nodeId);
    return false;
  }

  const visited = new Set<string>();
  const recStack = new Set<string>();

  for (const node of nodes) {
    if (!visited.has(node.id)) {
      if (hasCycle(node.id, visited, recStack)) {
        errors.push(`순환 의존성 감지: 노드 ${node.id}를 포함하는 순환 구조가 있습니다.`);
      }
    }
  }

  // 존재하지 않는 노드 참조 검사
  for (const edge of edges) {
    if (!nodeIds.has(edge.source)) {
      errors.push(`엣지 ${edge.id}: 소스 노드 ${edge.source}가 존재하지 않습니다.`);
    }
    if (!nodeIds.has(edge.target)) {
      errors.push(`엣지 ${edge.id}: 타겟 노드 ${edge.target}가 존재하지 않습니다.`);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
