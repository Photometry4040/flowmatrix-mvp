/* Design: Department × Project Stage matrix layout
 * Features: Grid-based swimlanes, cell-based node organization
 */

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ActivityNode, Department, ProjectStage } from "@/types/workflow";
import { Clock, Sparkles, AlertTriangle } from "lucide-react";

interface MatrixViewProps {
  nodes: ActivityNode[];
  onNodeClick: (node: ActivityNode) => void;
}

const departments: { id: Department; label: string }[] = [
  { id: "PRODUCT_TEAM", label: "제품팀" },
  { id: "DESIGN_TEAM", label: "디자인팀" },
  { id: "HW_TEAM", label: "하드웨어팀" },
  { id: "SW_TEAM", label: "소프트웨어팀" },
  { id: "QA_TEAM", label: "QA팀" },
  { id: "MARKETING_TEAM", label: "마케팅팀" },
];

const stages: { id: ProjectStage; label: string }[] = [
  { id: "PLANNING", label: "기획" },
  { id: "DEVELOPMENT", label: "개발" },
  { id: "TESTING", label: "테스트" },
  { id: "DEPLOYMENT", label: "배포" },
  { id: "MAINTENANCE", label: "유지보수" },
];

export default function MatrixView({ nodes, onNodeClick }: MatrixViewProps) {
  const getNodesForCell = (department: Department, stage: ProjectStage) => {
    return nodes.filter(
      (node) => node.department === department && node.stage === stage
    );
  };

  return (
    <div className="h-full overflow-auto p-6">
      <div className="min-w-max">
        {/* Header Row */}
        <div className="grid grid-cols-[200px_repeat(5,minmax(250px,1fr))] gap-3 mb-3">
          <div className="sticky left-0 z-10" />
          {stages.map((stage) => (
            <div
              key={stage.id}
              className="brutal-card px-4 py-3 text-center bg-card/80 backdrop-blur-sm"
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
            className="grid grid-cols-[200px_repeat(5,minmax(250px,1fr))] gap-3 mb-3"
          >
            {/* Department Label */}
            <div className="sticky left-0 z-10 brutal-card px-4 py-3 bg-card/80 backdrop-blur-sm flex items-center">
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
                  className="border-2 border-border rounded-sm bg-card/30 p-3 min-h-[150px] space-y-2"
                >
                  {cellNodes.length > 0 ? (
                    cellNodes.map((node) => {
                      const isBottleneck = (node as any).isBottleneck || false;
                      const aiScore = (node as any).aiScore || 0;

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
