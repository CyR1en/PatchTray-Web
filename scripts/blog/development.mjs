/**
 * Debounces idle edits and serializes generation after a run has begun. Edits
 * made during a run collapse into one follow-up run instead of overlapping
 * writes or being dropped.
 */
export function createBlogRegenerationQueue({
  debounceMs = 150,
  generate,
  onError = () => {},
  onSuccess = () => {},
}) {
  let closed = false;
  let queued = false;
  let running = false;
  let timer;
  const idleWaiters = new Set();

  function resolveIdleWaiters() {
    if (running || queued || timer) return;
    for (const resolve of idleWaiters) resolve();
    idleWaiters.clear();
  }

  async function run() {
    if (closed || running) return;
    if (timer) {
      clearTimeout(timer);
      timer = undefined;
    }

    running = true;
    try {
      while (queued && !closed) {
        queued = false;
        try {
          const result = await generate();
          await onSuccess(result);
        } catch (error) {
          await onError(error);
        }
      }
    } finally {
      running = false;
      resolveIdleWaiters();
    }
  }

  function schedule() {
    if (closed) return;
    queued = true;
    if (running) return;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = undefined;
      void run();
    }, debounceMs);
  }

  async function flush() {
    if (closed) return;
    queued = true;
    if (timer) {
      clearTimeout(timer);
      timer = undefined;
    }
    void run();
    await whenIdle();
  }

  function whenIdle() {
    if (!running && !queued && !timer) return Promise.resolve();
    return new Promise((resolve) => idleWaiters.add(resolve));
  }

  function close() {
    closed = true;
    queued = false;
    if (timer) {
      clearTimeout(timer);
      timer = undefined;
    }
    resolveIdleWaiters();
  }

  return { close, flush, schedule, whenIdle };
}
