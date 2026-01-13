/* Design: Draggable node component for matrix cells
 * Features: Drag preview, node data transfer, feedback
 */

import { useDraggable } from "@dnd-kit/core";
import { Badge } from "@/components/ui/badge";
import { Clock, Sparkles, AlertTriangle } from "lucide-react";
import type { ActivityNode } from "@/types/workflow";

interface DraggableMatrixNodeProps {
  node: ActivityNode;
  onNodeClick: (node: ActivityNode) => void;
}

export default function DraggableMatrixNode({
  node,
  onNodeClick,
}: DraggableMatrixNodeProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `node-${node.id}`,
    data: {
      type: "node",
      nodeId: node.id,
    },
  });

  const isBottleneck = node.isBottleneck ?? false;
  const aiScore = node.aiScore ?? 0;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={(e) => {
        e.stopPropagation();
        onNodeClick(node);
      }}
      className={`
        p-3 transition-all border-2 rounded-sm bg-card cursor-grab active:cursor-grabbing
        ${
          isBottleneck
            ? "border-destructive bg-destructive/10"
            : "border-primary/50 bg-card"
        }
        ${isBottleneck ? "pulse-bottleneck" : ""}
        ${isDragging ? "opacity-50 scale-95" : "hover:scale-[1.02]"}
      `}
      data-testid={`draggable-matrix-node-${node.id}`}
    >
      <div className="space-y-2">
        {/* Node Header */}
        <div
          className="flex items-start justify-between gap-2 pb-2 border-b border-border/50"
        >
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
        {/* End Node Header */}

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
    </div>
  );
}
