import { vi, describe, it, expect, beforeEach } from 'vitest';
import { getProviderInfo, cachedProviders, cachedDefaultProvider } from './api.models';
import { LLMManager } from '~/lib/modules/llm/manager';
import type { ModelInfo } from '~/lib/modules/llm/types';

vi.mock('~/lib/modules/llm/manager');

describe('getProviderInfo', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  const mockModelInfo: ModelInfo = {
    name: 'test-model',
    label: 'Test Model',
    provider: 'test-provider',
    maxTokenAllowed: 1000,
  };

  const mockProvider = {
    name: 'test-provider',
    staticModels: [mockModelInfo],
    getApiKeyLink: 'https://test.com/api-key',
    labelForGetApiKey: 'Get API Key',
    icon: 'test-icon',
  };

  it('should return cached providers and default provider if already cached', () => {
    const llmManager = {
      getAllProviders: vi.fn().mockReturnValue([mockProvider]),
      getDefaultProvider: vi.fn().mockReturnValue(mockProvider),
    } as unknown as LLMManager;

    const result1 = getProviderInfo(llmManager);
    expect(result1.providers).toHaveLength(1);
    expect(result1.providers[0]).toEqual({
      name: mockProvider.name,
      staticModels: mockProvider.staticModels,
      getApiKeyLink: mockProvider.getApiKeyLink,
      labelForGetApiKey: mockProvider.labelForGetApiKey,
      icon: mockProvider.icon,
    });
    expect(result1.defaultProvider).toEqual({
      name: mockProvider.name,
      staticModels: mockProvider.staticModels,
      getApiKeyLink: mockProvider.getApiKeyLink,
      labelForGetApiKey: mockProvider.labelForGetApiKey,
      icon: mockProvider.icon,
    });

    // Second call should use cached values
    const result2 = getProviderInfo(llmManager);
    expect(result2).toEqual(result1);
    expect(llmManager.getAllProviders).toHaveBeenCalledTimes(1);
    expect(llmManager.getDefaultProvider).toHaveBeenCalledTimes(1);
  });
});
