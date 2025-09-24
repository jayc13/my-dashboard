import { v4 as uuidv4 } from 'uuid';
import { ThirdPartyAPICall, APICallSummary, RegistryStats } from '../types';

/**
 * Registry for tracking all third-party API calls made to GitHub, CircleCI, Cypress, and Jira
 */
export class APICallRegistry {
  private calls: ThirdPartyAPICall[] = [];
  private maxSize: number;

  constructor(maxSize: number = 10000) {
    this.maxSize = maxSize;
  }

  /**
   * Register a new API call to a third-party service
   */
  registerCall(
    service: 'github' | 'circleci' | 'cypress' | 'jira',
    method: string,
    path: string,
    fullUrl: string,
    headers: Record<string, string>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    query: Record<string, any>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    body: any,
    ip?: string,
    userAgent?: string
  ): string {
    const id = uuidv4();
    const call: ThirdPartyAPICall = {
      id,
      timestamp: new Date().toISOString(),
      service,
      method: method.toUpperCase(),
      path,
      fullUrl,
      headers: { ...headers },
      query: { ...query },
      body: body ? JSON.parse(JSON.stringify(body)) : null,
      ip: ip || undefined,
      userAgent: userAgent || undefined,
    };

    this.calls.unshift(call);

    // Maintain max size by removing oldest calls
    if (this.calls.length > this.maxSize) {
      this.calls = this.calls.slice(0, this.maxSize);
    }

    console.log(`[${service.toUpperCase()}] ${method} ${path} - Call registered with ID: ${id}`);
    return id;
  }

  /**
   * Update a call with response information
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateCallResponse(id: string, status: number, responseBody: any, responseTime: number): void {
    const call = this.calls.find(c => c.id === id);
    if (call) {
      call.responseStatus = status;
      call.responseBody = responseBody ? JSON.parse(JSON.stringify(responseBody)) : null;
      call.responseTime = responseTime;
    }
  }

  /**
   * Get all registered calls
   */
  getAllCalls(): ThirdPartyAPICall[] {
    return [...this.calls];
  }

  /**
   * Get calls filtered by service
   */
  getCallsByService(service: 'github' | 'circleci' | 'cypress' | 'jira'): ThirdPartyAPICall[] {
    return this.calls.filter(call => call.service === service);
  }

  /**
   * Get calls within a time range
   */
  getCallsInTimeRange(startTime: Date, endTime: Date): ThirdPartyAPICall[] {
    return this.calls.filter(call => {
      const callTime = new Date(call.timestamp);
      return callTime >= startTime && callTime <= endTime;
    });
  }

  /**
   * Get summary statistics of all calls
   */
  getSummary(): APICallSummary {
    if (this.calls.length === 0) {
      return {
        totalCalls: 0,
        uniqueEndpoints: 0,
        serviceBreakdown: {},
        methodBreakdown: {},
        statusBreakdown: {},
        averageResponseTime: 0,
        timeRange: {
          earliest: '',
          latest: ''
        }
      };
    }

    const serviceBreakdown: Record<string, number> = {};
    const methodBreakdown: Record<string, number> = {};
    const statusBreakdown: Record<string, number> = {};
    const uniqueEndpoints = new Set<string>();
    let totalResponseTime = 0;
    let responseTimeCount = 0;

    this.calls.forEach(call => {
      // Service breakdown
      serviceBreakdown[call.service] = (serviceBreakdown[call.service] || 0) + 1;
      
      // Method breakdown
      methodBreakdown[call.method] = (methodBreakdown[call.method] || 0) + 1;
      
      // Status breakdown
      if (call.responseStatus) {
        const statusGroup = `${Math.floor(call.responseStatus / 100)}xx`;
        statusBreakdown[statusGroup] = (statusBreakdown[statusGroup] || 0) + 1;
      }
      
      // Unique endpoints
      uniqueEndpoints.add(`${call.service}:${call.method}:${call.path}`);
      
      // Response time
      if (call.responseTime) {
        totalResponseTime += call.responseTime;
        responseTimeCount++;
      }
    });

    const sortedCalls = [...this.calls].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    return {
      totalCalls: this.calls.length,
      uniqueEndpoints: uniqueEndpoints.size,
      serviceBreakdown,
      methodBreakdown,
      statusBreakdown,
      averageResponseTime: responseTimeCount > 0 ? totalResponseTime / responseTimeCount : 0,
      timeRange: {
        earliest: sortedCalls[0]?.timestamp || '',
        latest: sortedCalls[sortedCalls.length - 1]?.timestamp || ''
      }
    };
  }

  /**
   * Get registry statistics
   */
  getStats(): RegistryStats {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const callsToday = this.calls.filter(call => 
      new Date(call.timestamp) >= today
    ).length;

    // Get top endpoints
    const endpointCounts: Record<string, number> = {};
    this.calls.forEach(call => {
      const key = `${call.service}:${call.path}`;
      endpointCounts[key] = (endpointCounts[key] || 0) + 1;
    });

    const topEndpoints = Object.entries(endpointCounts)
      .map(([endpoint, count]) => {
        const [service, path] = endpoint.split(':', 2);
        return { service: service || '', endpoint: path || '', count };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalCalls: this.calls.length,
      callsToday,
      topEndpoints,
      recentCalls: this.calls.slice(0, 20)
    };
  }

  /**
   * Clear all registered calls
   */
  clear(): void {
    this.calls = [];
    console.log('API call registry cleared');
  }

  /**
   * Export calls as JSON
   */
  exportCalls(): string {
    return JSON.stringify(this.calls, null, 2);
  }

  /**
   * Get calls count
   */
  getCallsCount(): number {
    return this.calls.length;
  }
}

// Singleton instance
export const apiCallRegistry = new APICallRegistry(
  parseInt(process.env.MAX_REGISTRY_SIZE || '10000', 10)
);
