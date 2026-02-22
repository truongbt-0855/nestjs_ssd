function resolveApiUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (!url) {
    throw new Error('NEXT_PUBLIC_API_URL is not configured');
  }

  return url.replace(/\/$/, '');
}

async function parseJson<T>(response: Response): Promise<T> {
  return (await response.json()) as T;
}

function pickErrorMessage(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const record = payload as Record<string, unknown>;
  const error = record.error;

  if (typeof error === 'string' && error.trim()) {
    return error;
  }

  if (error && typeof error === 'object') {
    const nestedMessage = (error as Record<string, unknown>).message;
    if (typeof nestedMessage === 'string' && nestedMessage.trim()) {
      return nestedMessage;
    }
  }

  const message = record.message;
  if (typeof message === 'string' && message.trim()) {
    return message;
  }

  return null;
}

async function toRequestError(response: Response): Promise<Error> {
  try {
    const payload = await response.json();
    const message = pickErrorMessage(payload);
    if (message) {
      return new Error(message);
    }
  } catch {
    // ignore parse errors and fallback to status message
  }

  return new Error(`API request failed with status ${response.status}`);
}

export async function apiGet<T>(path: string, token?: string): Promise<T> {
  const response = await fetch(`${resolveApiUrl()}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw await toRequestError(response);
  }

  return parseJson<T>(response);
}

export async function apiPost<TResponse, TBody>(path: string, body: TBody, token?: string): Promise<TResponse> {
  const response = await fetch(`${resolveApiUrl()}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  });

  if (!response.ok) {
    throw await toRequestError(response);
  }

  return parseJson<TResponse>(response);
}
