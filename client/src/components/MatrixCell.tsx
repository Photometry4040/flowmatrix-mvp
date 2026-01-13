/* Design: Droppable matrix cell for node repositioning
 * Features: Drop zone highlighting, node preview, cell feedback
 */

import { useDroppable } from "@dnd-kit/core";
import { ReactNode } from "react";

interface MatrixCellProps {
  deptId: string;
  stageId: string;
  children: ReactNode;
  isHovered?: boolean;
}

export default function MatrixCell({
  deptId,
  stageId,
  children,
  isHovered = false,
}: MatrixCellProps) {
  const { setNodeRef, isOver, active } = useDroppable({
    id: `cell-${deptId}-${stageId}`,
    data: {
      deptId,
      stageId,
      type: "cell",
    },
  });

  const isDropActive = isOver || isHovered;
  const isDraggingOver = active?.data?.type === "node";

  return (
    <div
      ref={setNodeRef}
      className={`
        border-2 rounded-sm bg-card/30 p-3 min-h-[150px] space-y-2 matrix-cell
        transition-all duration-200
        ${
          isDraggingOver && isDropActive
            ? "border-primary bg-primary/10 scale-[1.02]"
            : "border-border hover:border-primary/50"
        }
      `}
      data-testid={`matrix-cell-${deptId.toLowerCase()}-${stageId.toLowerCase()}`}
    >
      {children}
    </div>
  );
}
