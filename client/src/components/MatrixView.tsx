/* Design: Department × Project Stage matrix layout with drag-and-drop
 * Features: Grid-based swimlanes, cell-based node organization, node repositioning
 */

import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import MatrixCell from "@/components/MatrixCell";
import DraggableMatrixNode from "@/components/DraggableMatrixNode";
import type { ActivityNode, DepartmentConfig, StageConfig } from "@/types/workflow";

interface MatrixViewProps {
  nodes: ActivityNode[];
  departments: DepartmentConfig[];
  stages: StageConfig[];
  onNodeClick: (node: ActivityNode) => void;
  onNodeMove?: (nodeId: string, newDept: string, newStage: string) => void;
}

export default function MatrixView({
  nodes,
  departments,
  stages,
  onNodeClick,
  onNodeMove,
}: MatrixViewProps) {
  const getNodesForCell = (deptId: string, stageId: string) => {
    return nodes.filter(
      (node) => node.department === deptId && node.stage === stageId
    );
  };

  // 동적 그리드 열 계산 (부서 + 단계의 수에 따라)
  const gridCols = `200px repeat(${stages.length}, minmax(250px, 1fr))`;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      distance: 8,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    console.log("🔍 [Drag End]", {
      activeId: active?.id,
      activeData: active?.data,
      overId: over?.id,
      overData: over?.data,
    });

    // 드래그 대상이 노드이고 드롭 대상이 셀인 경우
    if (
      active?.data?.type === "node" &&
      over?.data?.type === "cell"
    ) {
      const nodeId = active.data.nodeId as string;
      const newDept = over.data.deptId as string;
      const newStage = over.data.stageId as string;

      console.log("✅ [Valid Drop]", { nodeId, newDept, newStage });

      // 같은 셀에 드롭한 경우 무시
      const draggedNode = nodes.find((n) => n.id === nodeId);
      if (
        draggedNode &&
        draggedNode.department === newDept &&
        draggedNode.stage === newStage
      ) {
        console.log("⏭️ [Same Cell - Ignored]");
        return;
      }

      // 노드 이동 콜백 실행
      if (onNodeMove) {
        onNodeMove(nodeId, newDept, newStage);
      }
    } else {
      console.log("❌ [Invalid Drop]", {
        reason: "not node to cell",
        activeType: active?.data?.type,
        overType: over?.data?.type,
      });
    }
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="h-full overflow-auto p-6" data-testid="matrix-view">
        <div className="min-w-max">
          {/* Header Row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: gridCols,
              gap: "12px",
              marginBottom: "12px",
            }}
          >
            <div
              className="sticky left-0 z-10"
              data-testid="matrix-header-corner"
            >
              <div className="text-xs text-muted-foreground text-center">
                부서 \ 단계
              </div>
            </div>
            {stages
              .sort((a, b) => a.order - b.order)
              .map((stage) => (
                <div
                  key={stage.id}
                  className="brutal-card px-4 py-3 text-center bg-card/80 backdrop-blur-sm"
                  data-testid={`matrix-stage-${stage.id.toLowerCase()}`}
                >
                  <h3 className="font-display font-bold text-sm text-foreground">
                    {stage.label}
                  </h3>
                </div>
              ))}
          </div>

          {/* Matrix Grid */}
          {departments
            .sort((a, b) => a.order - b.order)
            .map((dept) => (
              <div
                key={dept.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: gridCols,
                  gap: "12px",
                  marginBottom: "12px",
                }}
              >
                {/* Department Label */}
                <div
                  className="sticky left-0 z-10 brutal-card px-4 py-3 bg-card/80 backdrop-blur-sm flex items-center"
                  data-testid={`matrix-dept-${dept.id.toLowerCase()}`}
                >
                  <h3 className="font-display font-bold text-sm text-foreground">
                    {dept.label}
                  </h3>
                </div>

                {/* Stage Cells */}
                {stages
                  .sort((a, b) => a.order - b.order)
                  .map((stage) => {
                    const cellNodes = getNodesForCell(dept.id, stage.id);
                    return (
                      <MatrixCell
                        key={`${dept.id}-${stage.id}`}
                        deptId={dept.id}
                        stageId={stage.id}
                      >
                        {cellNodes.length > 0 ? (
                          cellNodes.map((node) => (
                            <DraggableMatrixNode
                              key={node.id}
                              node={node}
                              onNodeClick={onNodeClick}
                            />
                          ))
                        ) : (
                          <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                            노드 없음
                          </div>
                        )}
                      </MatrixCell>
                    );
                  })}
              </div>
            ))}
        </div>
      </div>
    </DndContext>
  );
}
