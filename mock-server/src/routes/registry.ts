import { Router } from 'express';
import { apiCallRegistry } from '../registry/api-call-registry';

/**
 * Registry management endpoints for viewing and managing API call logs
 */
export function createRegistryRouter(): Router {
  const router = Router();

  // GET /registry/calls
  // Get all registered API calls with optional filtering
  router.get('/calls', (req, res) => {
    const { service, method, limit, offset, startDate, endDate } = req.query;

    let calls = apiCallRegistry.getAllCalls();

    // Filter by service
    if (service && typeof service === 'string') {
      calls = calls.filter(call => call.service === service);
    }

    // Filter by method
    if (method && typeof method === 'string') {
      calls = calls.filter(call => call.method === method.toUpperCase());
    }

    // Filter by date range
    if (startDate && typeof startDate === 'string') {
      const start = new Date(startDate);
      calls = calls.filter(call => new Date(call.timestamp) >= start);
    }

    if (endDate && typeof endDate === 'string') {
      const end = new Date(endDate);
      calls = calls.filter(call => new Date(call.timestamp) <= end);
    }

    // Pagination
    const limitNum = limit ? parseInt(limit as string, 10) : 100;
    const offsetNum = offset ? parseInt(offset as string, 10) : 0;
    const paginatedCalls = calls.slice(offsetNum, offsetNum + limitNum);

    res.json({
      calls: paginatedCalls,
      total: calls.length,
      limit: limitNum,
      offset: offsetNum,
      hasMore: offsetNum + limitNum < calls.length
    });
  });

  // GET /registry/calls/{service}
  // Get calls for a specific service
  router.get('/calls/:service', (req, res) => {
    const { service } = req.params;
    const { limit = '100', offset = '0' } = req.query;

    if (!['github', 'circleci', 'cypress', 'jira'].includes(service)) {
      res.status(400).json({
        error: 'Invalid service. Must be one of: github, circleci, cypress, jira'
      });
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const calls = apiCallRegistry.getCallsByService(service as any);
    
    // Pagination
    const limitNum = parseInt(limit as string, 10);
    const offsetNum = parseInt(offset as string, 10);
    const paginatedCalls = calls.slice(offsetNum, offsetNum + limitNum);

    res.json({
      service,
      calls: paginatedCalls,
      total: calls.length,
      limit: limitNum,
      offset: offsetNum,
      hasMore: offsetNum + limitNum < calls.length
    });
  });

  // GET /registry/summary
  // Get summary statistics of all API calls
  router.get('/summary', (_req, res) => {
    const summary = apiCallRegistry.getSummary();
    res.json(summary);
  });

  // GET /registry/stats
  // Get registry statistics
  router.get('/stats', (_req, res) => {
    const stats = apiCallRegistry.getStats();
    res.json(stats);
  });

  // GET /registry/export
  // Export all calls as JSON
  router.get('/export', (req, res) => {
    const { format = 'json' } = req.query;

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="api-calls-${new Date().toISOString().split('T')[0]}.json"`);
      res.send(apiCallRegistry.exportCalls());
    } else {
      res.status(400).json({
        error: 'Unsupported format. Only "json" is currently supported.'
      });
    }
  });

  // DELETE /registry/calls
  // Clear all registered calls
  router.delete('/calls', (_req, res) => {
    const callsCount = apiCallRegistry.getCallsCount();
    apiCallRegistry.clear();
    
    res.json({
      message: 'Registry cleared successfully',
      clearedCalls: callsCount
    });
  });

  // GET /registry/health
  // Health check for the registry system
  router.get('/health', (_req, res) => {
    const stats = apiCallRegistry.getStats();
    const maxSize = parseInt(process.env.MAX_REGISTRY_SIZE || '10000', 10);
    
    res.json({
      status: 'healthy',
      registrySize: stats.totalCalls,
      maxSize,
      utilizationPercent: Math.round((stats.totalCalls / maxSize) * 100),
      callsToday: stats.callsToday,
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    });
  });

  // GET /registry/calls/search
  // Search calls by path, headers, or body content
  router.get('/calls/search', (req, res) => {
    const { q, service, method, limit = '50', offset = '0' } = req.query;

    if (!q || typeof q !== 'string') {
      res.status(400).json({
        error: 'Query parameter "q" is required'
      });
      return;
    }

    let calls = apiCallRegistry.getAllCalls();

    // Filter by service if specified
    if (service && typeof service === 'string') {
      calls = calls.filter(call => call.service === service);
    }

    // Filter by method if specified
    if (method && typeof method === 'string') {
      calls = calls.filter(call => call.method === method.toUpperCase());
    }

    // Search in path, headers, and body
    const searchTerm = q.toLowerCase();
    const matchingCalls = calls.filter(call => {
      // Search in path
      if (call.path.toLowerCase().includes(searchTerm)) {
        return true;
      }

      // Search in headers
      const headersStr = JSON.stringify(call.headers).toLowerCase();
      if (headersStr.includes(searchTerm)) {
        return true;
      }

      // Search in body
      if (call.body) {
        const bodyStr = JSON.stringify(call.body).toLowerCase();
        if (bodyStr.includes(searchTerm)) {
          return true;
        }
      }

      // Search in response body
      if (call.responseBody) {
        const responseStr = JSON.stringify(call.responseBody).toLowerCase();
        if (responseStr.includes(searchTerm)) {
          return true;
        }
      }

      return false;
    });

    // Pagination
    const limitNum = parseInt(limit as string, 10);
    const offsetNum = parseInt(offset as string, 10);
    const paginatedCalls = matchingCalls.slice(offsetNum, offsetNum + limitNum);

    res.json({
      query: q,
      calls: paginatedCalls,
      total: matchingCalls.length,
      limit: limitNum,
      offset: offsetNum,
      hasMore: offsetNum + limitNum < matchingCalls.length
    });
  });

  return router;
}
