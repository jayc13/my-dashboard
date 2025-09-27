import fetch, { RequestInit, Response } from 'node-fetch';

export interface HttpClientConfig {
  baseUrl?: string;
  timeout?: number;
  defaultHeaders?: Record<string, string>;
}

export class HttpClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor(config: HttpClientConfig = {}) {
    this.baseUrl = config.baseUrl || 'http://localhost:3000';
    this.defaultHeaders = config.defaultHeaders || {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  getBaseUrl() {
    return this.baseUrl;
  }

  private async makeRequest(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<Response> {
    const url = `${this.baseUrl}${endpoint}`;

    const requestOptions: RequestInit = {
      ...options,
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
    };

    try {
      return await fetch(url, requestOptions);
    } catch (error) {
      throw new Error(`HTTP request failed: ${error}`);
    }
  }

  async get(endpoint: string, headers?: Record<string, string>): Promise<Response> {
    return this.makeRequest(endpoint, {
      method: 'GET',
      headers,
    });
  }

  async post(
    endpoint: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    body?: any,
    headers?: Record<string, string>,
  ): Promise<Response> {
    return this.makeRequest(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      headers,
    });
  }


  async put(
    endpoint: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    body?: any,
    headers?: Record<string, string>,
  ): Promise<Response> {
    return this.makeRequest(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
      headers,
    });
  }

  async patch(
    endpoint: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    body?: any,
    headers?: Record<string, string>,
  ): Promise<Response> {
    return this.makeRequest(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
      headers,
    });
  }

  async delete(endpoint: string, headers?: Record<string, string>): Promise<Response> {
    return this.makeRequest(endpoint, {
      method: 'DELETE',
      headers,
    });
  }

  // Helper method to parse JSON response
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getJson<T = any>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    const response = await this.get(endpoint, headers);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.json() as Promise<T>;
  }

  // Helper method to post JSON and get JSON response

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async postJson<T = any>(
    endpoint: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    body?: any,
    headers?: Record<string, string>,
  ): Promise<T> {
    const response = await this.post(endpoint, body, headers);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.json() as Promise<T>;
  }
}
