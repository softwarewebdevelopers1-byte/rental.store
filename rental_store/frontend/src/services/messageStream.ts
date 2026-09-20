import { API_BASE_URL } from "./apiClient";

interface MessageStreamHandlers {
  onMessage: (payload: unknown) => void;
  onError?: (error: Event) => void;
  onOpen?: () => void;
}

interface SharedStream {
  source: EventSource;
  handlers: Set<MessageStreamHandlers>;
}

const streams = new Map<string, SharedStream>();

export function openMessageStream(
  token: string,
  handlers: MessageStreamHandlers,
): () => void {
  let shared = streams.get(token);
  if (!shared) {
    const source = new EventSource(
      `${API_BASE_URL}/messages/stream?token=${encodeURIComponent(token)}`,
    );
    shared = { source, handlers: new Set() };
    streams.set(token, shared);

    source.onmessage = (event) => {
      let payload: unknown;
      try {
        payload = JSON.parse(event.data) as unknown;
      } catch {
        return;
      }
      shared?.handlers.forEach((subscriber) => subscriber.onMessage(payload));
    };
    source.onerror = (error) => {
      shared?.handlers.forEach((subscriber) => subscriber.onError?.(error));
    };
    source.onopen = () => {
      shared?.handlers.forEach((subscriber) => subscriber.onOpen?.());
    };
  }

  shared.handlers.add(handlers);
  let closed = false;
  return () => {
    if (closed) return;
    closed = true;
    const current = streams.get(token);
    if (!current) return;
    current.handlers.delete(handlers);
    if (current.handlers.size === 0) {
      current.source.close();
      streams.delete(token);
    }
  };
}
