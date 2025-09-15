import { vi } from 'vitest'
import { apiFetch } from '../helpers'

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
})

// Mock fetch
global.fetch = vi.fn()

describe('helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('apiFetch', () => {
    it('should call fetch with API key from localStorage', async () => {
      const mockApiKey = 'test-api-key-123'
      const mockUrl = 'https://api.example.com/data'
      const mockResponse = { ok: true, json: () => Promise.resolve({ data: 'test' }) }

      mockLocalStorage.getItem.mockReturnValue(mockApiKey)
      ;(global.fetch).mockResolvedValue(mockResponse)

      await apiFetch(mockUrl)

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('dashboard_api_key')
      expect(global.fetch).toHaveBeenCalledWith(mockUrl, {
        headers: {
          'x-api-key': mockApiKey,
        },
      })
    })

    it('should use empty string as API key when not found in localStorage', async () => {
      const mockUrl = 'https://api.example.com/data'
      const mockResponse = { ok: true, json: () => Promise.resolve({ data: 'test' }) }

      mockLocalStorage.getItem.mockReturnValue(null)
      ;(global.fetch ).mockResolvedValue(mockResponse)

      await apiFetch(mockUrl)

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('dashboard_api_key')
      expect(global.fetch).toHaveBeenCalledWith(mockUrl, {
        headers: {
          'x-api-key': '',
        },
      })
    })

    it('should merge existing headers with API key header', async () => {
      const mockApiKey = 'test-api-key-123'
      const mockUrl = 'https://api.example.com/data'
      const mockResponse = { ok: true, json: () => Promise.resolve({ data: 'test' }) }
      const existingHeaders = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer token',
      }

      mockLocalStorage.getItem.mockReturnValue(mockApiKey)
      ;(global.fetch).mockResolvedValue(mockResponse)

      await apiFetch(mockUrl, {
        method: 'POST',
        headers: existingHeaders,
        body: JSON.stringify({ test: 'data' }),
      })

      expect(global.fetch).toHaveBeenCalledWith(mockUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer token',
          'x-api-key': mockApiKey,
        },
        body: JSON.stringify({ test: 'data' }),
      })
    })

    it('should preserve all other fetch options', async () => {
      const mockApiKey = 'test-api-key-123'
      const mockUrl = 'https://api.example.com/data'
      const mockResponse = { ok: true, json: () => Promise.resolve({ data: 'test' }) }
      const fetchOptions = {
        method: 'PUT',
        body: JSON.stringify({ update: 'data' }),
        credentials: 'include' as RequestCredentials,
        cache: 'no-cache' as RequestCache,
      }

      mockLocalStorage.getItem.mockReturnValue(mockApiKey)
      ;(global.fetch ).mockResolvedValue(mockResponse)

      await apiFetch(mockUrl, fetchOptions)

      expect(global.fetch).toHaveBeenCalledWith(mockUrl, {
        ...fetchOptions,
        headers: {
          'x-api-key': mockApiKey,
        },
      })
    })

    it('should return the fetch response', async () => {
      const mockApiKey = 'test-api-key-123'
      const mockUrl = 'https://api.example.com/data'
      const mockResponse = { ok: true, json: () => Promise.resolve({ data: 'test' }) }

      mockLocalStorage.getItem.mockReturnValue(mockApiKey)
      ;(global.fetch).mockResolvedValue(mockResponse)

      const result = await apiFetch(mockUrl)

      expect(result).toBe(mockResponse)
    })

    it('should handle fetch errors', async () => {
      const mockApiKey = 'test-api-key-123'
      const mockUrl = 'https://api.example.com/data'
      const mockError = new Error('Network error')

      mockLocalStorage.getItem.mockReturnValue(mockApiKey)
      ;(global.fetch ).mockRejectedValue(mockError)

      await expect(apiFetch(mockUrl)).rejects.toThrow('Network error')
    })
  })
})
