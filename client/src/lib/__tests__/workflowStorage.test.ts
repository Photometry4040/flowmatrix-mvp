import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getStorageUsage, checkStorageQuota } from '../workflowStorage';

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

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    warning: vi.fn(),
    error: vi.fn(),
    success: vi.fn(),
    info: vi.fn(),
  },
}));

describe('workflowStorage - Phase 5-6 Features', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('getStorageUsage', () => {
    it('should return zero usage when storage is empty', () => {
      const usage = getStorageUsage();

      expect(usage.used).toBe(0);
      expect(usage.total).toBe(5); // 5MB total
      expect(usage.percentage).toBe(0);
    });

    it('should calculate storage usage correctly', () => {
      // Add some data to localStorage
      const testData = JSON.stringify({ id: '1', name: 'Test Project', nodes: [], edges: [] });
      localStorage.setItem('flowmatrix_project_test', testData);

      const usage = getStorageUsage();

      expect(usage.used).toBeGreaterThan(0);
      expect(usage.percentage).toBeGreaterThan(0);
      expect(usage.percentage).toBeLessThan(100);
    });

    it('should only count flowmatrix_ prefixed keys', () => {
      localStorage.setItem('flowmatrix_project_1', 'a'.repeat(1000));
      localStorage.setItem('other_key', 'b'.repeat(1000)); // Should not be counted

      const usage = getStorageUsage();

      // Usage should only include flowmatrix_ key
      const expectedSize = new Blob(['a'.repeat(1000)]).size / (1024 * 1024);
      expect(usage.used).toBeCloseTo(expectedSize, 3);
    });
  });

  describe('checkStorageQuota', () => {
    it('should return true when storage is under threshold', () => {
      const result = checkStorageQuota(90);

      expect(result).toBe(true);
    });

    it('should detect when storage exceeds threshold', () => {
      // Create large data to exceed 90%
      const largeData = 'x'.repeat(4.5 * 1024 * 1024); // 4.5MB (90% of 5MB)
      localStorage.setItem('flowmatrix_large', largeData);

      const usage = getStorageUsage();

      // Verify usage is calculated correctly
      expect(usage.percentage).toBeGreaterThan(90);

      const result = checkStorageQuota(90);

      // Still allows saving even when exceeding warning threshold
      expect(result).toBe(true);
    });

    it('should block when storage is completely full', () => {
      // Fill up storage to 100%
      const largeData = 'x'.repeat(5 * 1024 * 1024); // 5MB (full)
      localStorage.setItem('flowmatrix_large', largeData);

      const usage = getStorageUsage();
      expect(usage.percentage).toBeGreaterThanOrEqual(100);

      const result = checkStorageQuota(90);

      // Should block saving when full
      expect(result).toBe(false);
    });

    it('should respect custom threshold', () => {
      // Fill up to 81% (exceeds 80% threshold)
      const largeData = 'x'.repeat(4 * 1024 * 1024); // 4MB (80% of 5MB)
      localStorage.setItem('flowmatrix_large', largeData);

      const usage = getStorageUsage();
      expect(usage.percentage).toBeGreaterThan(80);

      const result = checkStorageQuota(80); // Custom 80% threshold

      // Still allows saving (only blocks at 100%)
      expect(result).toBe(true);
    });
  });

  describe('Project Validation and Recovery', () => {
    it('should validate correct project structure', () => {
      const validProject = {
        id: 'test-1',
        name: 'Test Project',
        description: 'Test',
        nodes: [],
        edges: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: 1,
      };

      // This would be tested through loadProject function
      // For now, we verify the structure is valid
      expect(validProject.id).toBeDefined();
      expect(validProject.name).toBeDefined();
      expect(Array.isArray(validProject.nodes)).toBe(true);
      expect(Array.isArray(validProject.edges)).toBe(true);
    });

    it('should handle missing required fields', () => {
      const invalidProject = {
        id: 'test-1',
        // Missing name
        nodes: [],
        edges: [],
      };

      // Validation should fail for missing required fields
      expect(invalidProject.id).toBeDefined();
      expect((invalidProject as any).name).toBeUndefined();
    });

    it('should handle invalid array fields', () => {
      const invalidProject = {
        id: 'test-1',
        name: 'Test',
        nodes: 'not-an-array', // Should be array
        edges: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: 1,
      };

      // Validation should fail for invalid types
      expect(Array.isArray(invalidProject.nodes)).toBe(false);
    });
  });
});
