/* Design: Stage management dialog for workspace configuration
 * Features: Add, edit, delete, reorder stages with validation
 */

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Trash2, Plus, GripVertical } from "lucide-react";
import {
  addStage,
  canDeleteStage,
  deleteStage,
  updateStage,
  reorderStages,
} from "@/lib/workspaceConfig";
import type { StageConfig, WorkspaceConfig, ActivityNode } from "@/types/workflow";

interface StageManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: WorkspaceConfig;
  onConfigChange: (config: WorkspaceConfig) => void;
  nodes: ActivityNode[];
}

export default function StageManager({
  open,
  onOpenChange,
  config,
  onConfigChange,
  nodes,
}: StageManagerProps) {
  const [newStageId, setNewStageId] = useState("");
  const [newStageLabel, setNewStageLabel] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingLabel, setEditingLabel] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  const handleAddStage = () => {
    if (!newStageId.trim() || !newStageLabel.trim()) {
      toast.error("단계 ID와 이름을 모두 입력해주세요.");
      return;
    }

    const result = addStage(newStageId, newStageLabel, config);
    if (result.success && result.config) {
      onConfigChange(result.config);
      setNewStageId("");
      setNewStageLabel("");
      toast.success(`"${newStageLabel}" 단계가 추가되었습니다.`);
    } else {
      toast.error(result.error || "단계 추가에 실패했습니다.");
    }
  };

  const handleUpdateStage = (stageId: string, newLabel: string) => {
    const result = updateStage(stageId, newLabel, config);
    if (result.success && result.config) {
      onConfigChange(result.config);
      setEditingId(null);
      toast.success("단계가 수정되었습니다.");
    } else {
      toast.error(result.error || "단계 수정에 실패했습니다.");
    }
  };

  const handleDeleteStage = (stageId: string) => {
    const { canDelete, nodeCount } = canDeleteStage(stageId, nodes);
    if (!canDelete) {
      toast.error(
        `"${config.stages.find((s) => s.id === stageId)?.label}" 단계를 삭제할 수 없습니다.\n${nodeCount}개의 노드가 사용 중입니다.`
      );
      setDeleteTarget(null);
      return;
    }

    const result = deleteStage(stageId, config);
    if (result.success && result.config) {
      onConfigChange(result.config);
      setDeleteTarget(null);
      const stageLabel = config.stages.find((s) => s.id === stageId)?.label;
      toast.success(`"${stageLabel}" 단계가 삭제되었습니다.`);
    } else {
      toast.error(result.error || "단계 삭제에 실패했습니다.");
    }
  };

  const handleDragStart = (stageId: string) => {
    setDraggedItem(stageId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropReorder = (targetStageId: string) => {
    if (!draggedItem || draggedItem === targetStageId) {
      setDraggedItem(null);
      return;
    }

    const draggedIdx = config.stages.findIndex((s) => s.id === draggedItem);
    const targetIdx = config.stages.findIndex((s) => s.id === targetStageId);

    if (draggedIdx === -1 || targetIdx === -1) return;

    const newStages = [...config.stages];
    [newStages[draggedIdx], newStages[targetIdx]] = [
      newStages[targetIdx],
      newStages[draggedIdx],
    ];

    const result = reorderStages(newStages, config);
    if (result.success && result.config) {
      onConfigChange(result.config);
      toast.success("단계 순서가 변경되었습니다.");
    }

    setDraggedItem(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>단계 관리</DialogTitle>
          <DialogDescription>
            단계를 추가, 수정, 또는 삭제할 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Add New Stage */}
          <div className="space-y-2 p-3 bg-muted rounded-lg">
            <h4 className="font-semibold text-sm">새 단계 추가</h4>
            <div className="space-y-2">
              <div>
                <Label htmlFor="stage-id" className="text-xs">
                  단계 ID
                </Label>
                <Input
                  id="stage-id"
                  placeholder="예: REVIEW"
                  value={newStageId}
                  onChange={(e) => setNewStageId(e.target.value)}
                  className="text-sm"
                />
              </div>
              <div>
                <Label htmlFor="stage-label" className="text-xs">
                  단계명
                </Label>
                <Input
                  id="stage-label"
                  placeholder="예: 검토"
                  value={newStageLabel}
                  onChange={(e) => setNewStageLabel(e.target.value)}
                  className="text-sm"
                />
              </div>
              <Button
                size="sm"
                onClick={handleAddStage}
                className="w-full gap-2"
              >
                <Plus className="w-4 h-4" />
                단계 추가
              </Button>
            </div>
          </div>

          {/* Existing Stages */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">현재 단계 ({config.stages.length})</h4>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {config.stages.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  단계를 추가하세요.
                </p>
              ) : (
                config.stages
                  .sort((a, b) => a.order - b.order)
                  .map((stage) => (
                    <div
                      key={stage.id}
                      draggable
                      onDragStart={() => handleDragStart(stage.id)}
                      onDragOver={handleDragOver}
                      onDrop={() => handleDropReorder(stage.id)}
                      className={`p-2 rounded border-2 flex items-center justify-between gap-2 cursor-move transition-colors ${
                        draggedItem === stage.id
                          ? "bg-primary/20 border-primary"
                          : "bg-card border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        {editingId === stage.id ? (
                          <Input
                            autoFocus
                            value={editingLabel}
                            onChange={(e) => setEditingLabel(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleUpdateStage(stage.id, editingLabel);
                              } else if (e.key === "Escape") {
                                setEditingId(null);
                              }
                            }}
                            className="text-sm h-7"
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {stage.label}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {stage.id}
                            </p>
                          </div>
                        )}
                      </div>

                      {editingId === stage.id ? (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() =>
                              handleUpdateStage(stage.id, editingLabel)
                            }
                            className="h-7 px-2"
                          >
                            저장
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingId(null)}
                            className="h-7 px-2"
                          >
                            취소
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingId(stage.id);
                              setEditingLabel(stage.label);
                            }}
                            className="h-7 px-2 text-xs"
                          >
                            수정
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setDeleteTarget(stage.id)}
                            className="h-7 px-2"
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      </DialogContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>단계 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              정말로 "{config.stages.find((s) => s.id === deleteTarget)?.label}" 단계를
              삭제하시겠습니까?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deleteTarget && handleDeleteStage(deleteTarget)
              }
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
