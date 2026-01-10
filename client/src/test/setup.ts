import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// 각 테스트 후 자동 정리
afterEach(() => {
  cleanup();
});

// ResizeObserver 모의
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// DragEvent 모의
if (typeof DragEvent === 'undefined') {
  (global as any).DragEvent = class DragEvent extends Event {
    dataTransfer: any;
    constructor(type: string, init?: any) {
      super(type, init);
      this.dataTransfer = init?.dataTransfer || null;
    }
  };
}
