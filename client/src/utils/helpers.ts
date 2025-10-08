export async function apiFetch(input: RequestInfo, init: RequestInit = {}) {
  const storedApiKey = localStorage.getItem('dashboard_api_key') || '';

  const headers = {
    ...(init.headers || {}),
    'x-api-key': storedApiKey,
  };
  return fetch(input, { ...init, headers });
}
