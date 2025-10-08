import { getRedisSubscriber } from '../config/redis';
import { PullRequestService } from '../services/pull_request.service';
import { Logger } from '../utils/logger';
import * as dotenv from 'dotenv';

dotenv.config({ quiet: true });

/**
 * Pull Request Deletion Request
 */
interface PullRequestDeletionRequest {
  id: string;
  pullRequestNumber: number;
  repository: string;
  reason?: string;
}

/**
 * Pull Request Processor
 *
 * This processor listens to Redis messages and handles pull request operations
 * such as deleting merged PRs from the database.
 */
export class PullRequestProcessor {
  private static instance: PullRequestProcessor;
  private subscriber: ReturnType<typeof getRedisSubscriber>;
  private readonly CHANNEL_NAME = 'pull-request:delete';
  private pullRequestService: PullRequestService;

  private constructor() {
    this.subscriber = getRedisSubscriber();
    this.pullRequestService = new PullRequestService();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): PullRequestProcessor {
    if (!PullRequestProcessor.instance) {
      PullRequestProcessor.instance = new PullRequestProcessor();
    }
    return PullRequestProcessor.instance;
  }

  /**
   * Start listening for messages
   */
  public async start(): Promise<void> {
    Logger.debug('[Pull Request Processor] Starting...');

    // Subscribe to the channel
    await this.subscriber.subscribe(this.CHANNEL_NAME);
    Logger.debug('[Pull Request Processor] Subscribed to channel', { channel: this.CHANNEL_NAME });

    // Handle incoming messages
    this.subscriber.on('message', async (channel, message) => {
      if (channel === this.CHANNEL_NAME) {
        await this.handleMessage(message);
      }
    });

    Logger.debug('[Pull Request Processor] Started successfully');
  }

  /**
   * Stop the processor
   */
  public async stop(): Promise<void> {
    Logger.debug('[Pull Request Processor] Stopping...');
    await this.subscriber.unsubscribe(this.CHANNEL_NAME);
    Logger.debug('[Pull Request Processor] Stopped');
  }

  /**
   * Handle incoming message
   */
  private async handleMessage(message: string): Promise<void> {
    try {
      const payload: PullRequestDeletionRequest = JSON.parse(message);
      Logger.debug('[Pull Request Processor] Received deletion request', { payload });

      await this.deletePullRequest(payload);
    } catch (error) {
      Logger.error('[Pull Request Processor] Error handling message', { error });
    }
  }

  /**
   * Delete pull request from database
   */
  private async deletePullRequest(payload: PullRequestDeletionRequest): Promise<void> {
    const { id, pullRequestNumber, repository, reason } = payload;

    Logger.debug('[Pull Request Processor] Deleting pull request', {
      id,
      pullRequestNumber,
      repository,
      reason,
    });

    try {
      await this.pullRequestService.deletePullRequest(id);

      Logger.info('[Pull Request Processor] Successfully deleted pull request', {
        id,
        pullRequestNumber,
        repository,
        reason,
      });
    } catch (error) {
      Logger.error('[Pull Request Processor] Error deleting pull request', {
        id,
        pullRequestNumber,
        repository,
        error,
      });
      // Don't throw - just log the error and continue
    }
  }
}

