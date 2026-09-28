export interface PollOptions {
  intervalMs: number;
  maxAttempts: number;
  shouldStop: (result: unknown) => boolean;
}

export function poll<T>(
  fetcher: () => Promise<T>,
  options: PollOptions,
): { cancel: () => void; promise: Promise<T | null> } {
  let cancelled = false;
  let timer: number | undefined;
  let resolveResult: (result: T | null) => void = () => {};
  let rejectResult: (error: unknown) => void = () => {};

  const promise = new Promise<T | null>((resolve, reject) => {
    resolveResult = resolve;
    rejectResult = reject;
  });

  const cancel = () => {
    cancelled = true;
    if (timer !== undefined) window.clearTimeout(timer);
    resolveResult(null);
  };

  let attempts = 0;
  const run = async () => {
    if (cancelled) return;
    attempts += 1;
    try {
      const result = await fetcher();
      if (cancelled) return;
      if (options.shouldStop(result) || attempts >= options.maxAttempts) {
        resolveResult(result);
        return;
      }
      timer = window.setTimeout(() => void run(), options.intervalMs);
    } catch (error) {
      if (!cancelled) rejectResult(error);
    }
  };

  void run();
  return { cancel, promise };
}
