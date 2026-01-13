/* Design: Department management dialog for workspace configuration
 * Features: Add, edit, delete, reorder departments with validation
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
  addDepartment,
  canDeleteDepartment,
  deleteDepartment,
  updateDepartment,
  reorderDepartments,
} from "@/lib/workspaceConfig";
import type { DepartmentConfig, WorkspaceConfig, ActivityNode } from "@/types/workflow";

interface DepartmentManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: WorkspaceConfig;
  onConfigChange: (config: WorkspaceConfig) => void;
  nodes: ActivityNode[];
}

export default function DepartmentManager({
  open,
  onOpenChange,
  config,
  onConfigChange,
  nodes,
}: DepartmentManagerProps) {
  const [newDeptId, setNewDeptId] = useState("");
  const [newDeptLabel, setNewDeptLabel] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingLabel, setEditingLabel] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  const handleAddDepartment = () => {
    if (!newDeptId.trim() || !newDeptLabel.trim()) {
      toast.error("부서 ID와 이름을 모두 입력해주세요.");
      return;
    }

    const result = addDepartment(newDeptId, newDeptLabel, config);
    if (result.success && result.config) {
      onConfigChange(result.config);
      setNewDeptId("");
      setNewDeptLabel("");
      toast.success(`"${newDeptLabel}" 부서가 추가되었습니다.`);
    } else {
      toast.error(result.error || "부서 추가에 실패했습니다.");
    }
  };

  const handleUpdateDepartment = (deptId: string, newLabel: string) => {
    const result = updateDepartment(deptId, newLabel, config);
    if (result.success && result.config) {
      onConfigChange(result.config);
      setEditingId(null);
      toast.success("부서가 수정되었습니다.");
    } else {
      toast.error(result.error || "부서 수정에 실패했습니다.");
    }
  };

  const handleDeleteDepartment = (deptId: string) => {
    const { canDelete, nodeCount } = canDeleteDepartment(deptId, nodes);
    if (!canDelete) {
      toast.error(
        `"${config.departments.find((d) => d.id === deptId)?.label}" 부서를 삭제할 수 없습니다.\n${nodeCount}개의 노드가 사용 중입니다.`
      );
      setDeleteTarget(null);
      return;
    }

    const result = deleteDepartment(deptId, config);
    if (result.success && result.config) {
      onConfigChange(result.config);
      setDeleteTarget(null);
      const deptLabel = config.departments.find((d) => d.id === deptId)?.label;
      toast.success(`"${deptLabel}" 부서가 삭제되었습니다.`);
    } else {
      toast.error(result.error || "부서 삭제에 실패했습니다.");
    }
  };

  const handleDragStart = (deptId: string) => {
    setDraggedItem(deptId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropReorder = (targetDeptId: string) => {
    if (!draggedItem || draggedItem === targetDeptId) {
      setDraggedItem(null);
      return;
    }

    const draggedIdx = config.departments.findIndex((d) => d.id === draggedItem);
    const targetIdx = config.departments.findIndex((d) => d.id === targetDeptId);

    if (draggedIdx === -1 || targetIdx === -1) return;

    const newDepts = [...config.departments];
    [newDepts[draggedIdx], newDepts[targetIdx]] = [
      newDepts[targetIdx],
      newDepts[draggedIdx],
    ];

    const result = reorderDepartments(newDepts, config);
    if (result.success && result.config) {
      onConfigChange(result.config);
      toast.success("부서 순서가 변경되었습니다.");
    }

    setDraggedItem(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>부서 관리</DialogTitle>
          <DialogDescription>
            부서를 추가, 수정, 또는 삭제할 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Add New Department */}
          <div className="space-y-2 p-3 bg-muted rounded-lg">
            <h4 className="font-semibold text-sm">새 부서 추가</h4>
            <div className="space-y-2">
              <div>
                <Label htmlFor="dept-id" className="text-xs">
                  부서 ID
                </Label>
                <Input
                  id="dept-id"
                  placeholder="예: PRODUCT_TEAM"
                  value={newDeptId}
                  onChange={(e) => setNewDeptId(e.target.value)}
                  className="text-sm"
                />
              </div>
              <div>
                <Label htmlFor="dept-label" className="text-xs">
                  부서명
                </Label>
                <Input
                  id="dept-label"
                  placeholder="예: 제품팀"
                  value={newDeptLabel}
                  onChange={(e) => setNewDeptLabel(e.target.value)}
                  className="text-sm"
                />
              </div>
              <Button
                size="sm"
                onClick={handleAddDepartment}
                className="w-full gap-2"
              >
                <Plus className="w-4 h-4" />
                부서 추가
              </Button>
            </div>
          </div>

          {/* Existing Departments */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">현재 부서 ({config.departments.length})</h4>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {config.departments.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  부서를 추가하세요.
                </p>
              ) : (
                config.departments
                  .sort((a, b) => a.order - b.order)
                  .map((dept) => (
                    <div
                      key={dept.id}
                      draggable
                      onDragStart={() => handleDragStart(dept.id)}
                      onDragOver={handleDragOver}
                      onDrop={() => handleDropReorder(dept.id)}
                      className={`p-2 rounded border-2 flex items-center justify-between gap-2 cursor-move transition-colors ${
                        draggedItem === dept.id
                          ? "bg-primary/20 border-primary"
                          : "bg-card border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        {editingId === dept.id ? (
                          <Input
                            autoFocus
                            value={editingLabel}
                            onChange={(e) => setEditingLabel(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleUpdateDepartment(dept.id, editingLabel);
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
                              {dept.label}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {dept.id}
                            </p>
                          </div>
                        )}
                      </div>

                      {editingId === dept.id ? (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() =>
                              handleUpdateDepartment(dept.id, editingLabel)
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
                              setEditingId(dept.id);
                              setEditingLabel(dept.label);
                            }}
                            className="h-7 px-2 text-xs"
                          >
                            수정
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setDeleteTarget(dept.id)}
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
            <AlertDialogTitle>부서 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              정말로 "{config.departments.find((d) => d.id === deleteTarget)?.label}" 부서를
              삭제하시겠습니까?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deleteTarget && handleDeleteDepartment(deleteTarget)
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
