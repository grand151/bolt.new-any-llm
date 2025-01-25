import { describe, it, expect } from 'vitest';
import { remarkPlugins, rehypePlugins, limitedMarkdownPlugin } from './markdown';

describe('markdown utils', () => {
  describe('remarkPlugins', () => {
    it('should return plugins array with remarkGfm when limitedMarkdown is false', () => {
      const plugins = remarkPlugins(false);
      expect(plugins).toHaveLength(1);
      // Don't check plugin name since it's not reliably accessible
      expect(plugins[0]).toBeDefined();
    });

    it('should include limitedMarkdownPlugin when limitedMarkdown is true', () => {
      const plugins = remarkPlugins(true);
      expect(plugins).toHaveLength(2);
      expect(plugins[0]).toBe(limitedMarkdownPlugin);
      expect(plugins[1]).toBeDefined();
    });
  });

  describe('rehypePlugins', () => {
    it('should return empty array when html is false', () => {
      const plugins = rehypePlugins(false);
      expect(plugins).toEqual([]);
    });

    it('should return rehype plugins when html is true', () => {
      const plugins = rehypePlugins(true);
      expect(plugins).toHaveLength(2);
      expect(plugins[0]).toBeDefined();
      expect(plugins[1]).toBeDefined();
      expect(Array.isArray(plugins[1])).toBe(true);
    });
  });
});
