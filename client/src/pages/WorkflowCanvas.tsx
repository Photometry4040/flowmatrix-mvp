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
import type { ActivityNode, Department, NodeType, ProjectStage } from "@/types/workflow";
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
} from "lucide-react";
import { useCallback, useState, useRef, useMemo } from "react";

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

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge = {
        ...params,
        animated: true,
        style: { stroke: "oklch(0.65 0.25 230)", strokeWidth: 2 },
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges]
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
      <header className="floating-toolbar mx-4 mt-4 px-4 py-3 flex items-center justify-between gap-4 z-10">
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
            >
              <Network className="w-4 h-4" />
              캔버스
            </Button>
            <Button
              variant={viewMode === "matrix" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("matrix")}
              className="gap-2 h-8"
            >
              <LayoutGrid className="w-4 h-4" />
              매트릭스
            </Button>
          </div>

          <Card className="px-3 py-2 flex items-center gap-4 bg-card/50">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-destructive" />
              <span className="text-sm font-mono text-foreground">{bottleneckCount}</span>
              <span className="text-xs text-muted-foreground">병목</span>
            </div>
            <Separator orientation="vertical" className="h-4" />
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-success" />
              <span className="text-sm font-mono text-foreground">{aiReplaceableCount}</span>
              <span className="text-xs text-muted-foreground">AI 대체 가능</span>
            </div>
          </Card>

          <Button variant="outline" size="sm" className="gap-2">
            <Users className="w-4 h-4" />
            협업
          </Button>
          <Button size="sm" className="gap-2">
            <Save className="w-4 h-4" />
            저장
          </Button>
        </div>
      </header>

      {/* Left Sidebar - Node Creation Panel */}
      <div className="absolute left-4 top-28 z-10 floating-toolbar p-4 w-64 space-y-4">
        <div>
          <h3 className="text-sm font-display font-bold mb-3 text-foreground">노드 추가</h3>
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

            <Button onClick={addNode} className="w-full gap-2">
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

      {/* Node Detail Panel */}
      <NodeDetailPanel 
        node={selectedNode}
        onClose={() => setSelectedNode(null)}
        onUpdate={handleNodeUpdate}
        allTags={allTags}
      />

      {/* Main Content Area */}
      <div 
        ref={reactFlowWrapper}
        className="flex-1 grid-background"
        onDrop={onDrop}
        onDragOver={onDragOver}
      >
        {viewMode === "canvas" ? (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onInit={setReactFlowInstance}
            nodeTypes={nodeTypes}
            fitView
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
