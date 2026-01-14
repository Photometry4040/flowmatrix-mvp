/* Design: Custom edge with delete button on hover
 * Features: Delete button, context menu trigger, visual feedback
 */

import { useState } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  useReactFlow,
  type EdgeProps,
} from "@xyflow/react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerEnd,
  selected,
}: EdgeProps) {
  const { deleteElements } = useReactFlow();
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const [isHovered, setIsHovered] = useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteElements({ edges: [{ id: id as string }] });
    toast.success("엣지 삭제 완료");
  };

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          strokeWidth: selected ? 3 : 2,
          stroke: selected ? "var(--primary)" : "var(--border)",
          transition: "all 200ms ease",
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />

      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(${labelX - 12}px, ${labelY - 12}px)`,
            pointerEvents: "all",
            transition: "opacity 200ms ease",
            opacity: isHovered || selected ? 1 : 0,
          }}
          className="flex gap-1"
        >
          <Button
            size="icon"
            variant="destructive"
            className="w-6 h-6 bg-destructive hover:bg-destructive/90"
            onClick={handleDelete}
            title="엣지 삭제 (Delete 또는 우클릭 → 삭제)"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
