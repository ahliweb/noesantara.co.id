const RETRYABLE_STATUS = new Set([408, 425, 429, 500, 502, 503, 504]);

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchWithTimeout(url: string, init: RequestInit = {}, timeoutMs = 8000): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...init,
      redirect: 'manual',
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchWithRetry(url: string, init: RequestInit, options?: { retries?: number; timeoutMs?: number }): Promise<Response> {
  const retries = options?.retries ?? 2;
  const timeoutMs = options?.timeoutMs ?? 8000;

  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await fetchWithTimeout(url, init, timeoutMs);
      if (!RETRYABLE_STATUS.has(response.status) || attempt === retries) {
        return response;
      }
      await sleep(250 * (attempt + 1));
    } catch (error) {
      lastError = error;
      if (attempt === retries) {
        throw error;
      }
      await sleep(250 * (attempt + 1));
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Unknown fetch failure');
}

export async function readResponseBody(response: Response): Promise<string> {
  try {
    return await response.text();
  } catch {
    return '';
  }
}
