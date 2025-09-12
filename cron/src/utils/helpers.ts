import * as dotenv from 'dotenv';

dotenv.config();

export async function apiFetch(input: RequestInfo, init: RequestInit = {}) {
  const apiKey = process.env.API_SECURITY_KEY;
  let headers: Record<string, string> = {};

  if (init.headers) {
    if (init.headers instanceof Headers) {
      init.headers.forEach((value, key) => {
        headers[key] = value;
      });
    } else if (Array.isArray(init.headers)) {
      for (const [key, value] of init.headers) {
        headers[key] = value;
      }
    } else {
      headers = { ...init.headers } as Record<string, string>;
    }
  }

  if (apiKey !== undefined && apiKey !== '') {
    headers['x-api-key'] = apiKey;
  }

  return fetch(input, { ...init, headers });
}
