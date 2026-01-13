/* Design: Department × Project Stage matrix layout
 * Features: Grid-based swimlanes, cell-based node organization
 */

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ActivityNode, DepartmentConfig, StageConfig } from "@/types/workflow";
import { Clock, Sparkles, AlertTriangle } from "lucide-react";

interface MatrixViewProps {
  nodes: ActivityNode[];
  departments: DepartmentConfig[];
  stages: StageConfig[];
  onNodeClick: (node: ActivityNode) => void;
}

export default function MatrixView({
  nodes,
  departments,
  stages,
  onNodeClick
}: MatrixViewProps) {
  const getNodesForCell = (deptId: string, stageId: string) => {
    return nodes.filter(
      (node) => node.department === deptId && node.stage === stageId
    );
  };

  // 동적 그리드 열 계산 (부서 + 단계의 수에 따라)
  const gridCols = `200px_repeat(${stages.length},minmax(250px,1fr))`;

  return (
    <div className="h-full overflow-auto p-6" data-testid="matrix-view">
      <div className="min-w-max">
        {/* Header Row */}
        <div style={{ display: "grid", gridTemplateColumns: gridCols, gap: "12px", marginBottom: "12px" }}>
          <div className="sticky left-0 z-10" data-testid="matrix-header-corner">
            <div className="text-xs text-muted-foreground text-center">부서 \ 단계</div>
          </div>
          {stages.map((stage) => (
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
        {departments.map((dept) => (
          <div
            key={dept.id}
            style={{ display: "grid", gridTemplateColumns: gridCols, gap: "12px", marginBottom: "12px" }}
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
            {stages.map((stage) => {
              const cellNodes = getNodesForCell(dept.id, stage.id);
              return (
                <div
                  key={`${dept.id}-${stage.id}`}
                  className="border-2 border-border rounded-sm bg-card/30 p-3 min-h-[150px] space-y-2 matrix-cell"
                  data-testid={`matrix-cell-${dept.id.toLowerCase()}-${stage.id.toLowerCase()}`}
                >
                  {cellNodes.length > 0 ? (
                    cellNodes.map((node) => {
                      const isBottleneck = node.isBottleneck ?? false;
                      const aiScore = node.aiScore ?? 0;

                      return (
                        <Card
                          key={node.id}
                          onClick={() => onNodeClick(node)}
                          className={`
                            p-3 cursor-pointer transition-all hover:scale-[1.02]
                            border-2 ${
                              isBottleneck
                                ? "border-destructive bg-destructive/10"
                                : "border-primary/50 bg-card"
                            }
                            ${isBottleneck ? "pulse-bottleneck" : ""}
                          `}
                        >
                          <div className="space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="text-sm font-semibold text-foreground leading-tight flex-1">
                                {node.label}
                              </h4>
                              {aiScore > 70 && (
                                <Sparkles className="w-4 h-4 text-success flex-shrink-0" />
                              )}
                              {isBottleneck && (
                                <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0" />
                              )}
                            </div>

                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              <span className="font-mono">{node.attributes.avg_time}</span>
                            </div>

                            {node.attributes.tool.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {node.attributes.tool.slice(0, 2).map((tool, idx) => (
                                  <Badge
                                    key={idx}
                                    variant="secondary"
                                    className="text-xs px-1.5 py-0 font-mono"
                                  >
                                    {tool}
                                  </Badge>
                                ))}
                                {node.attributes.tool.length > 2 && (
                                  <Badge variant="secondary" className="text-xs px-1.5 py-0">
                                    +{node.attributes.tool.length - 2}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </Card>
                      );
                    })
                  ) : (
                    <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                      노드 없음
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
