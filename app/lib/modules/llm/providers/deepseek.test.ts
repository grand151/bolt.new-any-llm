import { describe, expect, it, vi } from 'vitest';
import DeepseekProvider from './deepseek';
import { createOpenAI } from '@ai-sdk/openai';
import { BaseProvider } from '~/lib/modules/llm/base-provider';

vi.mock('@ai-sdk/openai', () => ({
  createOpenAI: vi.fn().mockReturnValue(vi.fn()),
}));

vi.mock('~/lib/modules/llm/base-provider', () => ({
  BaseProvider: class {
    getProviderBaseUrlAndKey = vi.fn().mockImplementation(({ apiKeys, serverEnv }) => ({
      apiKey: apiKeys?.DEEPSEEK_API_KEY || serverEnv?.DEEPSEEK_API_KEY,
    }));
  },
}));

const mockEnv = {
  DEFAULT_NUM_CTX: '4096',
  ANTHROPIC_API_KEY: '',
  OPENAI_API_KEY: '',
  GROQ_API_KEY: '',
  GOOGLE_API_KEY: '',
  GOOGLE_PROJECT_ID: '',
  AZURE_OPENAI_ENDPOINT: '',
  AZURE_GPT_35_DEPLOYMENT: '',
  AZURE_GPT_45_DEPLOYMENT: '',
  AZURE_GPT_45_VISION_DEPLOYMENT: '',
  AZURE_OPENAI_KEY: '',
  DEEPSEEK_API_KEY: '',
  MISTRAL_API_KEY: '',
  PERPLEXITY_API_KEY: '',
  TOGETHER_API_KEY: '',
  OLLAMA_BASE_URL: '',
  OPENROUTER_API_KEY: '',
  HUGGINGFACE_API_KEY: '',
  HuggingFace_API_KEY: '',
  OPEN_ROUTER_API_KEY: '',
  OLLAMA_API_BASE_URL: '',
  OPENAI_LIKE_API_KEY: '',
  ANTHROPIC_API_BASE_URL: '',
  OPENAI_API_BASE_URL: '',
  MISTRAL_API_BASE_URL: '',
  PERPLEXITY_API_BASE_URL: '',
  TOGETHER_API_BASE_URL: '',
} as any;

describe('DeepseekProvider', () => {
  const provider = new DeepseekProvider();

  it('should have correct name and API key link', () => {
    expect(provider.name).toBe('Deepseek');
    expect(provider.getApiKeyLink).toBe('https://platform.deepseek.com/apiKeys');
  });

  it('should have correct config', () => {
    expect(provider.config).toEqual({
      apiTokenKey: 'DEEPSEEK_API_KEY',
    });
  });

  it('should have correct static models', () => {
    expect(provider.staticModels).toEqual([
      { name: 'deepseek-coder', label: 'Deepseek-Coder', provider: 'Deepseek', maxTokenAllowed: 8000 },
      { name: 'deepseek-chat', label: 'Deepseek-Chat', provider: 'Deepseek', maxTokenAllowed: 8000 },
      { name: 'deepseek-reasoner', label: 'Deepseek-Reasoner', provider: 'Deepseek', maxTokenAllowed: 8000 },
    ]);
  });

  describe('getModelInstance', () => {
    it('should throw error if API key is missing', () => {
      expect(() =>
        provider.getModelInstance({
          model: 'deepseek-chat',
          serverEnv: mockEnv,
          apiKeys: {},
          providerSettings: {},
        }),
      ).toThrow('Missing API key for Deepseek provider');
    });

    it('should create OpenAI instance with correct config', () => {
      const apiKey = 'test-api-key';
      const model = 'deepseek-chat';

      provider.getModelInstance({
        model,
        serverEnv: { ...mockEnv, DEEPSEEK_API_KEY: apiKey },
        apiKeys: {},
        providerSettings: {},
      });

      expect(createOpenAI).toHaveBeenCalledWith({
        baseURL: 'https://api.deepseek.com/beta',
        apiKey,
      });
    });

    it('should use API key from apiKeys if available', () => {
      const apiKey = 'apikeys-api-key';
      const model = 'deepseek-chat';

      provider.getModelInstance({
        model,
        serverEnv: mockEnv,
        apiKeys: {
          DEEPSEEK_API_KEY: apiKey,
        },
        providerSettings: {},
      });

      expect(createOpenAI).toHaveBeenCalledWith({
        baseURL: 'https://api.deepseek.com/beta',
        apiKey,
      });
    });
  });
});
