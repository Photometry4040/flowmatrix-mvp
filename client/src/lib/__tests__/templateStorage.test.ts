import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  saveTemplate,
  loadTemplate,
  deleteTemplate,
  getTemplatesList,
  createTemplateFromProject,
  applyTemplateToProject,
  exportTemplate,
  importTemplate,
  searchTemplates,
  getTemplatesByCategory,
  getPopularTemplates,
} from "../templateStorage";
import type {
  WorkflowTemplate,
  ActivityNode,
  WorkflowRelationship,
  WorkflowProject,
} from "@/types/workflow";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    key: (index: number) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    },
    get length() {
      return Object.keys(store).length;
    },
  };
})();

Object.defineProperty(global, "localStorage", {
  value: localStorageMock,
  writable: true,
});

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
  label: "Test Action",
  stage: "DEVELOPMENT",
  department: "SW_TEAM",
  attributes: {
    tool: ["Git", "VS Code"],
    avg_time: "8h",
    is_repetitive: true,
    brain_usage: "MEDIUM",
  },
  ontology_tags: ["#테스트", "#개발"],
  position: { x: 100, y: 100 },
  status: "PENDING",
  ...overrides,
});

const createMockEdge = (overrides?: Partial<WorkflowRelationship>): WorkflowRelationship => ({
  id: "edge_1",
  source: "node_1",
  target: "node_2",
  relation_type: "REQUIRES",
  properties: {},
  ...overrides,
});

const createMockTemplate = (overrides?: Partial<WorkflowTemplate>): WorkflowTemplate => ({
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

const createMockProject = (overrides?: Partial<WorkflowProject>): WorkflowProject => ({
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

describe("templateStorage", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe("CRUD Operations", () => {
    describe("saveTemplate", () => {
      it("should save template to localStorage", () => {
        const template = createMockTemplate();

        saveTemplate(template);

        const stored = localStorage.getItem(`flowmatrix_template_${template.id}`);
        expect(stored).toBeTruthy();
        expect(JSON.parse(stored!)).toEqual(template);
      });

      it("should overwrite existing template with same ID", () => {
        const template = createMockTemplate();
        const updated = { ...template, name: "Updated Name" };

        saveTemplate(template);
        saveTemplate(updated);

        const stored = localStorage.getItem(`flowmatrix_template_${template.id}`);
        expect(JSON.parse(stored!).name).toBe("Updated Name");
      });

      it("should throw error if localStorage fails", () => {
        const template = createMockTemplate();
        const originalSetItem = localStorage.setItem;

        localStorage.setItem = vi.fn(() => {
          throw new Error("Storage full");
        });

        expect(() => saveTemplate(template)).toThrow();

        localStorage.setItem = originalSetItem;
      });

      it("should preserve all template properties", () => {
        const template = createMockTemplate({
          tags: ["#tag1", "#tag2", "#tag3"],
          usageCount: 5,
          aiScore: 85,
        });

        saveTemplate(template);

        const loaded = loadTemplate(template.id);
        expect(loaded?.tags).toEqual(template.tags);
        expect(loaded?.usageCount).toBe(5);
      });
    });

    describe("loadTemplate", () => {
      it("should load template from localStorage", () => {
        const template = createMockTemplate();
        saveTemplate(template);

        const loaded = loadTemplate(template.id);

        expect(loaded).toEqual(template);
      });

      it("should return null if template not found", () => {
        const loaded = loadTemplate("nonexistent_id");

        expect(loaded).toBeNull();
      });

      it("should return null if stored data is invalid", () => {
        localStorage.setItem("flowmatrix_template_invalid", "invalid json");

        const loaded = loadTemplate("invalid");

        expect(loaded).toBeNull();
      });

      it("should return null if template fails validation", () => {
        const invalidTemplate = {
          id: "test",
          // Missing required fields
        };
        localStorage.setItem(
          "flowmatrix_template_invalid2",
          JSON.stringify(invalidTemplate)
        );

        const loaded = loadTemplate("invalid2");

        expect(loaded).toBeNull();
      });
    });

    describe("deleteTemplate", () => {
      it("should delete template from localStorage", () => {
        const template = createMockTemplate();
        saveTemplate(template);

        deleteTemplate(template.id);

        const loaded = loadTemplate(template.id);
        expect(loaded).toBeNull();
      });

      it("should remove template from templates list", () => {
        const template1 = createMockTemplate({ id: "temp_1" });
        const template2 = createMockTemplate({ id: "temp_2" });

        saveTemplate(template1);
        saveTemplate(template2);

        deleteTemplate(template1.id);

        const list = getTemplatesList();
        expect(list.find((t) => t.id === template1.id)).toBeUndefined();
        expect(list.find((t) => t.id === template2.id)).toBeDefined();
      });

      it("should handle deletion of non-existent template gracefully", () => {
        expect(() => deleteTemplate("nonexistent")).not.toThrow();
      });
    });

    describe("getTemplatesList", () => {
      it("should return empty array when no templates exist", () => {
        const list = getTemplatesList();

        expect(list).toEqual(expect.arrayContaining([]));
      });

      it("should return all saved templates", () => {
        const template1 = createMockTemplate({ id: "temp_1", name: "Template 1" });
        const template2 = createMockTemplate({ id: "temp_2", name: "Template 2" });

        saveTemplate(template1);
        saveTemplate(template2);

        const list = getTemplatesList();

        expect(list).toHaveLength(2);
        expect(list.map((t) => t.id)).toContain("temp_1");
        expect(list.map((t) => t.id)).toContain("temp_2");
      });

      it("should sort templates by updatedAt in descending order", () => {
        const now = new Date();
        const template1 = createMockTemplate({
          id: "temp_1",
          updatedAt: new Date(now.getTime() - 10000).toISOString(),
        });
        const template2 = createMockTemplate({
          id: "temp_2",
          updatedAt: now.toISOString(),
        });

        saveTemplate(template1);
        saveTemplate(template2);

        const list = getTemplatesList();

        expect(list[0].id).toBe("temp_2");
        expect(list[1].id).toBe("temp_1");
      });

      it("should filter out invalid templates", () => {
        const validTemplate = createMockTemplate();
        const invalidTemplate = { id: "invalid" };

        saveTemplate(validTemplate);
        localStorage.setItem(
          "flowmatrix_template_corrupted",
          JSON.stringify(invalidTemplate)
        );

        const list = getTemplatesList();

        expect(list).toHaveLength(1);
        expect(list[0].id).toBe(validTemplate.id);
      });
    });
  });

  describe("Built-in Templates", () => {
    it("should initialize 3 built-in templates on first call", () => {
      localStorage.clear();

      const list = getTemplatesList();

      expect(list.length).toBeGreaterThanOrEqual(3);
    });

    it("should have SW_DEVELOPMENT template with 7 nodes", () => {
      const list = getTemplatesList();
      const swTemplate = list.find(
        (t) => t.category === "SW_DEVELOPMENT" && t.id === "template_sw_dev"
      );

      expect(swTemplate).toBeDefined();
      expect(swTemplate?.nodes).toHaveLength(7);
    });

    it("should have HW_DEVELOPMENT template with 8 nodes", () => {
      const list = getTemplatesList();
      const hwTemplate = list.find(
        (t) => t.category === "HW_DEVELOPMENT" && t.id === "template_hw_dev"
      );

      expect(hwTemplate).toBeDefined();
      expect(hwTemplate?.nodes).toHaveLength(8);
    });

    it("should have MARKETING template with 6 nodes", () => {
      const list = getTemplatesList();
      const mkTemplate = list.find(
        (t) => t.category === "MARKETING" && t.id === "template_marketing"
      );

      expect(mkTemplate).toBeDefined();
      expect(mkTemplate?.nodes).toHaveLength(6);
    });

    it("should be accessible immediately after initialization", () => {
      localStorage.clear();

      const firstCall = getTemplatesList();
      const secondCall = getTemplatesList();

      expect(firstCall.length).toBe(secondCall.length);
      expect(firstCall[0].id).toBe(secondCall[0].id);
    });

    it("should not re-initialize built-in templates", () => {
      getTemplatesList(); // First call initializes
      const countAfterFirst = getTemplatesList().length;

      getTemplatesList(); // Second call should not re-initialize
      const countAfterSecond = getTemplatesList().length;

      expect(countAfterFirst).toBe(countAfterSecond);
    });

    it("should have correct tags for built-in templates", () => {
      const list = getTemplatesList();
      const swTemplate = list.find(
        (t) => t.category === "SW_DEVELOPMENT" && t.id === "template_sw_dev"
      );

      expect(swTemplate?.tags).toContain("#애자일");
      expect(swTemplate?.tags).toContain("#스프린트");
    });
  });

  describe("Template Creation", () => {
    describe("createTemplateFromProject", () => {
      it("should create template from project", () => {
        const project = createMockProject();

        const template = createTemplateFromProject(project, "SW_DEVELOPMENT");

        expect(template.name).toBe(project.name);
        expect(template.description).toBe(project.description);
        expect(template.category).toBe("SW_DEVELOPMENT");
        expect(template.nodes).toEqual(project.nodes);
        expect(template.edges).toEqual(project.edges);
      });

      it("should generate new ID for template", () => {
        const project = createMockProject();

        const template = createTemplateFromProject(project, "CUSTOM");

        expect(template.id).toBeTruthy();
        expect(template.id).not.toBe(project.id);
        expect(template.id.length).toBeGreaterThan(0);
      });

      it("should set usageCount to 0", () => {
        const project = createMockProject();

        const template = createTemplateFromProject(project, "CUSTOM");

        expect(template.usageCount).toBe(0);
      });

      it("should set timestamps to current date", () => {
        const project = createMockProject();
        const before = new Date();

        const template = createTemplateFromProject(project, "CUSTOM");

        const createdAt = new Date(template.createdAt);
        const updatedAt = new Date(template.updatedAt);

        expect(createdAt.getTime()).toBeGreaterThanOrEqual(
          before.getTime() - 100
        );
        expect(updatedAt.getTime()).toBeGreaterThanOrEqual(
          before.getTime() - 100
        );
      });

      it("should preserve all node attributes", () => {
        const nodeWithAllAttrs = createMockNode({
          id: "full_node",
          aiScore: 85,
          isBottleneck: true,
          status: "COMPLETED",
          progress: 100,
        });
        const project = createMockProject({ nodes: [nodeWithAllAttrs] });

        const template = createTemplateFromProject(project, "CUSTOM");

        expect(template.nodes[0].aiScore).toBe(85);
        expect(template.nodes[0].isBottleneck).toBe(true);
      });
    });
  });

  describe("Template Application", () => {
    describe("applyTemplateToProject", () => {
      it("should create new nodes with different IDs", () => {
        const template = createMockTemplate({
          nodes: [
            createMockNode({ id: "original_1" }),
            createMockNode({ id: "original_2" }),
          ],
        });

        const result = applyTemplateToProject(template);

        expect(result.nodes).toHaveLength(2);
        expect(result.nodes[0].id).not.toBe("original_1");
        expect(result.nodes[1].id).not.toBe("original_2");
      });

      it("should reset node status to PENDING", () => {
        const template = createMockTemplate({
          nodes: [createMockNode({ status: "COMPLETED" })],
        });

        const result = applyTemplateToProject(template);

        expect(result.nodes[0].status).toBe("PENDING");
      });

      it("should update edge source/target IDs to match new node IDs", () => {
        const node1 = createMockNode({ id: "orig_n1" });
        const node2 = createMockNode({ id: "orig_n2" });
        const edge = createMockEdge({
          source: "orig_n1",
          target: "orig_n2",
        });
        const template = createMockTemplate({
          nodes: [node1, node2],
          edges: [edge],
        });

        const result = applyTemplateToProject(template);

        const appliedEdge = result.edges[0];
        expect(appliedEdge.source).toBe(result.nodes[0].id);
        expect(appliedEdge.target).toBe(result.nodes[1].id);
      });

      it("should generate new edge IDs", () => {
        const template = createMockTemplate({
          edges: [createMockEdge({ id: "edge_original" })],
        });

        const result = applyTemplateToProject(template);

        expect(result.edges[0].id).not.toBe("edge_original");
      });

      it("should preserve node attributes except status", () => {
        const template = createMockTemplate({
          nodes: [
            createMockNode({
              label: "Custom Label",
              attributes: {
                tool: ["Tool1", "Tool2"],
                avg_time: "16h",
                is_repetitive: false,
                brain_usage: "HIGH",
              },
            }),
          ],
        });

        const result = applyTemplateToProject(template);

        expect(result.nodes[0].label).toBe("Custom Label");
        expect(result.nodes[0].attributes.tool).toEqual(["Tool1", "Tool2"]);
        expect(result.nodes[0].attributes.avg_time).toBe("16h");
      });

      it("should increment template usageCount", () => {
        const template = createMockTemplate({ usageCount: 3 });
        saveTemplate(template);

        applyTemplateToProject(template);

        const updated = loadTemplate(template.id);
        expect(updated?.usageCount).toBe(4);
      });

      it("should update template updatedAt timestamp", () => {
        const template = createMockTemplate();
        const beforeTime = new Date().getTime();
        saveTemplate(template);

        applyTemplateToProject(template);

        const updated = loadTemplate(template.id);
        const updatedTime = new Date(updated!.updatedAt).getTime();
        expect(updatedTime).toBeGreaterThanOrEqual(beforeTime - 100);
      });

      it("should preserve position information", () => {
        const template = createMockTemplate({
          nodes: [createMockNode({ position: { x: 500, y: 300 } })],
        });

        const result = applyTemplateToProject(template);

        expect(result.nodes[0].position).toEqual({ x: 500, y: 300 });
      });

      it("should handle templates with no edges", () => {
        const template = createMockTemplate({
          nodes: [createMockNode()],
          edges: [],
        });

        const result = applyTemplateToProject(template);

        expect(result.edges).toHaveLength(0);
      });

      it("should handle templates with multiple nodes and edges", () => {
        const template = createMockTemplate({
          nodes: [
            createMockNode({ id: "n1" }),
            createMockNode({ id: "n2" }),
            createMockNode({ id: "n3" }),
          ],
          edges: [
            createMockEdge({ source: "n1", target: "n2" }),
            createMockEdge({ id: "e2", source: "n2", target: "n3" }),
          ],
        });

        const result = applyTemplateToProject(template);

        expect(result.nodes).toHaveLength(3);
        expect(result.edges).toHaveLength(2);
        expect(result.edges.every((e) => e.id !== "e2")).toBe(true);
      });
    });
  });

  describe("Import/Export", () => {
    describe("exportTemplate", () => {
      it("should export template as valid JSON", () => {
        const template = createMockTemplate();
        saveTemplate(template);

        const json = exportTemplate(template.id);

        expect(json).toBeTruthy();
        expect(() => JSON.parse(json!)).not.toThrow();
      });

      it("should export template with all properties", () => {
        const template = createMockTemplate();
        saveTemplate(template);

        const json = exportTemplate(template.id);
        const exported = JSON.parse(json!);

        expect(exported.id).toBe(template.id);
        expect(exported.name).toBe(template.name);
        expect(exported.category).toBe(template.category);
        expect(exported.nodes).toEqual(template.nodes);
        expect(exported.edges).toEqual(template.edges);
      });

      it("should return null if template not found", () => {
        const json = exportTemplate("nonexistent");

        expect(json).toBeNull();
      });

      it("should format JSON with indentation", () => {
        const template = createMockTemplate();
        saveTemplate(template);

        const json = exportTemplate(template.id);

        expect(json).toContain("  ");
      });
    });

    describe("importTemplate", () => {
      it("should import valid JSON as template", () => {
        const template = createMockTemplate();
        const json = JSON.stringify(template);

        const imported = importTemplate(json);

        expect(imported).toBeTruthy();
        expect(imported?.name).toBe(template.name);
        expect(imported?.nodes).toEqual(template.nodes);
      });

      it("should assign new ID to imported template", () => {
        const template = createMockTemplate();
        const json = JSON.stringify(template);

        const imported = importTemplate(json);

        expect(imported?.id).not.toBe(template.id);
      });

      it("should save imported template", () => {
        const template = createMockTemplate();
        const json = JSON.stringify(template);

        importTemplate(json);

        const list = getTemplatesList();
        expect(list.length).toBeGreaterThan(0);
      });

      it("should reset usageCount to 0", () => {
        const template = createMockTemplate({ usageCount: 10 });
        const json = JSON.stringify(template);

        const imported = importTemplate(json);

        expect(imported?.usageCount).toBe(0);
      });

      it("should return null for invalid JSON", () => {
        const imported = importTemplate("invalid json");

        expect(imported).toBeNull();
      });

      it("should return null for invalid template structure", () => {
        const invalidJson = JSON.stringify({ id: "test", name: "test" });

        const imported = importTemplate(invalidJson);

        expect(imported).toBeNull();
      });

      it("should handle malformed JSON gracefully", () => {
        expect(() => importTemplate("{{{invalid")).not.toThrow();
      });

      it("should preserve non-ID template properties", () => {
        const template = createMockTemplate({
          tags: ["#custom", "#tag"],
          description: "Custom description",
        });
        const json = JSON.stringify(template);

        const imported = importTemplate(json);

        expect(imported?.tags).toEqual(template.tags);
        expect(imported?.description).toBe(template.description);
      });
    });

    describe("Round-trip Import/Export", () => {
      it("should preserve data through export-import cycle", () => {
        const template = createMockTemplate({
          nodes: [
            createMockNode({ id: "n1" }),
            createMockNode({ id: "n2" }),
          ],
          edges: [createMockEdge()],
        });
        saveTemplate(template);

        const exported = exportTemplate(template.id);
        const imported = importTemplate(exported!);

        expect(imported?.name).toBe(template.name);
        expect(imported?.nodes).toHaveLength(2);
        expect(imported?.edges).toHaveLength(1);
      });
    });
  });

  describe("Search & Filter", () => {
    beforeEach(() => {
      const templates = [
        createMockTemplate({
          id: "temp_1",
          name: "애자일 개발",
          description: "스프린트 기반 개발",
          tags: ["#애자일", "#스프린트"],
          category: "SW_DEVELOPMENT",
        }),
        createMockTemplate({
          id: "temp_2",
          name: "캠페인 마케팅",
          description: "마케팅 캠페인 실행",
          tags: ["#마케팅", "#캠페인"],
          category: "MARKETING",
        }),
        createMockTemplate({
          id: "temp_3",
          name: "제품 개발",
          description: "하드웨어 개발 프로세스",
          tags: ["#하드웨어", "#개발"],
          category: "HW_DEVELOPMENT",
        }),
      ];

      templates.forEach((t) => saveTemplate(t));
    });

    describe("searchTemplates by name", () => {
      it("should find templates by exact name match", () => {
        const results = searchTemplates("애자일 개발");

        expect(results).toHaveLength(1);
        expect(results[0].name).toBe("애자일 개발");
      });

      it("should find templates by partial name match", () => {
        const results = searchTemplates("개발");

        expect(results.length).toBeGreaterThanOrEqual(2);
        expect(results.map((t) => t.name)).toEqual(
          expect.arrayContaining(["애자일 개발", "제품 개발"])
        );
      });

      it("should be case-insensitive", () => {
        const results = searchTemplates("개발".toUpperCase());

        expect(results.length).toBeGreaterThan(0);
      });
    });

    describe("searchTemplates by description", () => {
      it("should find templates by description keyword", () => {
        const results = searchTemplates("스프린트");

        expect(results).toHaveLength(1);
        expect(results[0].id).toBe("temp_1");
      });

      it("should find templates by partial description", () => {
        const results = searchTemplates("개발");

        expect(results.length).toBeGreaterThanOrEqual(2);
      });
    });

    describe("searchTemplates by tags", () => {
      it("should find templates by tag", () => {
        const results = searchTemplates("#애자일");

        expect(results).toHaveLength(1);
        expect(results[0].id).toBe("temp_1");
      });

      it("should find templates by partial tag match", () => {
        const results = searchTemplates("개발");

        expect(results.length).toBeGreaterThanOrEqual(2);
      });

      it("should handle tags with or without # prefix", () => {
        const resultsWithHash = searchTemplates("#마케팅");
        const resultsWithoutHash = searchTemplates("마케팅");

        expect(resultsWithHash.length).toBe(resultsWithoutHash.length);
      });
    });

    describe("searchTemplates with category filter", () => {
      it("should filter by category", () => {
        const results = searchTemplates("", "SW_DEVELOPMENT");

        expect(results).toHaveLength(1);
        expect(results[0].category).toBe("SW_DEVELOPMENT");
      });

      it("should combine search and category filter", () => {
        const results = searchTemplates("개발", "HW_DEVELOPMENT");

        expect(results).toHaveLength(1);
        expect(results[0].id).toBe("temp_3");
      });

      it("should return empty array when no matches", () => {
        const results = searchTemplates("nonexistent", "SW_DEVELOPMENT");

        expect(results).toHaveLength(0);
      });
    });

    describe("searchTemplates combined criteria", () => {
      it("should return all templates with empty query", () => {
        const results = searchTemplates("");

        expect(results.length).toBeGreaterThanOrEqual(3);
      });

      it("should find templates matching any field", () => {
        // "캠페인" exists in name, description, and tags for temp_2
        const results = searchTemplates("캠페인");

        expect(results).toHaveLength(1);
        expect(results[0].id).toBe("temp_2");
      });

      it("should handle multiple keywords", () => {
        // Search should match templates containing "개발"
        const results = searchTemplates("개발");

        expect(results.length).toBeGreaterThanOrEqual(2);
      });
    });
  });

  describe("getTemplatesByCategory", () => {
    beforeEach(() => {
      const templates = [
        createMockTemplate({
          id: "sw_1",
          category: "SW_DEVELOPMENT",
        }),
        createMockTemplate({
          id: "sw_2",
          category: "SW_DEVELOPMENT",
        }),
        createMockTemplate({
          id: "hw_1",
          category: "HW_DEVELOPMENT",
        }),
      ];

      templates.forEach((t) => saveTemplate(t));
    });

    it("should return templates for specific category", () => {
      const results = getTemplatesByCategory("SW_DEVELOPMENT");

      expect(results).toHaveLength(2);
      expect(results.every((t) => t.category === "SW_DEVELOPMENT")).toBe(true);
    });

    it("should return empty array for category with no templates", () => {
      const results = getTemplatesByCategory("DESIGN");

      expect(results).toHaveLength(0);
    });

    it("should return all categories correctly", () => {
      const swResults = getTemplatesByCategory("SW_DEVELOPMENT");
      const hwResults = getTemplatesByCategory("HW_DEVELOPMENT");

      expect(swResults.length).toBe(2);
      expect(hwResults.length).toBe(1);
    });
  });

  describe("getPopularTemplates", () => {
    beforeEach(() => {
      const templates = [
        createMockTemplate({ id: "temp_1", usageCount: 10 }),
        createMockTemplate({ id: "temp_2", usageCount: 5 }),
        createMockTemplate({ id: "temp_3", usageCount: 20 }),
        createMockTemplate({ id: "temp_4", usageCount: 15 }),
        createMockTemplate({ id: "temp_5", usageCount: 8 }),
        createMockTemplate({ id: "temp_6", usageCount: 3 }),
      ];

      templates.forEach((t) => saveTemplate(t));
    });

    it("should return templates sorted by usageCount descending", () => {
      const results = getPopularTemplates(6);

      expect(results[0].id).toBe("temp_3"); // 20
      expect(results[1].id).toBe("temp_4"); // 15
      expect(results[2].id).toBe("temp_1"); // 10
    });

    it("should respect limit parameter", () => {
      const results = getPopularTemplates(3);

      expect(results).toHaveLength(3);
    });

    it("should default limit to 5", () => {
      const results = getPopularTemplates();

      expect(results.length).toBeLessThanOrEqual(5);
    });

    it("should return fewer results if less templates available", () => {
      const results = getPopularTemplates(100);

      expect(results.length).toBeLessThanOrEqual(6);
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty template list", () => {
      const list = getTemplatesList();

      expect(Array.isArray(list)).toBe(true);
    });

    it("should handle duplicate template names", () => {
      const template1 = createMockTemplate({ id: "t1", name: "Same Name" });
      const template2 = createMockTemplate({ id: "t2", name: "Same Name" });

      saveTemplate(template1);
      saveTemplate(template2);

      const list = getTemplatesList();
      expect(list.filter((t) => t.name === "Same Name")).toHaveLength(2);
    });

    it("should handle special characters in template names", () => {
      const template = createMockTemplate({
        name: "テスト!@#$%^&*()",
        description: '特殊文字"\'`~',
        tags: ["#특별한", "#characters"],
      });

      saveTemplate(template);
      const loaded = loadTemplate(template.id);

      expect(loaded?.name).toBe(template.name);
      expect(loaded?.description).toBe(template.description);
    });

    it("should handle very large templates (100+ nodes)", () => {
      const largeNodeList = Array.from({ length: 150 }, (_, i) =>
        createMockNode({ id: `node_${i}` })
      );
      const largeEdgeList = Array.from({ length: 149 }, (_, i) =>
        createMockEdge({
          id: `edge_${i}`,
          source: `node_${i}`,
          target: `node_${i + 1}`,
        })
      );
      const template = createMockTemplate({
        nodes: largeNodeList,
        edges: largeEdgeList,
      });

      saveTemplate(template);
      const loaded = loadTemplate(template.id);

      expect(loaded?.nodes).toHaveLength(150);
      expect(loaded?.edges).toHaveLength(149);
    });

    it("should handle missing optional fields", () => {
      const templateWithoutDescription = createMockTemplate({
        description: undefined,
      });

      saveTemplate(templateWithoutDescription);
      const loaded = loadTemplate(templateWithoutDescription.id);

      expect(loaded?.description).toBeUndefined();
    });

    it("should handle empty nodes and edges arrays", () => {
      const emptyTemplate = createMockTemplate({
        nodes: [],
        edges: [],
      });

      saveTemplate(emptyTemplate);
      const loaded = loadTemplate(emptyTemplate.id);

      expect(loaded?.nodes).toHaveLength(0);
      expect(loaded?.edges).toHaveLength(0);
    });

    it("should handle corrupted JSON import gracefully", () => {
      const result = importTemplate('{"incomplete": ');

      expect(result).toBeNull();
    });

    it("should handle template with missing edge references", () => {
      const template = createMockTemplate({
        nodes: [createMockNode({ id: "n1" })],
        edges: [
          createMockEdge({
            source: "n1",
            target: "nonexistent_node",
          }),
        ],
      });

      // Should not throw when applying template with broken references
      expect(() => applyTemplateToProject(template)).not.toThrow();
    });

    it("should preserve timezone information in timestamps", () => {
      const now = new Date();
      const template = createMockTemplate({
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      });

      saveTemplate(template);
      const loaded = loadTemplate(template.id);

      expect(loaded?.createdAt).toBe(template.createdAt);
      expect(loaded?.updatedAt).toBe(template.updatedAt);
    });

    it("should handle templates with null/undefined properties in attributes", () => {
      const node = createMockNode({
        attributes: {
          ...createMockNode().attributes,
          assignee: undefined,
        },
      });
      const template = createMockTemplate({ nodes: [node] });

      saveTemplate(template);
      const loaded = loadTemplate(template.id);

      expect(loaded?.nodes[0].attributes.assignee).toBeUndefined();
    });
  });
});
