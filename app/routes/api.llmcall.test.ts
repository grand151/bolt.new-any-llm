import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LLMManager } from '~/lib/modules/llm/manager';
import { getModelList } from './api.llmcall';
import type { ModelInfo } from '~/lib/modules/llm/types';
import type { BaseProvider } from '~/lib/modules/llm/base-provider';

vi.mock('~/utils/constants', () => ({
  PROVIDER_LIST: [],
  DEFAULT_PROVIDER: {},
}));

vi.mock('~/lib/modules/llm/manager', () => ({
  LLMManager: {
    getInstance: vi.fn(),
  },
}));

describe('getModelList', () => {
  const mockModelList: ModelInfo[] = [
    {
      name: 'model-1',
      label: 'Model 1',
      provider: 'test-provider',
      maxTokenAllowed: 1000,
    },
  ];

  // Create full mock implementation of LLMManager
  const mockLLMManager = {
    _providers: new Map<string, BaseProvider>(),
    _modelList: [] as ModelInfo[],
    _env: {},
    env: {},
    _registerProvidersFromDirectory: vi.fn(),
    registerProvider: vi.fn(),
    getProvider: vi.fn(),
    getAllProviders: vi.fn().mockReturnValue([]),
    getModelList: vi.fn(),
    updateModelList: vi.fn().mockResolvedValue(mockModelList),
    getStaticModelList: vi.fn(),
    getModelListFromProvider: vi.fn(),
    getStaticModelListFromProvider: vi.fn(),
    getDefaultProvider: vi.fn(),
  } as unknown as LLMManager;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(LLMManager.getInstance).mockReturnValue(mockLLMManager);
  });

  it('should return model list from LLMManager', async () => {
    const options = {
      apiKeys: { 'test-provider': 'test-key' },
      providerSettings: { 'test-provider': { enabled: true } },
      serverEnv: { TEST_ENV: 'test' },
    };

    const result = await getModelList(options);

    expect(LLMManager.getInstance).toHaveBeenCalledWith(import.meta.env);
    expect(mockLLMManager.updateModelList).toHaveBeenCalledWith(options);
    expect(result).toEqual(mockModelList);
  });
});
