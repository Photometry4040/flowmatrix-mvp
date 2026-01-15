/**
 * TemplateLibrary - 워크플로우 템플릿 라이브러리 다이얼로그
 *
 * 기능:
 * - 템플릿 목록 표시 (그리드 뷰)
 * - 카테고리 필터링
 * - 템플릿 검색
 * - 템플릿 미리보기
 * - 템플릿 불러오기
 * - 템플릿 저장
 * - 템플릿 삭제
 * - 템플릿 import/export
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getTemplatesList,
  searchTemplates,
  getTemplatesByCategory,
  deleteTemplate,
  exportTemplate,
  importTemplate,
  createTemplateFromProject,
  saveTemplate,
} from "@/lib/templateStorage";
import {
  Download,
  Upload,
  Trash2,
  Library,
  Copy,
  Save,
  Eye,
  Zap,
  Layers,
  Tag,
} from "lucide-react";
import { useState, useMemo } from "react";
import type {
  WorkflowTemplate,
  TemplateCategory,
  WorkflowProject,
} from "@/types/workflow";
import { toast } from "sonner";

interface TemplateLibraryProps {
  onTemplateLoad: (template: WorkflowTemplate) => void;
  currentProject?: WorkflowProject;
}

const CATEGORY_INFO: Record<
  TemplateCategory,
  { label: string; description: string }
> = {
  SW_DEVELOPMENT: {
    label: "소프트웨어 개발",
    description: "애자일, 스프린트 기반 소프트웨어 개발 템플릿",
  },
  HW_DEVELOPMENT: {
    label: "하드웨어 개발",
    description: "제품 개발, 설계, 양산 프로세스 템플릿",
  },
  MARKETING: {
    label: "마케팅",
    description: "캠페인, 콘텐츠 마케팅 템플릿",
  },
  DESIGN: {
    label: "디자인",
    description: "UI/UX, 디자인 프로세스 템플릿",
  },
  CUSTOM: {
    label: "커스텀",
    description: "사용자 저장 커스텀 템플릿",
  },
};

export default function TemplateLibrary({
  onTemplateLoad,
  currentProject,
}: TemplateLibraryProps) {
  const [open, setOpen] = useState(false);
  const [templates, setTemplates] = useState(getTemplatesList());
  const [selectedCategory, setSelectedCategory] =
    useState<TemplateCategory>("SW_DEVELOPMENT");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTemplate, setSelectedTemplate] =
    useState<WorkflowTemplate | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] =
    useState<WorkflowTemplate | null>(null);
  const [saveAsTemplateOpen, setSaveAsTemplateOpen] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  const [templateCategory, setTemplateCategory] =
    useState<TemplateCategory>("CUSTOM");
  const [templateTags, setTemplateTags] = useState("");

  // 선택된 카테고리의 템플릿 필터링
  const categoryTemplates = useMemo(() => {
    return searchTemplates(searchQuery, selectedCategory);
  }, [selectedCategory, searchQuery]);

  const handleLoadTemplate = (template: WorkflowTemplate) => {
    onTemplateLoad(template);
    setOpen(false);
    toast.success(`"${template.name}" 템플릿을 불러왔습니다.`);
  };

  const handleDeleteTemplate = (template: WorkflowTemplate) => {
    setTemplateToDelete(template);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (templateToDelete) {
      deleteTemplate(templateToDelete.id);
      setTemplates(getTemplatesList());
      setSelectedTemplate(null);
      toast.success(`"${templateToDelete.name}" 템플릿을 삭제했습니다.`);
      setDeleteDialogOpen(false);
      setTemplateToDelete(null);
    }
  };

  const handleExportTemplate = (template: WorkflowTemplate) => {
    const json = exportTemplate(template.id);
    if (json) {
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `template_${template.id}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("템플릿을 내보냈습니다.");
    }
  };

  const handleImportTemplate = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const json = event.target?.result as string;
          const template = importTemplate(json);
          if (template) {
            setTemplates(getTemplatesList());
            toast.success(`"${template.name}" 템플릿을 가져왔습니다.`);
          } else {
            toast.error("템플릿 가져오기 실패. 파일 형식을 확인하세요.");
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleSaveAsTemplate = () => {
    if (!currentProject) {
      toast.error("저장할 프로젝트가 없습니다.");
      return;
    }

    if (!templateName.trim()) {
      toast.error("템플릿 이름을 입력하세요.");
      return;
    }

    const newTemplate = createTemplateFromProject(
      currentProject,
      templateCategory
    );

    // 템플릿 정보 업데이트
    newTemplate.name = templateName;
    newTemplate.description = templateDescription || undefined;
    newTemplate.tags = templateTags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag);

    if (!newTemplate.tags.length) {
      newTemplate.tags = [];
    }

    saveTemplate(newTemplate);
    setTemplates(getTemplatesList());

    toast.success(`"${templateName}" 템플릿으로 저장했습니다.`);
    setSaveAsTemplateOpen(false);
    setTemplateName("");
    setTemplateDescription("");
    setTemplateTags("");
    setTemplateCategory("CUSTOM");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Library className="w-4 h-4" />
          템플릿
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display">템플릿 라이브러리</DialogTitle>
          <DialogDescription>
            기본 템플릿을 사용하거나 현재 워크플로우를 템플릿으로 저장하세요.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* 검색 및 액션 버튼 */}
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <Label htmlFor="search-template">템플릿 검색</Label>
              <Input
                id="search-template"
                placeholder="템플릿 이름, 설명, 태그로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleImportTemplate}
                className="gap-2"
              >
                <Upload className="w-4 h-4" />
                가져오기
              </Button>
              {currentProject && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSaveAsTemplateOpen(true)}
                  className="gap-2"
                >
                  <Save className="w-4 h-4" />
                  저장
                </Button>
              )}
            </div>
          </div>

          <Separator />

          {/* 카테고리 탭 */}
          <Tabs
            value={selectedCategory}
            onValueChange={(value) =>
              setSelectedCategory(value as TemplateCategory)
            }
          >
            <TabsList className="grid w-full grid-cols-5">
              {Object.entries(CATEGORY_INFO).map(([key, value]) => (
                <TabsTrigger key={key} value={key} className="text-xs">
                  {value.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {Object.entries(CATEGORY_INFO).map(([category, info]) => (
              <TabsContent key={category} value={category} className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">{info.description}</p>
                </div>

                {categoryTemplates.length === 0 ? (
                  <Card className="p-8 text-center">
                    <p className="text-muted-foreground">
                      이 카테고리에 템플릿이 없습니다.
                    </p>
                  </Card>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {categoryTemplates.map((template) => (
                      <Card
                        key={template.id}
                        className="p-4 hover:border-primary transition-colors cursor-pointer"
                        onClick={() => setSelectedTemplate(template)}
                      >
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-display font-bold text-foreground">
                              {template.name}
                            </h4>
                            {template.description && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {template.description}
                              </p>
                            )}
                          </div>

                          {/* 템플릿 통계 */}
                          <div className="flex items-center gap-4 text-xs text-muted-foreground py-2 border-y border-border">
                            <div className="flex items-center gap-1">
                              <Layers className="w-3 h-3" />
                              <span>{template.nodes.length} 노드</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Zap className="w-3 h-3" />
                              <span>{template.edges.length} 연결</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Copy className="w-3 h-3" />
                              <span>{template.usageCount} 사용</span>
                            </div>
                          </div>

                          {/* 태그 */}
                          {template.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {template.tags.slice(0, 3).map((tag) => (
                                <span
                                  key={tag}
                                  className="text-xs px-2 py-1 bg-primary/10 text-primary rounded"
                                >
                                  {tag}
                                </span>
                              ))}
                              {template.tags.length > 3 && (
                                <span className="text-xs px-2 py-1 text-muted-foreground">
                                  +{template.tags.length - 3}
                                </span>
                              )}
                            </div>
                          )}

                          {/* 액션 버튼 */}
                          <div className="flex gap-2 pt-2">
                            <Button
                              variant="default"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleLoadTemplate(template);
                              }}
                              className="flex-1 gap-2"
                            >
                              <Eye className="w-3 h-3" />
                              불러오기
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleExportTemplate(template);
                              }}
                            >
                              <Download className="w-3 h-3" />
                            </Button>
                            {template.category === "CUSTOM" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteTemplate(template);
                                }}
                              >
                                <Trash2 className="w-3 h-3 text-destructive" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </DialogContent>

      {/* 템플릿으로 저장 다이얼로그 */}
      <Dialog open={saveAsTemplateOpen} onOpenChange={setSaveAsTemplateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>현재 워크플로우를 템플릿으로 저장</DialogTitle>
            <DialogDescription>
              현재 워크플로우를 템플릿으로 저장하면 나중에 새 프로젝트를 빠르게 생성할 수
              있습니다.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="tpl-name">템플릿 이름</Label>
              <Input
                id="tpl-name"
                placeholder="예: 신제품 개발 프로세스"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="tpl-desc">설명 (선택)</Label>
              <Input
                id="tpl-desc"
                placeholder="템플릿 설명을 입력하세요"
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="tpl-category">카테고리</Label>
              <Select
                value={templateCategory}
                onValueChange={(value) =>
                  setTemplateCategory(value as TemplateCategory)
                }
              >
                <SelectTrigger id="tpl-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CATEGORY_INFO).map(([key, value]) => (
                    <SelectItem key={key} value={key}>
                      {value.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="tpl-tags">태그 (쉼표로 구분)</Label>
              <Input
                id="tpl-tags"
                placeholder="#개발 #프로세스 #워크플로우"
                value={templateTags}
                onChange={(e) => setTemplateTags(e.target.value)}
              />
            </div>

            <Button onClick={handleSaveAsTemplate} className="w-full gap-2">
              <Save className="w-4 h-4" />
              템플릿 저장
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 삭제 확인 AlertDialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>템플릿 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              정말로 "{templateToDelete?.name}" 템플릿을 삭제하시겠습니까?
              <br />
              이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
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
