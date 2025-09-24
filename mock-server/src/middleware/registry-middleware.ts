import { Request, Response, NextFunction } from 'express';
import { apiCallRegistry } from '../registry/api-call-registry';

/**
 * Middleware to automatically register all incoming API calls to third-party services
 */
export function createRegistryMiddleware(service: 'github' | 'circleci' | 'cypress' | 'jira') {
  return (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    
    // Extract request information
    const method = req.method;
    const path = req.path;
    const fullUrl = req.originalUrl;
    const headers = { ...req.headers } as Record<string, string>;
    const query = { ...req.query };
    const body = req.body;
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');

    // Register the call
    const callId = apiCallRegistry.registerCall(
      service,
      method,
      path,
      fullUrl,
      headers,
      query,
      body,
      ip,
      userAgent
    );

    // Store call ID in response locals for later use
    res.locals.callId = callId;
    res.locals.startTime = startTime;

    // Override res.json to capture response
    const originalJson = res.json;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    res.json = function(responseBody: any) {
      const responseTime = Date.now() - startTime;
      
      // Update the registry with response information
      apiCallRegistry.updateCallResponse(
        callId,
        res.statusCode,
        responseBody,
        responseTime
      );

      // Log the completed call
      console.log(
        `[${service.toUpperCase()}] ${method} ${path} - ${res.statusCode} (${responseTime}ms)`
      );

      // Call original json method
      return originalJson.call(this, responseBody);
    };

    // Override res.send to capture non-JSON responses
    const originalSend = res.send;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    res.send = function(responseBody: any) {
      const responseTime = Date.now() - startTime;
      
      // Update the registry with response information
      apiCallRegistry.updateCallResponse(
        callId,
        res.statusCode,
        responseBody,
        responseTime
      );

      // Log the completed call
      console.log(
        `[${service.toUpperCase()}] ${method} ${path} - ${res.statusCode} (${responseTime}ms)`
      );

      // Call original send method
      return originalSend.call(this, responseBody);
    };

    next();
  };
}

/**
 * Middleware to log API call statistics periodically
 */
export function createStatsLoggingMiddleware(intervalMinutes: number = 30) {
  let lastLogTime = Date.now();
  
  return (_req: Request, _res: Response, next: NextFunction) => {
    const now = Date.now();
    const timeSinceLastLog = now - lastLogTime;
    const intervalMs = intervalMinutes * 60 * 1000;

    if (timeSinceLastLog >= intervalMs) {
      const stats = apiCallRegistry.getStats();
      console.log('\n=== Third-Party API Call Statistics ===');
      console.log(`Total calls registered: ${stats.totalCalls}`);
      console.log(`Calls today: ${stats.callsToday}`);
      console.log('Top endpoints:');
      stats.topEndpoints.slice(0, 5).forEach((endpoint, index) => {
        console.log(`  ${index + 1}. [${endpoint.service.toUpperCase()}] ${endpoint.endpoint} (${endpoint.count} calls)`);
      });
      console.log('=====================================\n');
      
      lastLogTime = now;
    }

    next();
  };
}
