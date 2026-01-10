/**
 * NodeContextMenu - 노드 우클릭 컨텍스트 메뉴
 * 
 * 기능:
 * - 작업 시작/완료 처리
 * - 노드 복제
 * - 노드 삭제
 * - 상태 변경
 */

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import type { ActivityNode, NodeStatus } from "@/types/workflow";
import {
  Play,
  CheckCircle,
  Copy,
  Trash2,
  Clock,
  Circle,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { ReactNode } from "react";

interface NodeContextMenuProps {
  children: ReactNode;
  node: ActivityNode;
  onStartNode: (nodeId: string) => void;
  onCompleteNode: (nodeId: string) => void;
  onDuplicateNode: (node: ActivityNode) => void;
  onDeleteNode: (nodeId: string) => void;
  onChangeStatus: (nodeId: string, status: NodeStatus) => void;
}

const statusIcons: Record<NodeStatus, React.ElementType> = {
  PENDING: Clock,
  READY: Circle,
  IN_PROGRESS: Play,
  COMPLETED: CheckCircle,
  BLOCKED: XCircle,
};

const statusLabels: Record<NodeStatus, string> = {
  PENDING: "대기",
  READY: "준비 완료",
  IN_PROGRESS: "진행 중",
  COMPLETED: "완료",
  BLOCKED: "차단됨",
};

export default function NodeContextMenu({
  children,
  node,
  onStartNode,
  onCompleteNode,
  onDuplicateNode,
  onDeleteNode,
  onChangeStatus,
}: NodeContextMenuProps) {
  const currentStatus = node.status || "PENDING";

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        {/* 빠른 액션 */}
        {currentStatus !== "IN_PROGRESS" && currentStatus !== "COMPLETED" && (
          <ContextMenuItem
            onClick={() => onStartNode(node.id)}
            className="gap-2"
          >
            <Play className="w-4 h-4 text-primary" />
            작업 시작
          </ContextMenuItem>
        )}

        {currentStatus === "IN_PROGRESS" && (
          <ContextMenuItem
            onClick={() => onCompleteNode(node.id)}
            className="gap-2"
          >
            <CheckCircle className="w-4 h-4 text-success" />
            완료 처리
          </ContextMenuItem>
        )}

        {(currentStatus === "IN_PROGRESS" || currentStatus === "COMPLETED") && (
          <ContextMenuSeparator />
        )}

        {/* 상태 변경 서브메뉴 */}
        <ContextMenuSub>
          <ContextMenuSubTrigger className="gap-2">
            <AlertCircle className="w-4 h-4" />
            상태 변경
          </ContextMenuSubTrigger>
          <ContextMenuSubContent>
            {(Object.keys(statusLabels) as NodeStatus[]).map((status) => {
              const Icon = statusIcons[status];
              return (
                <ContextMenuItem
                  key={status}
                  onClick={() => onChangeStatus(node.id, status)}
                  disabled={status === currentStatus}
                  className="gap-2"
                >
                  <Icon className="w-4 h-4" />
                  {statusLabels[status]}
                  {status === currentStatus && (
                    <span className="ml-auto text-xs text-muted-foreground">
                      현재
                    </span>
                  )}
                </ContextMenuItem>
              );
            })}
          </ContextMenuSubContent>
        </ContextMenuSub>

        <ContextMenuSeparator />

        {/* 노드 관리 */}
        <ContextMenuItem
          onClick={() => onDuplicateNode(node)}
          className="gap-2"
        >
          <Copy className="w-4 h-4" />
          노드 복제
        </ContextMenuItem>

        <ContextMenuItem
          onClick={() => onDeleteNode(node.id)}
          className="gap-2 text-destructive focus:text-destructive"
        >
          <Trash2 className="w-4 h-4" />
          노드 삭제
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
