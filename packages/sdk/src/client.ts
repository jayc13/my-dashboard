/**
 * My Dashboard API Client
 * 
 * Main client class that provides access to all API services through composition.
 */

import { BaseClient } from './base-client';
import { E2EService } from './services/e2e-service';
import { ApplicationsService } from './services/applications-service';
import { NotificationsService } from './services/notifications-service';
import { PullRequestsService } from './services/pull-requests-service';
import { AuthService } from './services/auth-service';
import { FCMService, JiraService, TodosService, HealthService } from './services/additional-services';
import { SDKConfig } from './types';

/**
 * Main API client for My Dashboard
 * 
 * Provides access to all API services through a unified interface.
 * Each service is instantiated with the same configuration for consistency.
 */
export class MyDashboardAPI extends BaseClient {
  // Service instances
  public readonly e2e: E2EService;
  public readonly applications: ApplicationsService;
  public readonly notifications: NotificationsService;
  public readonly pullRequests: PullRequestsService;
  public readonly auth: AuthService;
  public readonly fcm: FCMService;
  public readonly jira: JiraService;
  public readonly todos: TodosService;
  public readonly health: HealthService;

  constructor(config: SDKConfig) {
    super(config);

    // Initialize all services with the same configuration
    this.e2e = new E2EService(config);
    this.applications = new ApplicationsService(config);
    this.notifications = new NotificationsService(config);
    this.pullRequests = new PullRequestsService(config);
    this.auth = new AuthService(config);
    this.fcm = new FCMService(config);
    this.jira = new JiraService(config);
    this.todos = new TodosService(config);
    this.health = new HealthService(config);
  }

  // ============================================================================
  // Convenience Methods - Delegate to Services
  // ============================================================================
  
  // E2E Reports convenience methods
  public async getE2EReports(options = {}) {
    return this.e2e.getE2EReports(options); 
  }
  public async getProjectReport(projectName: string, date?: string) {
    return this.e2e.getProjectReport(projectName, date); 
  }
  public async getProjectStatus(projectName: string) {
    return this.e2e.getProjectStatus(projectName); 
  }
  
  // Applications convenience methods
  public async getApplications() {
    return this.applications.getApplications(); 
  }
  public async getApplication(id: number) {
    return this.applications.getApplication(id); 
  }
  public async getApplicationByCode(code: string) {
    return this.applications.getApplicationByCode(code); 
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async createApplication(application: any) {
    return this.applications.createApplication(application); 
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async updateApplication(id: number, updates: any) {
    return this.applications.updateApplication(id, updates); 
  }
  public async deleteApplication(id: number) {
    return this.applications.deleteApplication(id); 
  }
  
  // Notifications convenience methods
  public async getNotifications(options = {}) {
    return this.notifications.getNotifications(options); 
  }
  public async markNotificationAsRead(id: number) {
    return this.notifications.markNotificationAsRead(id); 
  }
  public async deleteNotification(id: number) {
    return this.notifications.deleteNotification(id); 
  }
  
  // Pull Requests convenience methods
  public async getPullRequests() {
    return this.pullRequests.getPullRequests(); 
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async addPullRequest(pullRequest: any) {
    return this.pullRequests.addPullRequest(pullRequest); 
  }
  public async getPullRequestDetails(id: string) {
    return this.pullRequests.getPullRequestDetails(id); 
  }
  public async deletePullRequest(id: string) {
    return this.pullRequests.deletePullRequest(id); 
  }
  
  // Authentication convenience methods
  public async validateApiKey(apiKey: string) {
    return this.auth.validateApiKey(apiKey); 
  }
  public async validateCurrentApiKey() {
    return this.auth.validateCurrentApiKey(); 
  }

  // ============================================================================
  // Configuration Management
  // ============================================================================

  /**
   * Update the API key for all services
   */
  public setApiKey(apiKey: string): void {
    super.setApiKey(apiKey);
    // Update all service instances
    this.e2e.setApiKey(apiKey);
    this.applications.setApiKey(apiKey);
    this.notifications.setApiKey(apiKey);
    this.pullRequests.setApiKey(apiKey);
    this.auth.setApiKey(apiKey);
    this.fcm.setApiKey(apiKey);
    this.jira.setApiKey(apiKey);
    this.todos.setApiKey(apiKey);
    this.health.setApiKey(apiKey);
  }

  /**
   * Update the base URL for all services
   */
  public setBaseUrl(baseUrl: string): void {
    super.setBaseUrl(baseUrl);
    // Update all service instances
    this.e2e.setBaseUrl(baseUrl);
    this.applications.setBaseUrl(baseUrl);
    this.notifications.setBaseUrl(baseUrl);
    this.pullRequests.setBaseUrl(baseUrl);
    this.auth.setBaseUrl(baseUrl);
    this.fcm.setBaseUrl(baseUrl);
    this.jira.setBaseUrl(baseUrl);
    this.todos.setBaseUrl(baseUrl);
    this.health.setBaseUrl(baseUrl);
  }
}
