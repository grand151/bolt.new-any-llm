import { describe, expect, it } from 'vitest';
import { getSystemPrompt, CONTINUE_PROMPT } from './prompts';
import { MODIFICATIONS_TAG_NAME, WORK_DIR } from '~/utils/constants';

describe('prompts', () => {
  describe('getSystemPrompt', () => {
    it('should return system prompt with default work dir', () => {
      const prompt = getSystemPrompt();
      expect(prompt).toContain(`The current working directory is \`${WORK_DIR}\`.`);
      expect(prompt).toContain(MODIFICATIONS_TAG_NAME);
      expect(prompt).toContain('You are Bolt, an expert AI assistant');
    });

    it('should return system prompt with custom work dir', () => {
      const customDir = '/custom/dir';
      const prompt = getSystemPrompt(customDir);
      expect(prompt).toContain(`The current working directory is \`${customDir}\`.`);
    });
  });

  describe('CONTINUE_PROMPT', () => {
    it('should contain continue instructions', () => {
      expect(CONTINUE_PROMPT).toContain('Continue your prior response');
      expect(CONTINUE_PROMPT).toContain('Do not repeat any content');
    });
  });
});
