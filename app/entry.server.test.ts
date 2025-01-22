import { vi, describe, it, expect, beforeEach } from 'vitest';
import { renderToReadableStream } from 'react-dom/server';
import { renderHeadToString, createHead } from 'remix-island';
import { isbot } from 'isbot';
import handleRequest from './entry.server';
import { themeStore } from './lib/stores/theme';
import type { AppLoadContext } from '@remix-run/cloudflare';

vi.mock('react-dom/server', () => ({
  renderToReadableStream: vi.fn(),
}));

vi.mock('remix-island', () => ({
  renderHeadToString: vi.fn(),
  createHead: vi.fn(),
}));

vi.mock('isbot', () => ({
  isbot: vi.fn(),
}));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Env = any;

describe('handleRequest', () => {
  const mockRequest = new Request('http://localhost:3000');
  const mockHeaders = new Headers();
  const mockRemixContext = {};
  const mockLoadContext: AppLoadContext = {
    cloudflare: {
      env: {
        DEFAULT_NUM_CTX: '4096',
        ANTHROPIC_API_KEY: 'test-key',
        OPENAI_API_KEY: 'test-key',
        GROQ_API_KEY: 'test-key',
        AZURE_OPENAI_API_KEY: 'test-key',
        AZURE_OPENAI_ENDPOINT: 'test-endpoint',
        AZURE_GPT_35_TURBO_ID: 'test-id',
        AZURE_GPT_45_TURBO_ID: 'test-id',
        AZURE_GPT_45_VISION_ID: 'test-id',
        AZURE_EMBEDDINGS_ID: 'test-id',
        GOOGLE_GEMINI_API_KEY: 'test-key',
        MISTRAL_API_KEY: 'test-key',
        PERPLEXITY_API_KEY: 'test-key',
        OLLAMA_HOST: 'test-host',
        TOGETHER_API_KEY: 'test-key',
        GOOGLE_CLIENT_ID: 'test-id',
        GOOGLE_CLIENT_SECRET: 'test-secret',
      } as Env,
      caches: {} as any,
      cf: {} as any,
      ctx: {} as any,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    themeStore.set('light');

    vi.mocked(renderHeadToString).mockReturnValue('<head>mocked</head>');

    vi.mocked(renderToReadableStream).mockImplementation(() => {
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode('<div>content</div>'));
          controller.close();
        },
      });
      Object.defineProperty(stream, 'allReady', {
        value: Promise.resolve(),
      });
      return Promise.resolve(stream as any);
    });

    vi.mocked(isbot).mockReturnValue(false);
  });

  it('should render page with correct headers and content', async () => {
    const response = await handleRequest(mockRequest, 200, mockHeaders, mockRemixContext, mockLoadContext);

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('text/html');
    expect(response.headers.get('Cross-Origin-Embedder-Policy')).toBe('require-corp');
    expect(response.headers.get('Cross-Origin-Opener-Policy')).toBe('same-origin');

    const text = await response.text();
    expect(text).toContain('<!DOCTYPE html>');
    expect(text).toContain('<head>mocked</head>');
    expect(text).toContain('<div>content</div>');
  });

  it('should handle errors during rendering', async () => {
    let statusCode = 200;
    vi.mocked(renderToReadableStream).mockImplementation(async (_, options) => {
      if (options?.onError) {
        options.onError(new Error('Render error'), {
          componentStack: '',
          digest: '',
        });
      }
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode('<div>error content</div>'));
          controller.close();
        },
      });
      Object.defineProperty(stream, 'allReady', {
        value: Promise.resolve(),
      });
      return stream as any;
    });

    const response = await handleRequest(mockRequest, statusCode, mockHeaders, mockRemixContext, mockLoadContext);

    expect(response.status).toBe(500);
  });

  it('should wait for stream to be ready when request is from bot', async () => {
    vi.mocked(isbot).mockReturnValue(true);

    const response = await handleRequest(mockRequest, 200, mockHeaders, mockRemixContext, mockLoadContext);

    expect(isbot).toHaveBeenCalledWith('');
    expect(response.status).toBe(200);
  });
});
