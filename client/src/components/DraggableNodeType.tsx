/* Design: Draggable node type buttons for canvas
 * Features: Drag from sidebar to canvas to create nodes
 */

import { Card } from "@/components/ui/card";
import type { NodeType } from "@/types/workflow";
import type { LucideIcon } from "lucide-react";

interface DraggableNodeTypeProps {
  type: NodeType;
  label: string;
  icon: LucideIcon;
  colorClass: string;
}

export default function DraggableNodeType({ 
  type, 
  label, 
  icon: Icon, 
  colorClass 
}: DraggableNodeTypeProps) {
  const onDragStart = (event: React.DragEvent) => {
    event.dataTransfer.setData("application/reactflow", type);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <Card
      draggable
      onDragStart={onDragStart}
      data-testid={`draggable-node-${type.toLowerCase()}`}
      className={`
        p-3 cursor-grab active:cursor-grabbing
        border-2 ${colorClass} bg-card/50
        hover:bg-card hover:scale-105 transition-all
        flex items-center gap-2
      `}
    >
      <div className={`p-1.5 rounded-sm border-2 ${colorClass} bg-background`}>
        <Icon className="w-4 h-4" />
      </div>
      <span className="text-sm font-semibold text-foreground">{label}</span>
    </Card>
  );
}
