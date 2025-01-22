import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createSampler } from '~/utils/sampler';
import type { Message } from 'ai';
import { toast } from 'react-toastify';

vi.mock('~/utils/sampler', () => ({
  createSampler: vi.fn((fn) => fn),
}));

vi.mock('react-toastify', () => ({
  toast: {
    error: vi.fn(),
  },
}));

describe('processSampledMessages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should process messages and store history when messages length increases', async () => {
    const parseMessages = vi.fn();
    const storeMessageHistory = vi.fn().mockResolvedValue(undefined);

    const initialMessages: Message[] = [{ id: '1', role: 'user', content: 'Hello' }];

    const messages: Message[] = [
      { id: '1', role: 'user', content: 'Hello' },
      { id: '2', role: 'assistant', content: 'Hi there' },
    ];

    const processSampledMessages = createSampler(
      (options: {
        messages: Message[];
        initialMessages: Message[];
        isLoading: boolean;
        parseMessages: (messages: Message[], isLoading: boolean) => void;
        storeMessageHistory: (messages: Message[]) => Promise<void>;
      }) => {
        const { messages, initialMessages, isLoading, parseMessages, storeMessageHistory } = options;
        parseMessages(messages, isLoading);

        if (messages.length > initialMessages.length) {
          storeMessageHistory(messages).catch((error) => toast.error(error.message));
        }
      },
      50,
    );

    processSampledMessages({
      messages,
      initialMessages,
      isLoading: false,
      parseMessages,
      storeMessageHistory,
    });

    expect(parseMessages).toHaveBeenCalledWith(messages, false);
    expect(storeMessageHistory).toHaveBeenCalledWith(messages);
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('should not store history when messages length is same', async () => {
    const parseMessages = vi.fn();
    const storeMessageHistory = vi.fn();

    const messages: Message[] = [{ id: '1', role: 'user', content: 'Hello' }];
    const initialMessages: Message[] = [{ id: '1', role: 'user', content: 'Hello' }];

    const processSampledMessages = createSampler(
      (options: {
        messages: Message[];
        initialMessages: Message[];
        isLoading: boolean;
        parseMessages: (messages: Message[], isLoading: boolean) => void;
        storeMessageHistory: (messages: Message[]) => Promise<void>;
      }) => {
        const { messages, initialMessages, isLoading, parseMessages, storeMessageHistory } = options;
        parseMessages(messages, isLoading);

        if (messages.length > initialMessages.length) {
          storeMessageHistory(messages).catch((error) => toast.error(error.message));
        }
      },
      50,
    );

    processSampledMessages({
      messages,
      initialMessages,
      isLoading: false,
      parseMessages,
      storeMessageHistory,
    });

    expect(parseMessages).toHaveBeenCalledWith(messages, false);
    expect(storeMessageHistory).not.toHaveBeenCalled();
  });

  it('should show error toast when store history fails', async () => {
    const parseMessages = vi.fn();
    const error = new Error('Storage failed');
    const storeMessageHistory = vi.fn().mockRejectedValue(error);

    const initialMessages: Message[] = [{ id: '1', role: 'user', content: 'Hello' }];
    const messages: Message[] = [
      { id: '1', role: 'user', content: 'Hello' },
      { id: '2', role: 'assistant', content: 'Hi there' },
    ];

    const processSampledMessages = createSampler(
      (options: {
        messages: Message[];
        initialMessages: Message[];
        isLoading: boolean;
        parseMessages: (messages: Message[], isLoading: boolean) => void;
        storeMessageHistory: (messages: Message[]) => Promise<void>;
      }) => {
        const { messages, initialMessages, isLoading, parseMessages, storeMessageHistory } = options;
        parseMessages(messages, isLoading);

        if (messages.length > initialMessages.length) {
          storeMessageHistory(messages).catch((error) => toast.error(error.message));
        }
      },
      50,
    );

    processSampledMessages({
      messages,
      initialMessages,
      isLoading: false,
      parseMessages,
      storeMessageHistory,
    });

    // Wait for promise rejection
    await new Promise(process.nextTick);

    expect(parseMessages).toHaveBeenCalledWith(messages, false);
    expect(storeMessageHistory).toHaveBeenCalledWith(messages);
    expect(toast.error).toHaveBeenCalledWith(error.message);
  });
});
