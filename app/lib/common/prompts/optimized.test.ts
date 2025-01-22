import { describe, it, expect } from 'vitest';
import optimizedPrompt from './optimized';
import type { PromptOptions } from '~/lib/common/prompt-library';

describe('optimizedPrompt', () => {
  it('should generate prompt with provided options', () => {
    const options: PromptOptions = {
      cwd: '/test/path',
      allowedHtmlElements: ['div', 'span'],
      modificationTagName: 'modify',
    };

    const result = optimizedPrompt(options);

    expect(result).toContain('Current working directory: `/test/path `');
    expect(result).toContain('Available HTML elements: div, span');
    expect(result).toContain('`<modify>`');
  });

  it('should handle empty allowed HTML elements array', () => {
    const options: PromptOptions = {
      cwd: '/test/path',
      allowedHtmlElements: [],
      modificationTagName: 'modify',
    };

    const result = optimizedPrompt(options);

    expect(result).toContain('Available HTML elements: ');
  });

  it('should include all required sections', () => {
    const options: PromptOptions = {
      cwd: '/test/path',
      allowedHtmlElements: ['div'],
      modificationTagName: 'modify',
    };

    const result = optimizedPrompt(options);

    expect(result).toContain('<system_constraints>');
    expect(result).toContain('<code_formatting_info>');
    expect(result).toContain('<message_formatting_info>');
    expect(result).toContain('<diff_spec>');
    expect(result).toContain('<chain_of_thought_instructions>');
    expect(result).toContain('<artifact_info>');
    expect(result).toContain('<examples>');
  });

  it('should include critical rules section', () => {
    const options: PromptOptions = {
      cwd: '/test/path',
      allowedHtmlElements: ['div'],
      modificationTagName: 'modify',
    };

    const result = optimizedPrompt(options);

    expect(result).toContain('# CRITICAL RULES - NEVER IGNORE');
    expect(result).toContain('## File and Command Handling');
    expect(result).toContain('## Response Format');
    expect(result).toContain('## Development Process');
    expect(result).toContain('## Coding Standards');
    expect(result).toContain('## Artifact Usage');
  });
});
