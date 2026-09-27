type RetryOptions = {
  attempts?: number;
  wait?: (attempt: number) => Promise<void>;
};

export async function retryAsync<T>(
  operation: () => Promise<T>,
  { attempts = 2, wait = () => Promise.resolve() }: RetryOptions = {}
) {
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (attempt < attempts) {
        await wait(attempt);
      }
    }
  }

  throw lastError;
}

export async function mapWithConcurrency<T, Result>(
  items: readonly T[],
  concurrency: number,
  worker: (item: T, index: number) => Promise<Result>
) {
  const results = new Array<PromiseSettledResult<Result>>(items.length);
  let nextIndex = 0;
  const workerCount = Math.min(Math.max(1, concurrency), items.length);

  async function processQueue() {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;

      try {
        results[index] = {
          status: "fulfilled",
          value: await worker(items[index], index),
        };
      } catch (reason) {
        results[index] = { reason, status: "rejected" };
      }
    }
  }

  await Promise.all(
    Array.from({ length: workerCount }, () => processQueue())
  );

  return results;
}
