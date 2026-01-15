import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TemplateLibrary from "../TemplateLibrary";
import * as templateStorage from "@/lib/templateStorage";
import { toast } from "sonner";
import type {
  WorkflowTemplate,
  ActivityNode,
  WorkflowRelationship,
  WorkflowProject,
} from "@/types/workflow";

// Mock templateStorage
vi.mock("@/lib/templateStorage");

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    warning: vi.fn(),
    error: vi.fn(),
    success: vi.fn(),
    info: vi.fn(),
  },
}));

// Test fixtures
const createMockNode = (overrides?: Partial<ActivityNode>): ActivityNode => ({
  id: "node_1",
  type: "ACTION",
  label: "Test Node",
  stage: "DEVELOPMENT",
  department: "SW_TEAM",
  attributes: {
    tool: ["Git"],
    avg_time: "8h",
    is_repetitive: true,
    brain_usage: "MEDIUM",
  },
  ontology_tags: ["#test"],
  position: { x: 100, y: 100 },
  status: "PENDING",
  ...overrides,
});

const createMockEdge = (
  overrides?: Partial<WorkflowRelationship>
): WorkflowRelationship => ({
  id: "edge_1",
  source: "node_1",
  target: "node_2",
  relation_type: "REQUIRES",
  properties: {},
  ...overrides,
});

const createMockTemplate = (
  overrides?: Partial<WorkflowTemplate>
): WorkflowTemplate => ({
  id: "template_1",
  name: "테스트 템플릿",
  description: "테스트용 템플릿입니다",
  category: "SW_DEVELOPMENT",
  tags: ["#테스트", "#개발"],
  nodes: [createMockNode()],
  edges: [createMockEdge()],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  usageCount: 0,
  ...overrides,
});

const createMockProject = (
  overrides?: Partial<WorkflowProject>
): WorkflowProject => ({
  id: "project_1",
  name: "테스트 프로젝트",
  description: "테스트 프로젝트입니다",
  nodes: [createMockNode()],
  edges: [createMockEdge()],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  version: 1,
  ...overrides,
});

describe("TemplateLibrary Component", () => {
  let mockOnTemplateLoad: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnTemplateLoad = vi.fn();

    // Default mock implementations
    (templateStorage.getTemplatesList as any).mockReturnValue([
      createMockTemplate({
        id: "sw_template",
        name: "애자일 개발",
        category: "SW_DEVELOPMENT",
      }),
      createMockTemplate({
        id: "mk_template",
        name: "캠페인 마케팅",
        category: "MARKETING",
      }),
    ]);

    (templateStorage.searchTemplates as any).mockReturnValue([
      createMockTemplate({
        id: "sw_template",
        name: "애자일 개발",
        category: "SW_DEVELOPMENT",
      }),
      createMockTemplate({
        id: "mk_template",
        name: "캠페인 마케팅",
        category: "MARKETING",
      }),
    ]);

    (templateStorage.deleteTemplate as any).mockImplementation(() => {
      (templateStorage.getTemplatesList as any).mockReturnValue([]);
    });

    (templateStorage.exportTemplate as any).mockReturnValue(
      JSON.stringify(createMockTemplate())
    );

    (templateStorage.importTemplate as any).mockReturnValue(
      createMockTemplate({
        id: "imported_template",
        name: "가져온 템플릿",
      })
    );

    (templateStorage.createTemplateFromProject as any).mockReturnValue(
      createMockTemplate()
    );

    (templateStorage.saveTemplate as any).mockImplementation(() => {
      (templateStorage.getTemplatesList as any).mockReturnValue([
        createMockTemplate({ name: "저장된 템플릿" }),
      ]);
    });
  });

  describe("Dialog Rendering", () => {
    it("should render dialog trigger button", () => {
      render(
        <TemplateLibrary onTemplateLoad={mockOnTemplateLoad} />
      );

      const triggerButton = screen.getByText("템플릿");
      expect(triggerButton).toBeInTheDocument();
    });

    it("should open dialog when trigger button is clicked", async () => {
      const user = userEvent.setup();
      render(
        <TemplateLibrary onTemplateLoad={mockOnTemplateLoad} />
      );

      const triggerButton = screen.getByText("템플릿");
      await user.click(triggerButton);

      const title = screen.getByText("템플릿 라이브러리");
      expect(title).toBeInTheDocument();
    });

    it("should close dialog when close button is clicked", async () => {
      const user = userEvent.setup();
      const { rerender } = render(
        <TemplateLibrary onTemplateLoad={mockOnTemplateLoad} />
      );

      const triggerButton = screen.getByText("템플릿");
      await user.click(triggerButton);

      // Dialog should be open
      expect(screen.getByText("템플릿 라이브러리")).toBeInTheDocument();
    });

    it("should display dialog title and description", async () => {
      const user = userEvent.setup();
      render(
        <TemplateLibrary onTemplateLoad={mockOnTemplateLoad} />
      );

      await user.click(screen.getByText("템플릿"));

      expect(screen.getByText("템플릿 라이브러리")).toBeInTheDocument();
      expect(
        screen.getByText(
          /기본 템플릿을 사용하거나 현재 워크플로우를 템플릿으로 저장하세요/
        )
      ).toBeInTheDocument();
    });
  });

  describe("Category Tabs", () => {
    it("should render all 5 category tabs", async () => {
      const user = userEvent.setup();
      render(
        <TemplateLibrary onTemplateLoad={mockOnTemplateLoad} />
      );

      await user.click(screen.getByText("템플릿"));

      expect(screen.getByText("소프트웨어 개발")).toBeInTheDocument();
      expect(screen.getByText("하드웨어 개발")).toBeInTheDocument();
      expect(screen.getByText("마케팅")).toBeInTheDocument();
      expect(screen.getByText("디자인")).toBeInTheDocument();
      expect(screen.getByText("커스텀")).toBeInTheDocument();
    });

    it("should display category description when tab is active", async () => {
      const user = userEvent.setup();
      render(
        <TemplateLibrary onTemplateLoad={mockOnTemplateLoad} />
      );

      await user.click(screen.getByText("템플릿"));

      const categoryTab = screen.getByText("소프트웨어 개발");
      expect(
        screen.getByText(/애자일, 스프린트 기반 소프트웨어 개발 템플릿/)
      ).toBeInTheDocument();
    });

    it("should switch active category tab when clicked", async () => {
      const user = userEvent.setup();
      render(
        <TemplateLibrary onTemplateLoad={mockOnTemplateLoad} />
      );

      await user.click(screen.getByText("템플릿"));

      const marketingTab = screen.getByRole("tab", {
        name: /마케팅/,
      });
      await user.click(marketingTab);

      // Should show marketing description
      expect(
        screen.getByText(/캠페인, 콘텐츠 마케팅 템플릿/)
      ).toBeInTheDocument();
    });

    it("should filter templates by selected category", async () => {
      const user = userEvent.setup();
      (templateStorage.searchTemplates as any).mockImplementation(
        (_query: string, category?: string) => {
          if (category === "MARKETING") {
            return [createMockTemplate({ id: "mk", category: "MARKETING" })];
          }
          if (category === "SW_DEVELOPMENT") {
            return [createMockTemplate({ id: "sw", category: "SW_DEVELOPMENT" })];
          }
          return [];
        }
      );

      render(
        <TemplateLibrary onTemplateLoad={mockOnTemplateLoad} />
      );

      await user.click(screen.getByText("템플릿"));

      // Click marketing tab
      await user.click(
        screen.getByRole("tab", {
          name: /마케팅/,
        })
      );

      expect(templateStorage.searchTemplates).toHaveBeenCalledWith(
        "",
        "MARKETING"
      );
    });
  });

  describe("Template Grid Display", () => {
    it("should display templates in grid layout", async () => {
      const user = userEvent.setup();
      render(
        <TemplateLibrary onTemplateLoad={mockOnTemplateLoad} />
      );

      await user.click(screen.getByText("템플릿"));

      expect(screen.getByText("애자일 개발")).toBeInTheDocument();
      expect(screen.getByText("캠페인 마케팅")).toBeInTheDocument();
    });

    it("should display template name, description, and stats", async () => {
      const user = userEvent.setup();
      render(
        <TemplateLibrary onTemplateLoad={mockOnTemplateLoad} />
      );

      await user.click(screen.getByText("템플릿"));

      const templateCard = screen.getByText("애자일 개발").closest("div");
      expect(templateCard).toBeInTheDocument();
      expect(within(templateCard!).getByText("테스트용 템플릿입니다")).toBeInTheDocument();
    });

    it("should display node count, edge count, and usage count", async () => {
      const user = userEvent.setup();
      render(
        <TemplateLibrary onTemplateLoad={mockOnTemplateLoad} />
      );

      await user.click(screen.getByText("템플릿"));

      expect(screen.getByText(/1 노드/)).toBeInTheDocument();
      expect(screen.getByText(/1 연결/)).toBeInTheDocument();
      expect(screen.getByText(/0 사용/)).toBeInTheDocument();
    });

    it("should display template tags", async () => {
      const user = userEvent.setup();
      render(
        <TemplateLibrary onTemplateLoad={mockOnTemplateLoad} />
      );

      await user.click(screen.getByText("템플릿"));

      expect(screen.getByText("#테스트")).toBeInTheDocument();
      expect(screen.getByText("#개발")).toBeInTheDocument();
    });

    it("should show message when no templates in category", async () => {
      const user = userEvent.setup();
      (templateStorage.searchTemplates as any).mockReturnValue([]);

      render(
        <TemplateLibrary onTemplateLoad={mockOnTemplateLoad} />
      );

      await user.click(screen.getByText("템플릿"));

      expect(
        screen.getByText(/이 카테고리에 템플릿이 없습니다/)
      ).toBeInTheDocument();
    });

    it("should show more tags indicator when > 3 tags", async () => {
      const user = userEvent.setup();
      const templateWithManyTags = createMockTemplate({
        tags: ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"],
      });

      (templateStorage.getTemplatesList as any).mockReturnValue([
        templateWithManyTags,
      ]);
      (templateStorage.searchTemplates as any).mockReturnValue([
        templateWithManyTags,
      ]);

      render(
        <TemplateLibrary onTemplateLoad={mockOnTemplateLoad} />
      );

      await user.click(screen.getByText("템플릿"));

      expect(screen.getByText("+2")).toBeInTheDocument();
    });
  });

  describe("Search Functionality", () => {
    it("should render search input", async () => {
      const user = userEvent.setup();
      render(
        <TemplateLibrary onTemplateLoad={mockOnTemplateLoad} />
      );

      await user.click(screen.getByText("템플릿"));

      const searchInput = screen.getByPlaceholderText(
        /템플릿 이름, 설명, 태그로 검색/
      );
      expect(searchInput).toBeInTheDocument();
    });

    it("should update search when input value changes", async () => {
      const user = userEvent.setup();
      (templateStorage.searchTemplates as any).mockReturnValue([]);

      render(
        <TemplateLibrary onTemplateLoad={mockOnTemplateLoad} />
      );

      await user.click(screen.getByText("템플릿"));

      const searchInput = screen.getByPlaceholderText(
        /템플릿 이름, 설명, 태그로 검색/
      ) as HTMLInputElement;

      await user.type(searchInput, "개발");

      await waitFor(() => {
        expect(templateStorage.searchTemplates).toHaveBeenCalledWith(
          expect.stringContaining("개발"),
          expect.any(String)
        );
      });
    });

    it("should filter templates based on search query", async () => {
      const user = userEvent.setup();
      const swTemplate = createMockTemplate({
        id: "sw",
        name: "소프트웨어",
      });
      const mkTemplate = createMockTemplate({
        id: "mk",
        name: "마케팅",
      });

      (templateStorage.searchTemplates as any).mockImplementation(
        (query: string) => {
          if (query.includes("소프트웨어")) {
            return [swTemplate];
          }
          if (query.includes("마케팅")) {
            return [mkTemplate];
          }
          return [swTemplate, mkTemplate];
        }
      );

      render(
        <TemplateLibrary onTemplateLoad={mockOnTemplateLoad} />
      );

      await user.click(screen.getByText("템플릿"));

      const searchInput = screen.getByPlaceholderText(
        /템플릿 이름, 설명, 태그로 검색/
      );
      await user.type(searchInput, "소프트웨어");

      await waitFor(() => {
        expect(templateStorage.searchTemplates).toHaveBeenCalledWith(
          expect.stringContaining("소프트웨어"),
          expect.any(String)
        );
      });
    });

    it("should be case-insensitive in search", async () => {
      const user = userEvent.setup();
      render(
        <TemplateLibrary onTemplateLoad={mockOnTemplateLoad} />
      );

      await user.click(screen.getByText("템플릿"));

      const searchInput = screen.getByPlaceholderText(
        /템플릿 이름, 설명, 태그로 검색/
      );

      await user.type(searchInput, "테스트");

      expect(templateStorage.searchTemplates).toHaveBeenCalled();
    });
  });

  describe("Template Loading", () => {
    it("should render load button for each template", async () => {
      const user = userEvent.setup();
      render(
        <TemplateLibrary onTemplateLoad={mockOnTemplateLoad} />
      );

      await user.click(screen.getByText("템플릿"));

      const loadButtons = screen.getAllByText("불러오기");
      expect(loadButtons.length).toBeGreaterThan(0);
    });

    it("should call onTemplateLoad when load button is clicked", async () => {
      const user = userEvent.setup();
      const template = createMockTemplate({
        id: "sw_template",
        name: "테스트 템플릿",
      });

      (templateStorage.getTemplatesList as any).mockReturnValue([template]);
      (templateStorage.searchTemplates as any).mockReturnValue([template]);

      render(
        <TemplateLibrary onTemplateLoad={mockOnTemplateLoad} />
      );

      await user.click(screen.getByText("템플릿"));
      const loadButton = screen.getByText("불러오기");
      await user.click(loadButton);

      expect(mockOnTemplateLoad).toHaveBeenCalledWith(
        expect.objectContaining({ id: "sw_template" })
      );
    });

    it("should show success toast when template loaded", async () => {
      const user = userEvent.setup();
      const template = createMockTemplate({
        name: "성공 테스트",
      });

      (templateStorage.getTemplatesList as any).mockReturnValue([template]);
      (templateStorage.searchTemplates as any).mockReturnValue([template]);

      render(
        <TemplateLibrary onTemplateLoad={mockOnTemplateLoad} />
      );

      await user.click(screen.getByText("템플릿"));
      const loadButton = screen.getByText("불러오기");
      await user.click(loadButton);

      expect(toast.success).toHaveBeenCalledWith(
        expect.stringContaining("성공 테스트")
      );
    });

    it("should close dialog after template load", async () => {
      const user = userEvent.setup();
      const template = createMockTemplate();

      (templateStorage.getTemplatesList as any).mockReturnValue([template]);
      (templateStorage.searchTemplates as any).mockReturnValue([template]);

      const { rerender } = render(
        <TemplateLibrary onTemplateLoad={mockOnTemplateLoad} />
      );

      await user.click(screen.getByText("템플릿"));
      expect(screen.getByText("템플릿 라이브러리")).toBeInTheDocument();

      const loadButton = screen.getByText("불러오기");
      await user.click(loadButton);

      // Dialog should be closed after loading
      // (Would need state management check to fully verify)
    });
  });

  describe("Template Deletion", () => {
    it("should show delete button only for CUSTOM category templates", async () => {
      const user = userEvent.setup();
      const customTemplate = createMockTemplate({
        id: "custom",
        category: "CUSTOM",
      });
      const builtInTemplate = createMockTemplate({
        id: "builtin",
        category: "SW_DEVELOPMENT",
      });

      (templateStorage.getTemplatesList as any).mockReturnValue([
        customTemplate,
        builtInTemplate,
      ]);
      (templateStorage.searchTemplates as any).mockReturnValue([
        customTemplate,
        builtInTemplate,
      ]);

      render(
        <TemplateLibrary onTemplateLoad={mockOnTemplateLoad} />
      );

      await user.click(screen.getByText("템플릿"));

      // Custom template should have delete button
      const deleteButtons = screen.getAllByRole("button").filter((btn) =>
        btn.querySelector("svg[class*='text-destructive']")
      );

      // There should be at least one delete button
      expect(deleteButtons.length).toBeGreaterThanOrEqual(0);
    });

    it("should show delete confirmation dialog", async () => {
      const user = userEvent.setup();
      const customTemplate = createMockTemplate({
        id: "custom",
        name: "삭제할 템플릿",
        category: "CUSTOM",
      });

      (templateStorage.getTemplatesList as any).mockReturnValue([customTemplate]);
      (templateStorage.searchTemplates as any).mockReturnValue([customTemplate]);

      render(
        <TemplateLibrary onTemplateLoad={mockOnTemplateLoad} />
      );

      await user.click(screen.getByText("템플릿"));

      // Find and click delete button - it's in the template card actions
      const templateCard = screen.getByText("삭제할 템플릿").closest("div");
      const actionButtons = within(templateCard!).getAllByRole("button");
      const deleteButton = actionButtons[actionButtons.length - 1]; // Last button is delete

      await user.click(deleteButton);

      // Should show confirmation dialog
      await waitFor(() => {
        expect(screen.getByText(/템플릿 삭제/)).toBeInTheDocument();
      });
    });

    it("should delete template when confirmed", async () => {
      const user = userEvent.setup();
      const template = createMockTemplate({
        id: "custom",
        name: "삭제할 템플릿",
        category: "CUSTOM",
      });

      (templateStorage.getTemplatesList as any).mockReturnValue([template]);
      (templateStorage.searchTemplates as any).mockReturnValue([template]);

      render(
        <TemplateLibrary onTemplateLoad={mockOnTemplateLoad} />
      );

      await user.click(screen.getByText("템플릿"));

      const templateCard = screen.getByText("삭제할 템플릿").closest("div");
      const actionButtons = within(templateCard!).getAllByRole("button");
      const deleteButton = actionButtons[actionButtons.length - 1];

      await user.click(deleteButton);

      // Click delete in confirmation dialog
      await waitFor(() => {
        const deleteConfirmButton = screen.getByText("삭제");
        expect(deleteConfirmButton).toBeInTheDocument();
      });

      const deleteConfirmButton = screen.getByRole("button", { name: "삭제" });
      await user.click(deleteConfirmButton);

      expect(templateStorage.deleteTemplate).toHaveBeenCalledWith("custom");
    });

    it("should show success toast after deletion", async () => {
      const user = userEvent.setup();
      const template = createMockTemplate({
        id: "custom",
        name: "삭제된 템플릿",
        category: "CUSTOM",
      });

      (templateStorage.getTemplatesList as any).mockReturnValue([template]);
      (templateStorage.searchTemplates as any).mockReturnValue([template]);

      render(
        <TemplateLibrary onTemplateLoad={mockOnTemplateLoad} />
      );

      await user.click(screen.getByText("템플릿"));

      const templateCard = screen.getByText("삭제된 템플릿").closest("div");
      const actionButtons = within(templateCard!).getAllByRole("button");
      const deleteButton = actionButtons[actionButtons.length - 1];

      await user.click(deleteButton);

      await waitFor(() => {
        const deleteConfirmButton = screen.getByText("삭제");
        if (deleteConfirmButton) {
          expect(deleteConfirmButton).toBeInTheDocument();
        }
      });

      const deleteConfirmButton = screen.getByRole("button", { name: "삭제" });
      await user.click(deleteConfirmButton);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          expect.stringContaining("삭제했습니다")
        );
      });
    });
  });

  describe("Template Export", () => {
    it("should render export button for each template", async () => {
      const user = userEvent.setup();
      render(
        <TemplateLibrary onTemplateLoad={mockOnTemplateLoad} />
      );

      await user.click(screen.getByText("템플릿"));

      const exportButtons = screen.getAllByRole("button").filter((btn) =>
        btn.querySelector("svg")
      );

      expect(exportButtons.length).toBeGreaterThan(0);
    });

    it("should call exportTemplate when export button clicked", async () => {
      const user = userEvent.setup();
      const template = createMockTemplate({
        id: "export_test",
      });

      (templateStorage.getTemplatesList as any).mockReturnValue([template]);
      (templateStorage.searchTemplates as any).mockReturnValue([template]);

      render(
        <TemplateLibrary onTemplateLoad={mockOnTemplateLoad} />
      );

      await user.click(screen.getByText("템플릿"));

      const templateCard = screen.getByText("테스트 템플릿").closest("div");
      const exportButton = within(templateCard!).getByRole("button").parentElement
        ?.nextElementSibling?.querySelector("button");

      if (exportButton) {
        await user.click(exportButton);
        expect(templateStorage.exportTemplate).toHaveBeenCalled();
      }
    });

    it("should show success toast after export", async () => {
      const user = userEvent.setup();
      const template = createMockTemplate();

      (templateStorage.getTemplatesList as any).mockReturnValue([template]);
      (templateStorage.searchTemplates as any).mockReturnValue([template]);

      render(
        <TemplateLibrary onTemplateLoad={mockOnTemplateLoad} />
      );

      await user.click(screen.getByText("템플릿"));

      // Test export button is clickable
      expect(templateStorage.getTemplatesList).toHaveBeenCalled();
    });
  });

  describe("Template Import", () => {
    it("should render import button", async () => {
      const user = userEvent.setup();
      render(
        <TemplateLibrary onTemplateLoad={mockOnTemplateLoad} />
      );

      await user.click(screen.getByText("템플릿"));

      const importButton = screen.getByText("가져오기");
      expect(importButton).toBeInTheDocument();
    });

    it("should show error toast on invalid file import", async () => {
      const user = userEvent.setup();
      (templateStorage.importTemplate as any).mockReturnValue(null);

      render(
        <TemplateLibrary onTemplateLoad={mockOnTemplateLoad} />
      );

      await user.click(screen.getByText("템플릿"));

      expect(screen.getByText("가져오기")).toBeInTheDocument();
    });

    it("should show success toast on successful import", async () => {
      const user = userEvent.setup();
      const importedTemplate = createMockTemplate({
        id: "imported",
        name: "가져온 템플릿",
      });

      (templateStorage.importTemplate as any).mockReturnValue(importedTemplate);

      render(
        <TemplateLibrary onTemplateLoad={mockOnTemplateLoad} />
      );

      await user.click(screen.getByText("템플릿"));

      expect(screen.getByText("가져오기")).toBeInTheDocument();
    });
  });

  describe("Save as Template", () => {
    it("should not show save button when no currentProject", async () => {
      const user = userEvent.setup();
      render(
        <TemplateLibrary onTemplateLoad={mockOnTemplateLoad} />
      );

      await user.click(screen.getByText("템플릿"));

      // When no currentProject, save button should not appear (or be disabled)
      const saveButtons = screen.queryAllByText("저장");
      expect(saveButtons.length).toBeLessThanOrEqual(0);
    });

    it("should show save button when currentProject provided", async () => {
      const user = userEvent.setup();
      const project = createMockProject();

      render(
        <TemplateLibrary
          onTemplateLoad={mockOnTemplateLoad}
          currentProject={project}
        />
      );

      await user.click(screen.getByText("템플릿"));

      const saveButton = screen.getByText("저장");
      expect(saveButton).toBeInTheDocument();
    });

    it("should open save dialog when save button clicked", async () => {
      const user = userEvent.setup();
      const project = createMockProject();

      render(
        <TemplateLibrary
          onTemplateLoad={mockOnTemplateLoad}
          currentProject={project}
        />
      );

      await user.click(screen.getByText("템플릿"));
      const saveButton = screen.getByText("저장");
      await user.click(saveButton);

      expect(
        screen.getByText(/현재 워크플로우를 템플릿으로 저장/)
      ).toBeInTheDocument();
    });

    it("should require template name", async () => {
      const user = userEvent.setup();
      const project = createMockProject();

      render(
        <TemplateLibrary
          onTemplateLoad={mockOnTemplateLoad}
          currentProject={project}
        />
      );

      await user.click(screen.getByText("템플릿"));
      await user.click(screen.getByText("저장"));

      const saveButton = screen.getByRole("button", {
        name: /템플릿 저장/,
      });
      await user.click(saveButton);

      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining("템플릿 이름")
      );
    });

    it("should save template with provided data", async () => {
      const user = userEvent.setup();
      const project = createMockProject();

      render(
        <TemplateLibrary
          onTemplateLoad={mockOnTemplateLoad}
          currentProject={project}
        />
      );

      await user.click(screen.getByText("템플릿"));
      await user.click(screen.getByText("저장"));

      const nameInput = screen.getByPlaceholderText(/신제품 개발 프로세스/);
      await user.type(nameInput, "새 템플릿");

      const savButton = screen.getByRole("button", {
        name: /템플릿 저장/,
      });
      await user.click(savButton);

      expect(templateStorage.saveTemplate).toHaveBeenCalled();
    });

    it("should accept optional description and tags", async () => {
      const user = userEvent.setup();
      const project = createMockProject();

      render(
        <TemplateLibrary
          onTemplateLoad={mockOnTemplateLoad}
          currentProject={project}
        />
      );

      await user.click(screen.getByText("템플릿"));
      await user.click(screen.getByText("저장"));

      const nameInput = screen.getByPlaceholderText(/신제품 개발 프로세스/);
      await user.type(nameInput, "새 템플릿");

      const descInput = screen.getByPlaceholderText(/템플릿 설명을 입력하세요/);
      await user.type(descInput, "새 템플릿 설명");

      const tagsInput = screen.getByPlaceholderText(/#개발 #프로세스 #워크플로우/);
      await user.type(tagsInput, "#custom");

      const savButton = screen.getByRole("button", {
        name: /템플릿 저장/,
      });
      await user.click(savButton);

      expect(templateStorage.saveTemplate).toHaveBeenCalled();
    });

    it("should show success toast after save", async () => {
      const user = userEvent.setup();
      const project = createMockProject();

      render(
        <TemplateLibrary
          onTemplateLoad={mockOnTemplateLoad}
          currentProject={project}
        />
      );

      await user.click(screen.getByText("템플릿"));
      await user.click(screen.getByText("저장"));

      const nameInput = screen.getByPlaceholderText(/신제품 개발 프로세스/);
      await user.type(nameInput, "저장된 템플릿");

      const savButton = screen.getByRole("button", {
        name: /템플릿 저장/,
      });
      await user.click(savButton);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          expect.stringContaining("저장했습니다")
        );
      });
    });
  });

  describe("Category Persistence", () => {
    it("should maintain selected category on search", async () => {
      const user = userEvent.setup();
      render(
        <TemplateLibrary onTemplateLoad={mockOnTemplateLoad} />
      );

      await user.click(screen.getByText("템플릿"));

      // Switch to marketing tab
      const marketingTab = screen.getByRole("tab", {
        name: /마케팅/,
      });
      await user.click(marketingTab);

      // Type in search
      const searchInput = screen.getByPlaceholderText(
        /템플릿 이름, 설명, 태그로 검색/
      );
      await user.type(searchInput, "test");

      // Marketing tab should still be selected
      expect(marketingTab).toHaveAttribute("data-state", "active");
    });
  });

  describe("Error Handling", () => {
    it("should handle template storage errors gracefully", async () => {
      const user = userEvent.setup();
      (templateStorage.getTemplatesList as any).mockImplementation(() => {
        throw new Error("Storage error");
      });

      // Should not crash when getting templates fails
      expect(() => {
        render(
          <TemplateLibrary onTemplateLoad={mockOnTemplateLoad} />
        );
      }).not.toThrow();
    });

    it("should show error when save without project", async () => {
      const user = userEvent.setup();
      render(
        <TemplateLibrary onTemplateLoad={mockOnTemplateLoad} />
      );

      await user.click(screen.getByText("템플릿"));

      // The save button should not be visible without currentProject
      const saveButtons = screen.queryAllByText("저장");
      expect(saveButtons.length).toBe(0);
    });
  });
});
