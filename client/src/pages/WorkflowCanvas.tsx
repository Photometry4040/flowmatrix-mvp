/* Design: Full-screen infinite canvas with floating toolbars
 * Features: Matrix layout, node creation, connection drawing, bottleneck visualization
 */

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import WorkflowNode from "@/components/WorkflowNode";
import NodeDetailPanel from "@/components/NodeDetailPanel";
import MatrixView from "@/components/MatrixView";
import DraggableNodeType from "@/components/DraggableNodeType";
import ProjectManager from "@/components/ProjectManager";
import FloatingPanel from "@/components/FloatingPanel";
import ResizablePanel from "@/components/ResizablePanel";
import type { ActivityNode, Department, NodeType, ProjectStage, WorkflowProject, WorkflowRelationship, NodeStatus } from "@/types/workflow";
import { updateWorkflowStatus, completeNode, startNode, calculateWorkflowProgress, checkPrerequisites, wouldCreateCycle } from "@/lib/workflowEngine";
import { saveProject, loadCurrentProject, createNewProject, autoSaveProject, getProjectsList } from "@/lib/workflowStorage";
import { toast } from "sonner";
import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  addEdge,
  useEdgesState,
  useNodesState,
  type Connection,
  type Edge,
  type Node,
} from "@xyflow/react";
import {
  AlertTriangle,
  Brain,
  Clock,
  FileText,
  GitBranch,
  Layers,
  Play,
  Plus,
  Save,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
  LayoutGrid,
  Network,
  ChevronLeft,
  ChevronRight,
  Pin,
} from "lucide-react";
import { useCallback, useState, useRef, useMemo, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { loadPanelPreferences, savePanelPreferences } from "@/lib/panelPreferences";
import type { PanelPreferences } from "@/types/workflow";

const nodeTypes = {
  workflow: WorkflowNode,
};

// Sample initial nodes based on PRD example
const initialNodes: Node<ActivityNode>[] = [
  {
    id: "node_1",
    type: "workflow",
    position: { x: 250, y: 100 },
    data: {
      id: "node_1",
      type: "TRIGGER",
      label: "프로젝트 기획 시작",
      stage: "PLANNING",
      department: "PRODUCT_TEAM",
      attributes: {
        tool: ["Notion", "Figma"],
        avg_time: "2h",
        is_repetitive: false,
        brain_usage: "HIGH",
        assignee: "김PM",
      },
      ontology_tags: ["#기획", "#요구사항"],
      position: { x: 250, y: 100 },
    },
  },
  {
    id: "node_2",
    type: "workflow",
    position: { x: 250, y: 300 },
    data: {
      id: "node_2",
      type: "ACTION",
      label: "디자인 시안 작성",
      stage: "PLANNING",
      department: "DESIGN_TEAM",
      attributes: {
        tool: ["Figma", "Adobe XD"],
        avg_time: "4h",
        is_repetitive: false,
        brain_usage: "HIGH",
      },
      ontology_tags: ["#디자인", "#UI/UX"],
      position: { x: 250, y: 300 },
    },
  },
  {
    id: "node_3",
    type: "workflow",
    position: { x: 600, y: 300 },
    data: {
      id: "node_3",
      type: "ACTION",
      label: "PCB 발주",
      stage: "DEVELOPMENT",
      department: "HW_TEAM",
      attributes: {
        tool: ["SAP", "Excel"],
        avg_time: "30m",
        is_repetitive: true,
        brain_usage: "LOW",
      },
      ontology_tags: ["#구매", "#하드웨어", "#외주"],
      position: { x: 600, y: 300 },
      isBottleneck: true,
      aiScore: 85,
    },
  },
  {
    id: "node_4",
    type: "workflow",
    position: { x: 600, y: 500 },
    data: {
      id: "node_4",
      type: "DECISION",
      label: "품질 검수",
      stage: "TESTING",
      department: "QA_TEAM",
      attributes: {
        tool: ["Jira", "TestRail"],
        avg_time: "1h",
        is_repetitive: true,
        brain_usage: "MEDIUM",
      },
      ontology_tags: ["#QA", "#테스트"],
      position: { x: 600, y: 500 },
      aiScore: 75,
    },
  },
  {
    id: "node_5",
    type: "workflow",
    position: { x: 950, y: 500 },
    data: {
      id: "node_5",
      type: "ARTIFACT",
      label: "최종 보고서",
      stage: "DEPLOYMENT",
      department: "PRODUCT_TEAM",
      attributes: {
        tool: ["Google Docs", "Notion"],
        avg_time: "1.5h",
        is_repetitive: false,
        brain_usage: "MEDIUM",
      },
      ontology_tags: ["#문서", "#보고"],
      position: { x: 950, y: 500 },
    },
  },
];

const initialEdges: Edge[] = [
  { 
    id: "e1-2", 
    source: "node_1", 
    target: "node_2",
    animated: true,
    style: { stroke: "oklch(0.65 0.25 230)", strokeWidth: 2 }
  },
  { 
    id: "e2-3", 
    source: "node_2", 
    target: "node_3",
    animated: true,
    style: { stroke: "oklch(0.65 0.25 230)", strokeWidth: 2 }
  },
  { 
    id: "e3-4", 
    source: "node_3", 
    target: "node_4",
    animated: false,
    style: { stroke: "oklch(0.55 0.25 25)", strokeWidth: 3 },
    label: "3 days lag",
    labelStyle: { fill: "oklch(0.55 0.25 25)", fontWeight: 700 }
  },
  { 
    id: "e4-5", 
    source: "node_4", 
    target: "node_5",
    animated: true,
    style: { stroke: "oklch(0.65 0.25 230)", strokeWidth: 2 }
  },
];

export default function WorkflowCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNodeType, setSelectedNodeType] = useState<NodeType>("ACTION");
  const [selectedDepartment, setSelectedDepartment] = useState<Department>("SW_TEAM");
  const [selectedStage, setSelectedStage] = useState<ProjectStage>("DEVELOPMENT");
  const [selectedNode, setSelectedNode] = useState<ActivityNode | null>(null);
  const [viewMode, setViewMode] = useState<"canvas" | "matrix">("canvas");
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [currentProject, setCurrentProject] = useState<WorkflowProject | null>(null);
  const [workflowProgress, setWorkflowProgress] = useState<number>(0);

  // Panel preferences state
  const [panelPrefs, setPanelPrefs] = useState<PanelPreferences>(() =>
    loadPanelPreferences()
  );

  // Auto-save panel preferences
  useEffect(() => {
    savePanelPreferences(panelPrefs);
  }, [panelPrefs]);

  // Panel toggle functions
  const toggleLeftPanelCollapse = useCallback(() => {
    setPanelPrefs(prev => ({
      ...prev,
      leftPanel: { ...prev.leftPanel, isCollapsed: !prev.leftPanel.isCollapsed }
    }));
  }, []);

  const toggleRightPanelCollapse = useCallback(() => {
    setPanelPrefs(prev => ({
      ...prev,
      rightPanel: { ...prev.rightPanel, isCollapsed: !prev.rightPanel.isCollapsed }
    }));
  }, []);

  // Panel floating functions
  const toggleLeftPanelFloating = useCallback(() => {
    setPanelPrefs(prev => ({
      ...prev,
      leftPanel: {
        ...prev.leftPanel,
        isFloating: !prev.leftPanel.isFloating,
        position: !prev.leftPanel.isFloating
          ? { x: Math.max(0, window.innerWidth / 2 - 128), y: 150 }
          : undefined
      }
    }));
  }, []);

  const toggleRightPanelFloating = useCallback(() => {
    setPanelPrefs(prev => ({
      ...prev,
      rightPanel: {
        ...prev.rightPanel,
        isFloating: !prev.rightPanel.isFloating,
        position: !prev.rightPanel.isFloating
          ? { x: Math.max(0, window.innerWidth / 2 - 192), y: 150 }
          : undefined
      }
    }));
  }, []);

  const updatePanelPosition = useCallback((panel: 'left' | 'right', x: number, y: number) => {
    setPanelPrefs(prev => ({
      ...prev,
      [panel === 'left' ? 'leftPanel' : 'rightPanel']: {
        ...prev[panel === 'left' ? 'leftPanel' : 'rightPanel'],
        position: { x, y }
      }
    }));
  }, []);

  const updatePanelWidth = useCallback((panel: 'left' | 'right', width: number) => {
    setPanelPrefs(prev => ({
      ...prev,
      [panel === 'left' ? 'leftPanel' : 'rightPanel']: {
        ...prev[panel === 'left' ? 'leftPanel' : 'rightPanel'],
        width
      }
    }));
  }, []);

  // 프로젝트 로드 또는 생성
  useEffect(() => {
    let project = loadCurrentProject();
    if (!project) {
      project = createNewProject("새 워크플로우", "FlowMatrix로 생성된 워크플로우입니다.");
    }
    setCurrentProject(project);
    
    // 저장된 노드와 엣지 복원
    if (project.nodes.length > 0) {
      const restoredNodes = project.nodes.map(node => ({
        id: node.id,
        type: "workflow" as const,
        position: node.position,
        data: node
      }));
      setNodes(restoredNodes);
    }
    
    if (project.edges.length > 0) {
      const restoredEdges = project.edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        animated: true,
        style: { stroke: "oklch(0.65 0.25 230)", strokeWidth: 2 }
      }));
      setEdges(restoredEdges);
    }
  }, []);

  // 자동 저장
  useEffect(() => {
    if (!currentProject) return;

    const activityNodes = nodes.map(n => n.data);
    const relationships: WorkflowRelationship[] = edges.map(e => ({
      id: e.id,
      source: e.source,
      target: e.target,
      relation_type: "REQUIRES",
      properties: {}
    }));

    autoSaveProject(currentProject.id, activityNodes, relationships);

    // 자동 저장 피드백 (2초 debounce 후 표시)
    const toastTimer = setTimeout(() => {
      toast.success("자동 저장 완료", { duration: 1500 });
    }, 2100);

    return () => clearTimeout(toastTimer);
  }, [nodes, edges, currentProject]);

  // 워크플로우 상태 업데이트
  useEffect(() => {
    const activityNodes = nodes.map(n => n.data);
    const relationships: WorkflowRelationship[] = edges.map(e => ({
      id: e.id,
      source: e.source,
      target: e.target,
      relation_type: "REQUIRES",
      properties: {}
    }));
    
    const updatedNodes = updateWorkflowStatus(activityNodes, relationships);
    const progress = calculateWorkflowProgress(updatedNodes);
    setWorkflowProgress(progress);
    
    // 노드 상태 반영
    setNodes(prevNodes => prevNodes.map(n => {
      const updated = updatedNodes.find(un => un.id === n.id);
      return updated ? { ...n, data: updated } : n;
    }));
  }, [edges]); // edges가 변경될 때만 재계산

  const onConnect = useCallback(
    (params: Connection) => {
      // Validate connection
      if (!params.source || !params.target) {
        toast.error('연결 실패', {
          description: '유효하지 않은 노드 연결입니다.'
        });
        return;
      }

      // Check for circular dependency
      const workflowEdges: WorkflowRelationship[] = edges.map(e => ({
        id: e.id,
        source: e.source,
        target: e.target,
        type: 'DEPENDS_ON' as const
      }));

      if (wouldCreateCycle({ source: params.source, target: params.target }, workflowEdges)) {
        const sourceNode = nodes.find(n => n.id === params.source);
        const targetNode = nodes.find(n => n.id === params.target);
        toast.error('순환 의존성 감지', {
          description: `"${sourceNode?.data.label ?? params.source}"에서 "${targetNode?.data.label ?? params.target}"로의 연결은 순환 구조를 만듭니다.`
        });
        return;
      }

      const newEdge = {
        ...params,
        animated: true,
        style: { stroke: "oklch(0.65 0.25 230)", strokeWidth: 2 },
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [edges, nodes, setEdges]
  );

  const addNode = useCallback(() => {
    const newNode: Node<ActivityNode> = {
      id: `node_${Date.now()}`,
      type: "workflow",
      position: { x: Math.random() * 500 + 100, y: Math.random() * 500 + 100 },
      data: {
        id: `node_${Date.now()}`,
        type: selectedNodeType,
        label: "새 작업",
        stage: selectedStage,
        department: selectedDepartment,
        attributes: {
          tool: [],
          avg_time: "30m",
          is_repetitive: false,
          brain_usage: "MEDIUM",
        },
        ontology_tags: [],
        position: { x: 0, y: 0 },
      },
    };
    setNodes((nds) => [...nds, newNode]);
  }, [selectedNodeType, selectedDepartment, selectedStage, setNodes]);

  const bottleneckCount = nodes.filter((n) => n.data.isBottleneck).length;
  const aiReplaceableCount = nodes.filter((n) => (n.data.aiScore || 0) > 70).length;

  // Collect all unique tags from all nodes
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    nodes.forEach((node) => {
      node.data.ontology_tags.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet);
  }, [nodes]);

  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node<ActivityNode>) => {
    setSelectedNode(node.data);
  }, []);

  const handleNodeUpdate = useCallback((updatedNode: ActivityNode) => {
    setNodes((nds) => 
      nds.map((n) => 
        n.id === updatedNode.id 
          ? { ...n, data: updatedNode }
          : n
      )
    );
    setSelectedNode(updatedNode);
  }, [setNodes]);

  // 노드 삭제 핸들러
  const handleNodesDelete = useCallback((nodesToDelete: Node<ActivityNode>[]) => {
    const nodeIds = nodesToDelete.map(n => n.id);
    
    // 선택된 노드가 삭제되면 패널 닫기
    if (selectedNode && nodeIds.includes(selectedNode.id)) {
      setSelectedNode(null);
    }
    
    console.log(`❌ ${nodesToDelete.length}개 노드 삭제: ${nodeIds.join(", ")}`);
  }, [selectedNode]);

  // 엣지 삭제 핸들러
  const handleEdgesDelete = useCallback((edgesToDelete: Edge[]) => {
    const edgeIds = edgesToDelete.map(e => e.id);
    console.log(`❌ ${edgesToDelete.length}개 엣지 삭제: ${edgeIds.join(", ")}`);
  }, []);

  // Delete 키 핸들러
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === "Delete" || event.key === "Backspace") {
      if (selectedNode) {
        // 선택된 노드 삭제
        setNodes((nds) => nds.filter(n => n.id !== selectedNode.id));
        setEdges((eds) => eds.filter(e => 
          e.source !== selectedNode.id && e.target !== selectedNode.id
        ));
        setSelectedNode(null);
        console.log(`❌ 노드 삭제: ${selectedNode.label}`);
      }
    }
  }, [selectedNode, setNodes, setEdges]);

  // Delete 키 이벤트 리스너 등록
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  // 노드 액션 핸들러
  const handleStartNode = useCallback((nodeId: string) => {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === nodeId
          ? {
              ...n,
              data: {
                ...n.data,
                status: "IN_PROGRESS" as const,
                progress: 0,
              },
            }
          : n
      )
    );
    console.log(`▶️ 작업 시작: ${nodeId}`);
  }, [setNodes]);

  const handleCompleteNode = useCallback((nodeId: string) => {
    try {
      // Convert React Flow nodes/edges to workflow format
      const activityNodes: ActivityNode[] = nodes.map(n => n.data);
      const workflowEdges: WorkflowRelationship[] = edges.map(e => ({
        id: e.id,
        source: e.source,
        target: e.target,
        type: 'DEPENDS_ON' as const
      }));

      // Validate and complete node
      const updatedActivityNodes = completeNode(nodeId, activityNodes, workflowEdges);

      // Update React Flow nodes
      setNodes((nds) =>
        nds.map((n) => {
          const updatedData = updatedActivityNodes.find(an => an.id === n.id);
          return updatedData ? { ...n, data: updatedData } : n;
        })
      );

      console.log(`✅ 작업 완료: ${nodeId}`);
    } catch (error) {
      // Show error toast if prerequisites aren't met
      if (error instanceof Error) {
        toast.error('작업을 완료할 수 없습니다', {
          description: error.message
        });
      }
      console.error('작업 완료 실패:', error);
    }
  }, [nodes, edges, setNodes]);

  const handleDuplicateNode = useCallback((node: ActivityNode) => {
    const newId = `node_${Date.now()}`;
    const newNode: Node<ActivityNode> = {
      id: newId,
      type: "workflow",
      position: { x: node.position.x + 50, y: node.position.y + 50 },
      data: {
        ...node,
        id: newId,
        label: `${node.label} (복사)`,
        position: { x: node.position.x + 50, y: node.position.y + 50 },
      },
    };
    setNodes((nds) => [...nds, newNode]);
    console.log(`📋 노드 복제: ${node.label}`);
  }, [setNodes]);

  const handleDeleteNode = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
    if (selectedNode?.id === nodeId) {
      setSelectedNode(null);
    }
    console.log(`🗑️ 노드 삭제: ${nodeId}`);
  }, [setNodes, setEdges, selectedNode]);

  const handleChangeStatus = useCallback((nodeId: string, status: NodeStatus) => {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === nodeId
          ? {
              ...n,
              data: {
                ...n.data,
                status,
                progress: status === "COMPLETED" ? 100 : status === "IN_PROGRESS" ? 50 : 0,
              },
            }
          : n
      )
    );
    console.log(`🔄 상태 변경: ${nodeId} → ${status}`);
  }, [setNodes]);

  // 노드에 액션 핸들러 주입
  const nodesWithHandlers = useMemo(
    () =>
      nodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          onStartNode: handleStartNode,
          onCompleteNode: handleCompleteNode,
          onDuplicateNode: handleDuplicateNode,
          onDeleteNode: handleDeleteNode,
          onChangeStatus: handleChangeStatus,
        },
      })),
    [nodes, handleStartNode, handleCompleteNode, handleDuplicateNode, handleDeleteNode, handleChangeStatus]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData("application/reactflow") as NodeType;
      if (!type || !reactFlowInstance) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: Node<ActivityNode> = {
        id: `node_${Date.now()}`,
        type: "workflow",
        position,
        data: {
          id: `node_${Date.now()}`,
          type,
          label: "새 작업",
          stage: selectedStage,
          department: selectedDepartment,
          attributes: {
            tool: [],
            avg_time: "30m",
            is_repetitive: false,
            brain_usage: "MEDIUM",
          },
          ontology_tags: [],
          position,
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, selectedDepartment, selectedStage, setNodes]
  );

  return (
    <div className="h-screen w-screen flex flex-col bg-background">
      {/* Top Toolbar */}
      <header className="floating-toolbar mx-4 mt-4 px-4 py-3 flex items-center justify-between gap-4 z-20">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Layers className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-display font-bold text-foreground">FlowMatrix</h1>
          </div>
          <Separator orientation="vertical" className="h-6" />
          <span className="text-sm text-muted-foreground">워크플로우 매핑 플랫폼</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 brutal-card px-2 py-1 bg-card/50">
            <Button
              variant={viewMode === "canvas" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("canvas")}
              className="gap-2 h-8"
              data-testid="view-toggle-canvas"
            >
              <Network className="w-4 h-4" />
              캔버스
            </Button>
            <Button
              variant={viewMode === "matrix" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("matrix")}
              className="gap-2 h-8"
              data-testid="view-toggle-matrix"
            >
              <LayoutGrid className="w-4 h-4" />
              매트릭스
            </Button>
          </div>

          <Card className="px-3 py-2 flex items-center gap-4 bg-card/50" data-testid="workflow-statistics">
            <div className="flex items-center gap-2" data-testid="stat-progress">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-sm font-mono text-foreground">{workflowProgress}%</span>
              <span className="text-xs text-muted-foreground">완료</span>
            </div>
            <Separator orientation="vertical" className="h-4" />
            <div className="flex items-center gap-2" data-testid="stat-bottleneck">
              <TrendingUp className="w-4 h-4 text-destructive" />
              <span className="text-sm font-mono text-foreground">{bottleneckCount}</span>
              <span className="text-xs text-muted-foreground">병목</span>
            </div>
            <Separator orientation="vertical" className="h-4" />
            <div className="flex items-center gap-2" data-testid="stat-ai-replaceable">
              <Sparkles className="w-4 h-4 text-success" />
              <span className="text-sm font-mono text-foreground">{aiReplaceableCount}</span>
              <span className="text-xs text-muted-foreground">AI 대체 가능</span>
            </div>
          </Card>

          <ProjectManager onProjectLoad={(project) => {
            setCurrentProject(project);
            
            // 프로젝트 노드와 엣지 복원
            const restoredNodes = project.nodes.map(node => ({
              id: node.id,
              type: "workflow" as const,
              position: node.position,
              data: node
            }));
            setNodes(restoredNodes);
            
            const restoredEdges = project.edges.map(edge => ({
              id: edge.id,
              source: edge.source,
              target: edge.target,
              animated: true,
              style: { stroke: "oklch(0.65 0.25 230)", strokeWidth: 2 }
            }));
            setEdges(restoredEdges);
          }} />
          <Button variant="outline" size="sm" className="gap-2">
            <Users className="w-4 h-4" />
            협업
          </Button>
          <Button 
            size="sm" 
            className="gap-2"
            onClick={() => {
              if (currentProject) {
                const activityNodes = nodes.map(n => n.data);
                const relationships: WorkflowRelationship[] = edges.map(e => ({
                  id: e.id,
                  source: e.source,
                  target: e.target,
                  relation_type: "REQUIRES",
                  properties: {}
                }));
                saveProject({
                  ...currentProject,
                  nodes: activityNodes,
                  edges: relationships
                });
                alert(`✅ ${currentProject.name} 저장 완료!`);
              }
            }}
          >
            <Save className="w-4 h-4" />
            저장
          </Button>
        </div>
      </header>

      {/* Left Sidebar - Node Creation Panel */}
      <AnimatePresence mode="wait">
        {!panelPrefs.leftPanel.isCollapsed && (
          panelPrefs.leftPanel.isFloating ? (
            <FloatingPanel
              isFloating={true}
              position={panelPrefs.leftPanel.position || { x: 100, y: 150 }}
              onPositionChange={(x, y) => updatePanelPosition('left', x, y)}
              onToggleFloating={toggleLeftPanelFloating}
              width={panelPrefs.leftPanel.width}
            >
              <div className="floating-toolbar p-4 space-y-4 max-h-[70vh] overflow-y-auto">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-display font-bold text-foreground">노드 추가</h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleLeftPanelCollapse}
                      className="h-6 w-6"
                      title="패널 접기"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">드래그하여 캔버스에 추가</p>

                  <div className="space-y-2 mb-4">
                    <DraggableNodeType
                      type="TRIGGER"
                      label="Trigger (시작)"
                      icon={Play}
                      colorClass="border-success text-success"
                    />
                    <DraggableNodeType
                      type="ACTION"
                      label="Action (행동)"
                      icon={Zap}
                      colorClass="border-primary text-primary"
                    />
                    <DraggableNodeType
                      type="DECISION"
                      label="Decision (판단)"
                      icon={GitBranch}
                      colorClass="border-accent text-accent"
                    />
                    <DraggableNodeType
                      type="ARTIFACT"
                      label="Artifact (산출물)"
                      icon={FileText}
                      colorClass="border-chart-4 text-chart-4"
                    />
                  </div>

                  <Separator className="my-4" />

                  <h3 className="text-sm font-display font-bold mb-3 text-foreground">또는 설정 후 추가</h3>

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1.5 block">노드 타입</label>
                      <Select value={selectedNodeType} onValueChange={(v) => setSelectedNodeType(v as NodeType)}>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="TRIGGER">
                            <div className="flex items-center gap-2">
                              <Play className="w-4 h-4" />
                              <span>Trigger (시작)</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="ACTION">
                            <div className="flex items-center gap-2">
                              <Zap className="w-4 h-4" />
                              <span>Action (행동)</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="DECISION">
                            <div className="flex items-center gap-2">
                              <GitBranch className="w-4 h-4" />
                              <span>Decision (판단)</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="ARTIFACT">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4" />
                              <span>Artifact (산출물)</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-xs text-muted-foreground mb-1.5 block">부서</label>
                      <Select value={selectedDepartment} onValueChange={(v) => setSelectedDepartment(v as Department)}>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="HW_TEAM">하드웨어팀</SelectItem>
                          <SelectItem value="SW_TEAM">소프트웨어팀</SelectItem>
                          <SelectItem value="DESIGN_TEAM">디자인팀</SelectItem>
                          <SelectItem value="QA_TEAM">QA팀</SelectItem>
                          <SelectItem value="PRODUCT_TEAM">제품팀</SelectItem>
                          <SelectItem value="MARKETING_TEAM">마케팅팀</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-xs text-muted-foreground mb-1.5 block">프로젝트 단계</label>
                      <Select value={selectedStage} onValueChange={(v) => setSelectedStage(v as ProjectStage)}>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PLANNING">기획</SelectItem>
                          <SelectItem value="DEVELOPMENT">개발</SelectItem>
                          <SelectItem value="TESTING">테스트</SelectItem>
                          <SelectItem value="DEPLOYMENT">배포</SelectItem>
                          <SelectItem value="MAINTENANCE">유지보수</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button onClick={addNode} className="w-full gap-2" data-testid="add-node-button">
                      <Plus className="w-4 h-4" />
                      노드 추가
                    </Button>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-sm font-display font-bold mb-2 text-foreground">범례</h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-sm border-2 border-success bg-success/20" />
                      <span className="text-muted-foreground">Trigger (시작)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-sm border-2 border-primary bg-primary/20" />
                      <span className="text-muted-foreground">Action (행동)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-sm border-2 border-accent bg-accent/20" />
                      <span className="text-muted-foreground">Decision (판단)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-sm border-2 border-chart-4 bg-chart-4/20" />
                      <span className="text-muted-foreground">Artifact (산출물)</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-sm border-2 border-destructive bg-destructive/20 pulse-bottleneck" />
                      <span className="text-muted-foreground">병목 구간</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-3 h-3 text-success" />
                      <span className="text-muted-foreground">AI 대체 가능</span>
                    </div>
                  </div>
                </div>
              </div>
            </FloatingPanel>
          ) : (
            <motion.div
              initial={{ x: -280, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -280, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="absolute left-4 top-32 md:top-36 z-10 floating-toolbar p-4 w-64 space-y-4 max-h-[calc(100vh-9rem)] md:max-h-[calc(100vh-10rem)] overflow-y-auto"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-display font-bold text-foreground">노드 추가</h3>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleLeftPanelFloating}
                      className="h-6 w-6"
                      title="플로팅 모드"
                    >
                      <Pin className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleLeftPanelCollapse}
                      className="h-6 w-6"
                      title="패널 접기"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mb-3">드래그하여 캔버스에 추가</p>
          
          <div className="space-y-2 mb-4">
            <DraggableNodeType
              type="TRIGGER"
              label="Trigger (시작)"
              icon={Play}
              colorClass="border-success text-success"
            />
            <DraggableNodeType
              type="ACTION"
              label="Action (행동)"
              icon={Zap}
              colorClass="border-primary text-primary"
            />
            <DraggableNodeType
              type="DECISION"
              label="Decision (판단)"
              icon={GitBranch}
              colorClass="border-accent text-accent"
            />
            <DraggableNodeType
              type="ARTIFACT"
              label="Artifact (산출물)"
              icon={FileText}
              colorClass="border-chart-4 text-chart-4"
            />
          </div>

          <Separator className="my-4" />

          <h3 className="text-sm font-display font-bold mb-3 text-foreground">또는 설정 후 추가</h3>
          
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">노드 타입</label>
              <Select value={selectedNodeType} onValueChange={(v) => setSelectedNodeType(v as NodeType)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TRIGGER">
                    <div className="flex items-center gap-2">
                      <Play className="w-4 h-4" />
                      <span>Trigger (시작)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="ACTION">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      <span>Action (행동)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="DECISION">
                    <div className="flex items-center gap-2">
                      <GitBranch className="w-4 h-4" />
                      <span>Decision (판단)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="ARTIFACT">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      <span>Artifact (산출물)</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">부서</label>
              <Select value={selectedDepartment} onValueChange={(v) => setSelectedDepartment(v as Department)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HW_TEAM">하드웨어팀</SelectItem>
                  <SelectItem value="SW_TEAM">소프트웨어팀</SelectItem>
                  <SelectItem value="DESIGN_TEAM">디자인팀</SelectItem>
                  <SelectItem value="QA_TEAM">QA팀</SelectItem>
                  <SelectItem value="PRODUCT_TEAM">제품팀</SelectItem>
                  <SelectItem value="MARKETING_TEAM">마케팅팀</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">프로젝트 단계</label>
              <Select value={selectedStage} onValueChange={(v) => setSelectedStage(v as ProjectStage)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PLANNING">기획</SelectItem>
                  <SelectItem value="DEVELOPMENT">개발</SelectItem>
                  <SelectItem value="TESTING">테스트</SelectItem>
                  <SelectItem value="DEPLOYMENT">배포</SelectItem>
                  <SelectItem value="MAINTENANCE">유지보수</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={addNode} className="w-full gap-2" data-testid="add-node-button">
              <Plus className="w-4 h-4" />
              노드 추가
            </Button>
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="text-sm font-display font-bold mb-2 text-foreground">범례</h3>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm border-2 border-success bg-success/20" />
              <span className="text-muted-foreground">Trigger (시작)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm border-2 border-primary bg-primary/20" />
              <span className="text-muted-foreground">Action (행동)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm border-2 border-accent bg-accent/20" />
              <span className="text-muted-foreground">Decision (판단)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm border-2 border-chart-4 bg-chart-4/20" />
              <span className="text-muted-foreground">Artifact (산출물)</span>
            </div>
            <Separator className="my-2" />
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm border-2 border-destructive bg-destructive/20 pulse-bottleneck" />
              <span className="text-muted-foreground">병목 구간</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-success" />
              <span className="text-muted-foreground">AI 대체 가능</span>
            </div>
          </div>
        </div>
          </motion.div>
          )
        )}
      </AnimatePresence>

      {/* Collapsed Left Panel Toggle Button */}
      {panelPrefs.leftPanel.isCollapsed && (
        <motion.div
          initial={{ x: -40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="absolute left-4 top-32 md:top-36 z-10"
        >
          <Button
            variant="outline"
            size="icon"
            onClick={toggleLeftPanelCollapse}
            className="brutal-card shadow-lg"
            title="노드 패널 열기"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </motion.div>
      )}

      {/* Node Detail Panel */}
      {selectedNode && !panelPrefs.rightPanel.isCollapsed && panelPrefs.rightPanel.isFloating ? (
        <FloatingPanel
          isFloating={true}
          position={panelPrefs.rightPanel.position || { x: 100, y: 150 }}
          onPositionChange={(x, y) => updatePanelPosition('right', x, y)}
          onToggleFloating={toggleRightPanelFloating}
          width={panelPrefs.rightPanel.width}
        >
          <NodeDetailPanel
            node={selectedNode}
            onClose={() => setSelectedNode(null)}
            onUpdate={handleNodeUpdate}
            onDelete={handleDeleteNode}
            allTags={allTags}
            isCollapsed={false}
            onToggleCollapse={toggleRightPanelCollapse}
            isFloating={true}
            onToggleFloating={toggleRightPanelFloating}
          />
        </FloatingPanel>
      ) : (
        <ResizablePanel
          isResizable={selectedNode !== null && !panelPrefs.rightPanel.isCollapsed}
          width={panelPrefs.rightPanel.width}
          onWidthChange={(width) => updatePanelWidth('right', width)}
          minWidth={300}
          maxWidth={600}
          side="right"
        >
          <NodeDetailPanel
            node={selectedNode}
            onClose={() => setSelectedNode(null)}
            onUpdate={handleNodeUpdate}
            onDelete={handleDeleteNode}
            allTags={allTags}
            isCollapsed={panelPrefs.rightPanel.isCollapsed}
            onToggleCollapse={toggleRightPanelCollapse}
            isFloating={false}
            onToggleFloating={toggleRightPanelFloating}
          />
        </ResizablePanel>
      )}

      {/* Main Content Area */}
      <div
        ref={reactFlowWrapper}
        className="flex-1 grid-background"
        onDrop={onDrop}
        onDragOver={onDragOver}
        data-testid="workflow-canvas"
      >
        {viewMode === "canvas" ? (
          <ReactFlow
            nodes={nodesWithHandlers}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onNodesDelete={handleNodesDelete}
            onEdgesDelete={handleEdgesDelete}
            onInit={setReactFlowInstance}
            nodeTypes={nodeTypes}
            fitView
            deleteKeyCode="Delete"
            className="bg-transparent"
            defaultEdgeOptions={{
              animated: true,
              style: { stroke: "oklch(0.65 0.25 230)", strokeWidth: 2 },
            }}
          >
          <Background 
            variant={BackgroundVariant.Dots} 
            gap={40} 
            size={1}
            color="oklch(0.15 0.01 260)"
          />
          <Controls 
            className="floating-toolbar"
            showInteractive={false}
          />
          <MiniMap 
            className="floating-toolbar !bg-card/90"
            nodeColor={(node) => {
              if (node.data.isBottleneck) return "oklch(0.55 0.25 25)";
              if ((node.data.aiScore || 0) > 70) return "oklch(0.75 0.25 130)";
              return "oklch(0.65 0.25 230)";
            }}
            maskColor="oklch(0.08 0.01 260 / 0.8)"
          />
          </ReactFlow>
        ) : (
          <MatrixView 
            nodes={nodes.map(n => n.data)}
            onNodeClick={(node) => setSelectedNode(node)}
          />
        )}
      </div>
    </div>
  );
}
