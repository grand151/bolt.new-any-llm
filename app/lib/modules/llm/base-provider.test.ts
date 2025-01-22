import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BaseProvider, getOpenAILikeModel } from './base-provider';
import { LLMManager } from './manager';
import type { ModelInfo, ProviderConfig } from './types';
import type { IProviderSetting } from '~/types/model';
import { createOpenAI } from '@ai-sdk/openai';

vi.mock('@ai-sdk/openai', () => ({
  createOpenAI: vi.fn().mockReturnValue(() => ({})),
}));

vi.mock('./manager', () => ({
  LLMManager: {
    getInstance: vi.fn().mockReturnValue({
      env: {},
      getInstance: vi.fn(),
      getProvider: vi.fn(),
      getAllProviders: vi.fn(),
      getModelList: vi.fn(),
      updateModelList: vi.fn(),
      getStaticModelList: vi.fn(),
      getModelListFromProvider: vi.fn(),
      getStaticModelListFromProvider: vi.fn(),
      getDefaultProvider: vi.fn(),
    }),
  },
}));

class TestProvider extends BaseProvider {
  name = 'test-provider';
  staticModels: ModelInfo[] = [];
  config: ProviderConfig = {};

  getModelInstance() {
    return {} as any;
  }
}

describe('BaseProvider', () => {
  let provider: TestProvider;

  beforeEach(() => {
    vi.clearAllMocks();
    provider = new TestProvider();
  });

  describe('getProviderBaseUrlAndKey', () => {
    it('should get base URL and API key from provider settings', () => {
      const result = provider.getProviderBaseUrlAndKey({
        apiKeys: { 'test-provider': 'test-key' },
        providerSettings: { baseUrl: 'https://test.com' },
        defaultBaseUrlKey: 'DEFAULT_BASE_URL',
        defaultApiTokenKey: 'DEFAULT_API_KEY',
      });

      expect(result).toEqual({
        baseUrl: 'https://test.com',
        apiKey: 'test-key',
      });
    });

    it('should remove trailing slash from base URL', () => {
      const result = provider.getProviderBaseUrlAndKey({
        providerSettings: { baseUrl: 'https://test.com/' },
        defaultBaseUrlKey: 'DEFAULT_BASE_URL',
        defaultApiTokenKey: 'DEFAULT_API_KEY',
      });

      expect(result.baseUrl).toBe('https://test.com');
    });

    it('should fallback to env variables if settings not provided', () => {
      const mockManager = LLMManager.getInstance();
      vi.mocked(mockManager).env = {
        DEFAULT_BASE_URL: 'https://fallback.com',
        DEFAULT_API_KEY: 'fallback-key',
      };

      const result = provider.getProviderBaseUrlAndKey({
        defaultBaseUrlKey: 'DEFAULT_BASE_URL',
        defaultApiTokenKey: 'DEFAULT_API_KEY',
      });

      expect(result).toEqual({
        baseUrl: 'https://fallback.com',
        apiKey: 'fallback-key',
      });
    });
  });

  describe('Dynamic Models Cache', () => {
    const testOptions = {
      apiKeys: { 'test-provider': 'test-key' },
      providerSettings: { 'test-provider': { baseUrl: 'https://test.com' } as IProviderSetting },
      serverEnv: { API_KEY: 'server-key' },
    };

    it('should return null if no cached models exist', () => {
      expect(provider.getModelsFromCache(testOptions)).toBeNull();
    });

    it('should store and retrieve dynamic models', () => {
      const testModels: ModelInfo[] = [
        {
          name: 'test-model',
          label: 'Test Model',
          provider: 'test-provider',
          maxTokenAllowed: 1000,
        },
      ];

      provider.storeDynamicModels(testOptions, testModels);

      const cachedModels = provider.getModelsFromCache(testOptions);
      expect(cachedModels).toEqual(testModels);
    });

    it('should invalidate cache if options change', () => {
      const testModels: ModelInfo[] = [
        {
          name: 'test-model',
          label: 'Test Model',
          provider: 'test-provider',
          maxTokenAllowed: 1000,
        },
      ];

      provider.storeDynamicModels(testOptions, testModels);

      const differentOptions = {
        ...testOptions,
        apiKeys: { 'test-provider': 'different-key' },
      };

      expect(provider.getModelsFromCache(differentOptions)).toBeNull();
    });
  });
});

describe('getOpenAILikeModel', () => {
  it('should create OpenAI model instance with correct config', () => {
    const mockCreateOpenAI = vi.mocked(createOpenAI);
    getOpenAILikeModel('https://test.com', 'test-key', 'gpt-4');

    expect(mockCreateOpenAI).toHaveBeenCalledWith({
      baseURL: 'https://test.com',
      apiKey: 'test-key',
    });
  });
});
