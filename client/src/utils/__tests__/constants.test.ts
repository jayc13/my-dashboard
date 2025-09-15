import { vi } from 'vitest'

// Mock import.meta.env
const mockEnv = {
  VITE_API_URL: undefined,
}

vi.stubGlobal('import', {
  meta: {
    env: mockEnv,
  },
})

describe('constants', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset the module cache to ensure fresh imports
    vi.resetModules()
  })

  describe('WEBSITE_LOGO', () => {
    it('should export the correct logo path', async () => {
      const { WEBSITE_LOGO } = await import('../constants')
      expect(WEBSITE_LOGO).toBe('/logo.png')
    })
  })

  describe('API_BASE_URL', () => {
    it('should use environment variable when available', async () => {
      mockEnv.VITE_API_URL = 'https://api.production.com'
      
      const { API_BASE_URL } = await import('../constants')
      expect(API_BASE_URL).toBe('https://api.production.com')
    })

    it('should use default localhost when environment variable is not set', async () => {
      mockEnv.VITE_API_URL = undefined
      
      const { API_BASE_URL } = await import('../constants')
      expect(API_BASE_URL).toBe('http://localhost:3000')
    })

    it('should use default localhost when environment variable is empty', async () => {
      mockEnv.VITE_API_URL = ''
      
      const { API_BASE_URL } = await import('../constants')
      expect(API_BASE_URL).toBe('http://localhost:3000')
    })
  })

  describe('API_KEY_STORAGE_KEY', () => {
    it('should export the correct storage key', async () => {
      const { API_KEY_STORAGE_KEY } = await import('../constants')
      expect(API_KEY_STORAGE_KEY).toBe('dashboard_api_key')
    })
  })
})
