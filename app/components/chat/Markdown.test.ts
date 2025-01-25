import { describe, it, expect } from 'vitest';
import { stripCodeFenceFromArtifact } from './Markdown';

describe('stripCodeFenceFromArtifact', () => {
  it('should return original content if input is empty', () => {
    expect(stripCodeFenceFromArtifact('')).toBe('');
  });

  it('should return original content if no artifact is found', () => {
    const content = 'Some markdown content\nwithout artifacts';
    expect(stripCodeFenceFromArtifact(content)).toBe(content);
  });

  it('should remove code fences around artifact', () => {
    const input = "```xml\n<div class='__boltArtifact__'></div>\n```";
    const expected = "\n<div class='__boltArtifact__'></div>\n";
    expect(stripCodeFenceFromArtifact(input)).toBe(expected);
  });

  it('should handle code fence with language specification', () => {
    const input = "```typescript\n<div class='__boltArtifact__'></div>\n```";
    const expected = "\n<div class='__boltArtifact__'></div>\n";
    expect(stripCodeFenceFromArtifact(input)).toBe(expected);
  });

  it('should preserve content if artifact is not wrapped in code fence', () => {
    const content = "<div class='__boltArtifact__'></div>";
    expect(stripCodeFenceFromArtifact(content)).toBe(content);
  });

  it('should handle artifact at start of content', () => {
    const input = "```\n<div class='__boltArtifact__'></div>\n```\nOther content";
    const expected = "\n<div class='__boltArtifact__'></div>\n\nOther content";
    expect(stripCodeFenceFromArtifact(input)).toBe(expected);
  });

  it('should handle artifact at end of content', () => {
    const input = "Some content\n```\n<div class='__boltArtifact__'></div>\n```";
    const expected = "Some content\n\n<div class='__boltArtifact__'></div>\n";
    expect(stripCodeFenceFromArtifact(input)).toBe(expected);
  });

  it('should only remove code fences directly wrapping artifact', () => {
    const input = "```js\nsome code\n```\n```\n<div class='__boltArtifact__'></div>\n```";
    const expected = "```js\nsome code\n```\n\n<div class='__boltArtifact__'></div>\n";
    expect(stripCodeFenceFromArtifact(input)).toBe(expected);
  });
});
