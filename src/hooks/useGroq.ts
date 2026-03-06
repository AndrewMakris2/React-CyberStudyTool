import { useState, useCallback, useRef } from 'react';
import { groqChat, groqChatStream, GroqError } from '../llm/groqClient';
import { useSettingsStore } from '../store/useSettingsStore';
import type { GroqMessage } from '../llm/groqClient';

interface UseGroqOptions {
  onChunk?: (text: string) => void;
  onComplete?: (fullText: string) => void;
  onError?: (err: string) => void;
}

export function useGroq(opts: UseGroqOptions = {}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamedText, setStreamedText] = useState('');
  const streamingEnabled = useSettingsStore((s) => s.streamingEnabled);
  const abortRef = useRef(false);

  const send = useCallback(
    async (
      messages: GroqMessage[],
      options?: { temperature?: number; maxTokens?: number }
    ): Promise<string | null> => {
      setLoading(true);
      setError(null);
      setStreamedText('');
      abortRef.current = false;

      try {
        if (streamingEnabled && opts.onChunk) {
          let fullText = '';

          await groqChatStream(
            { messages, ...options },
            (chunk) => {
              if (abortRef.current) return;
              fullText += chunk;
              setStreamedText(fullText);
              opts.onChunk?.(chunk);
            },
            () => {
              if (!abortRef.current) {
                opts.onComplete?.(fullText);
              }
              setLoading(false);
            },
            (err) => {
              const msg = err instanceof GroqError ? err.message : `Error: ${err.message}`;
              setError(msg);
              opts.onError?.(msg);
              setLoading(false);
            }
          );

          return fullText;
        } else {
          const result = await groqChat({ messages, ...options });
          setStreamedText(result.content);
          opts.onComplete?.(result.content);
          setLoading(false);
          return result.content;
        }
      } catch (err) {
        const msg =
          err instanceof GroqError
            ? err.message
            : err instanceof Error
            ? err.message
            : 'Unknown error';
        setError(msg);
        opts.onError?.(msg);
        setLoading(false);
        return null;
      }
    },
    [streamingEnabled, opts]
  );

  const abort = useCallback(() => {
    abortRef.current = true;
    setLoading(false);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return { send, loading, error, streamedText, abort, clearError };
}