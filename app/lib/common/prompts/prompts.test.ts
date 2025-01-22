import { describe, expect, it } from 'vitest';
import { getSystemPrompt } from './prompts';
import { MODIFICATIONS_TAG_NAME, WORK_DIR } from '~/utils/constants';
import { allowedHTMLElements } from '~/utils/markdown';

describe('getSystemPrompt', () => {
  it('should return system prompt with default work dir', () => {
    const result = getSystemPrompt();
    expect(result).toContain(`The current working directory is \`${WORK_DIR}\`.`);
    expect(result).toContain(`<${MODIFICATIONS_TAG_NAME}>`);
    expect(result).toContain(`</${MODIFICATIONS_TAG_NAME}>`);
    expect(result).toContain(allowedHTMLElements.map((tag) => `<${tag}>`).join(', '));
  });

  it('should use provided working directory', () => {
    const customDir = '/custom/dir';
    const result = getSystemPrompt(customDir);
    expect(result).toContain(`The current working directory is \`${customDir}\`.`);
  });
});
