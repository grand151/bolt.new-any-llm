import { vi, describe, it, expect, beforeEach } from 'vitest';
import { action } from './api.enhancer';
import { streamText } from '~/lib/.server/llm/stream-text';
import { getApiKeysFromCookie, getProviderSettingsFromCookie } from '~/lib/api/cookies';

vi.mock('~/lib/.server/llm/stream-text', () => ({
  streamText: vi.fn(),
}));

vi.mock('~/lib/api/cookies', () => ({
  getApiKeysFromCookie: vi.fn(),
  getProviderSettingsFromCookie: vi.fn(),
}));

describe('enhancer action', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  const createTestRequest = (body: any) => {
    return new Request('http://localhost', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: 'test-cookie',
      },
      body: JSON.stringify(body),
    });
  };

  it('should throw 400 error for missing model', async () => {
    const request = createTestRequest({
      message: 'test message',
      model: '',
      provider: { name: 'test-provider' },
    });

    await expect(action({ request, context: { cloudflare: { env: {} } } } as any)).rejects.toMatchObject({
      status: 400,
      statusText: 'Bad Request',
    });
  });

  it('should throw 400 error for missing provider name', async () => {
    const request = createTestRequest({
      message: 'test message',
      model: 'test-model',
      provider: { name: '' },
    });

    await expect(action({ request, context: { cloudflare: { env: {} } } } as any)).rejects.toMatchObject({
      status: 400,
      statusText: 'Bad Request',
    });
  });

  it('should throw 401 error for invalid API key', async () => {
    const request = createTestRequest({
      message: 'test message',
      model: 'test-model',
      provider: { name: 'test-provider' },
    });

    vi.mocked(getApiKeysFromCookie).mockReturnValue({});
    vi.mocked(getProviderSettingsFromCookie).mockReturnValue({});
    vi.mocked(streamText).mockRejectedValue(new Error('API key is invalid'));

    await expect(action({ request, context: { cloudflare: { env: {} } } } as any)).rejects.toMatchObject({
      status: 401,
      statusText: 'Unauthorized',
    });
  });

  it('should throw 500 error for unknown errors', async () => {
    const request = createTestRequest({
      message: 'test message',
      model: 'test-model',
      provider: { name: 'test-provider' },
    });

    vi.mocked(getApiKeysFromCookie).mockReturnValue({});
    vi.mocked(getProviderSettingsFromCookie).mockReturnValue({});
    vi.mocked(streamText).mockRejectedValue(new Error('Unknown error'));

    await expect(action({ request, context: { cloudflare: { env: {} } } } as any)).rejects.toMatchObject({
      status: 500,
      statusText: 'Internal Server Error',
    });
  });

  it('should return stream response for valid request', async () => {
    const request = createTestRequest({
      message: 'test message',
      model: 'test-model',
      provider: { name: 'test-provider' },
    });

    const mockTextStream = {
      [Symbol.asyncIterator]: async function* () {
        yield 'test response';
      },
    };

    vi.mocked(getApiKeysFromCookie).mockReturnValue({});
    vi.mocked(getProviderSettingsFromCookie).mockReturnValue({});
    vi.mocked(streamText).mockResolvedValue({
      textStream: mockTextStream,
      warnings: [],
      usage: {} as any,
      finishReason: 'stop',
      experimental_providerMetadata: {} as any,
      tools: {} as any,
      content: 'test',
      invokedTools: [],
      invokedToolResponses: [],
      parameters: {} as any,
      intermediateSteps: [],
      statistics: {} as any,
      context: {} as any,
      tokenUsage: {} as any,
      finishMessage: 'Complete',
      provider: {} as any,
      model: 'test-model',
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
    } as any);

    const response = await action({ request, context: { cloudflare: { env: {} } } } as any);

    expect(response).toBeInstanceOf(Response);
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('text/event-stream');
    expect(response.headers.get('Connection')).toBe('keep-alive');
    expect(response.headers.get('Cache-Control')).toBe('no-cache');
    expect(response.headers.get('Text-Encoding')).toBe('chunked');
  });
});
