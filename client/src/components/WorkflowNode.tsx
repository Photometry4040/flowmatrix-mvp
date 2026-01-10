/* Design: Neo-Brutalist node cards with strong borders and neon accents
 * Features: Type-based styling, AI score display, bottleneck pulsing
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ActivityNode, BrainUsage, NodeStatus } from "@/types/workflow";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { 
  Zap, 
  GitBranch, 
  FileText, 
  Play,
  Clock,
  Brain,
  Sparkles
} from "lucide-react";
import { memo } from "react";

interface WorkflowNodeData extends ActivityNode {
  isBottleneck?: boolean;
  aiScore?: number;
}

const nodeTypeIcons = {
  TRIGGER: Play,
  ACTION: Zap,
  DECISION: GitBranch,
  ARTIFACT: FileText,
};

const nodeTypeColors = {
  TRIGGER: "text-success border-success",
  ACTION: "text-primary border-primary",
  DECISION: "text-accent border-accent",
  ARTIFACT: "text-chart-4 border-chart-4",
};

const brainUsageColors: Record<BrainUsage, string> = {
  LOW: "bg-success/20 text-success border-success",
  MEDIUM: "bg-chart-5/20 text-chart-5 border-chart-5",
  HIGH: "bg-accent/20 text-accent border-accent",
};

function WorkflowNode({ data }: NodeProps<WorkflowNodeData>) {
  const Icon = nodeTypeIcons[data.type];
  const colorClass = nodeTypeColors[data.type];
  const isBottleneck = data.isBottleneck || false;
  const aiScore = data.aiScore || 0;
  const status = data.status || "PENDING";
  const progress = data.progress || 0;

  // 상태별 색상
  const statusColors: Record<NodeStatus, string> = {
    PENDING: "bg-muted/20 text-muted-foreground border-muted",
    READY: "bg-success/20 text-success border-success",
    IN_PROGRESS: "bg-primary/20 text-primary border-primary",
    COMPLETED: "bg-muted/50 text-muted-foreground border-muted",
    BLOCKED: "bg-destructive/20 text-destructive border-destructive"
  };

  const statusLabels: Record<NodeStatus, string> = {
    PENDING: "대기",
    READY: "준비",
    IN_PROGRESS: "진행",
    COMPLETED: "완료",
    BLOCKED: "차단"
  };
  
  return (
    <div className={`${isBottleneck ? "pulse-bottleneck" : ""}`}>
      <Card 
        className={`
          brutal-card min-w-[280px] max-w-[320px]
          ${isBottleneck ? "border-destructive shadow-[4px_4px_0px_0px_rgba(255,0,110,0.5)]" : ""}
          hover:shadow-[6px_6px_0px_0px_rgba(0,212,255,0.4)] transition-all
        `}
      >
        <Handle 
          type="target" 
          position={Position.Top} 
          className="!bg-primary !border-primary"
        />
        
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 flex-1">
              <div className={`p-1.5 rounded-sm border-2 ${colorClass} bg-background`}>
                <Icon className="w-4 h-4" />
              </div>
              <CardTitle className="text-sm font-display font-bold leading-tight">
                {data.label}
              </CardTitle>
            </div>
            
            <div className="flex items-center gap-1">
              <Badge 
                variant="outline" 
                className={`${statusColors[status]} text-xs px-1.5 py-0.5`}
              >
                {statusLabels[status]}
              </Badge>
              
              {aiScore > 70 && (
                <Badge variant="outline" className="bg-success/10 text-success border-success gap-1 px-1.5 py-0.5">
                  <Sparkles className="w-3 h-3" />
                  <span className="text-xs font-mono">{aiScore}%</span>
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-2">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span className="font-mono">{data.attributes.avg_time}</span>
            </div>
            
            <Badge 
              variant="outline" 
              className={`${brainUsageColors[data.attributes.brain_usage]} text-xs px-1.5 py-0`}
            >
              <Brain className="w-3 h-3 mr-1" />
              {data.attributes.brain_usage}
            </Badge>
          </div>
          
          {data.attributes.tool.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {data.attributes.tool.slice(0, 3).map((tool, idx) => (
                <Badge 
                  key={idx} 
                  variant="secondary" 
                  className="text-xs px-1.5 py-0 font-mono"
                >
                  {tool}
                </Badge>
              ))}
              {data.attributes.tool.length > 3 && (
                <Badge variant="secondary" className="text-xs px-1.5 py-0">
                  +{data.attributes.tool.length - 3}
                </Badge>
              )}
            </div>
          )}
          
          {data.attributes.is_repetitive && (
            <div className="text-xs text-primary flex items-center gap-1 pt-1">
              <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
              <span>반복 작업</span>
            </div>
          )}
          
          {/* 진행률 바 */}
          {status === "IN_PROGRESS" && progress > 0 && (
            <div className="h-1.5 bg-muted rounded-full overflow-hidden mt-2">
              <div 
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </CardContent>
        
        <Handle 
          type="source" 
          position={Position.Bottom} 
          className="!bg-primary !border-primary"
        />
      </Card>
    </div>
  );
}

export default memo(WorkflowNode);
