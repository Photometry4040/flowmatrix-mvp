/**
 * ProjectManager - 워크플로우 프로젝트 관리 다이얼로그
 * 
 * 기능:
 * - 프로젝트 목록 표시
 * - 새 프로젝트 생성
 * - 프로젝트 불러오기
 * - 프로젝트 삭제
 * - 프로젝트 내보내기/가져오기
 */

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import {
  getProjectsList,
  createNewProject,
  deleteProject,
  loadProject,
  exportProject,
  importProject,
  setCurrentProject,
  getStorageUsage,
} from "@/lib/workflowStorage";
import {
  FolderOpen,
  Plus,
  Trash2,
  Download,
  Upload,
  Clock,
  HardDrive,
} from "lucide-react";
import { useState } from "react";
import type { WorkflowProject } from "@/types/workflow";
import { toast } from "sonner";

interface ProjectManagerProps {
  onProjectLoad: (project: WorkflowProject) => void;
}

export default function ProjectManager({ onProjectLoad }: ProjectManagerProps) {
  const [open, setOpen] = useState(false);
  const [projects, setProjects] = useState(getProjectsList());
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<{ id: string; name: string } | null>(null);
  const storage = getStorageUsage();

  const handleCreateProject = () => {
    if (!newProjectName.trim()) {
      toast.error("프로젝트 이름을 입력하세요.");
      return;
    }

    const project = createNewProject(newProjectName, newProjectDesc);
    setProjects(getProjectsList());
    setNewProjectName("");
    setNewProjectDesc("");
    onProjectLoad(project);
    setOpen(false);
  };

  const handleLoadProject = (projectId: string) => {
    const project = loadProject(projectId);
    if (project) {
      setCurrentProject(projectId);
      onProjectLoad(project);
      setOpen(false);
    }
  };

  const handleDeleteProject = (projectId: string, projectName: string) => {
    setProjectToDelete({ id: projectId, name: projectName });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (projectToDelete) {
      deleteProject(projectToDelete.id);
      setProjects(getProjectsList());
      toast.success(`"${projectToDelete.name}" 프로젝트를 삭제했습니다.`);
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
    }
  };

  const handleExportProject = (projectId: string) => {
    const json = exportProject(projectId);
    if (json) {
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `flowmatrix_${projectId}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleImportProject = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const json = event.target?.result as string;
          const project = importProject(json);
          if (project) {
            setProjects(getProjectsList());
            toast.success(`"${project.name}" 프로젝트를 가져왔습니다.`);
          } else {
            toast.error("프로젝트 가져오기 실패. 파일 형식을 확인하세요.");
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <FolderOpen className="w-4 h-4" />
          프로젝트
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display">프로젝트 관리</DialogTitle>
          <DialogDescription>
            워크플로우 프로젝트를 생성, 불러오기, 삭제할 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* 새 프로젝트 생성 */}
          <Card className="p-4 space-y-3">
            <h3 className="text-sm font-display font-bold">새 프로젝트 생성</h3>
            <div className="grid gap-3">
              <div>
                <Label htmlFor="project-name">프로젝트 이름</Label>
                <Input
                  id="project-name"
                  placeholder="예: 신제품 개발 프로세스"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="project-desc">설명 (선택)</Label>
                <Input
                  id="project-desc"
                  placeholder="프로젝트 설명을 입력하세요"
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                />
              </div>
              <Button onClick={handleCreateProject} className="gap-2">
                <Plus className="w-4 h-4" />
                생성
              </Button>
            </div>
          </Card>

          <Separator />

          {/* 프로젝트 목록 */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-display font-bold">저장된 프로젝트</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={handleImportProject}
                className="gap-2"
              >
                <Upload className="w-4 h-4" />
                가져오기
              </Button>
            </div>

            {projects.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">저장된 프로젝트가 없습니다.</p>
                <p className="text-sm text-muted-foreground mt-1">
                  새 프로젝트를 생성하거나 JSON 파일을 가져오세요.
                </p>
              </Card>
            ) : (
              <div className="grid gap-3">
                {projects.map((project) => (
                  <Card
                    key={project.id}
                    className="p-4 hover:border-primary transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-display font-bold text-foreground">
                          {project.name}
                        </h4>
                        {project.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {project.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(project.updatedAt).toLocaleString("ko-KR")}
                          </div>
                          <div>v{project.version}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleLoadProject(project.id)}
                        >
                          불러오기
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleExportProject(project.id)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleDeleteProject(project.id, project.name)
                          }
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* 저장 공간 정보 */}
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-display">저장 공간 사용량</span>
              </div>
              <span className="text-sm font-mono">
                {storage.used.toFixed(2)} MB / {storage.total.toFixed(0)} MB
              </span>
            </div>
            <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{
                  width: `${storage.percentage}%`,
                }}
              />
            </div>
          </Card>
        </div>
      </DialogContent>

      {/* 삭제 확인 AlertDialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>프로젝트 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              정말로 "{projectToDelete?.name}" 프로젝트를 삭제하시겠습니까?
              <br />
              이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
