import * as dotenv from 'dotenv';
import { Logger } from '../utils/logger';

dotenv.config({ quiet: true });

export interface CircleCIPipelineResponse {
    id: string;
    state: string;
    number: number;
    created_at: string;
}

export interface CircleCIWorkflow {
    pipeline_id: string;
    id: string;
    name: string;
    project_slug: string;
    status: string;
    started_by: string;
    pipeline_number: number;
    created_at: string;
    stopped_at?: string;
}

export interface CircleCIWorkflowResponse {
    items: CircleCIWorkflow[];
    next_page_token?: string;
}

export class CircleCIService {

  /**
     * Triggers E2E runs in Circle CI
     * Makes an API call to trigger the pipeline with E2E test parameters
     * @param requestBodyJson - JSON string containing the request body with branch and parameters
     */
  static async triggerE2ERuns(requestBodyJson: string): Promise<CircleCIPipelineResponse> {
    const circleToken = process.env.CIRCLE_CI_TOKEN;
    const baseUrl = process.env.CIRCLE_CI_BASE_URL;
    const projectPath = process.env.CIRCLE_CI_PROJECT_PATH;

    if (!circleToken) {
      throw new Error('CIRCLE_CI_TOKEN environment variable is required');
    }

    if (!baseUrl) {
      throw new Error('CIRCLE_CI_BASE_URL environment variable is required');
    }

    if (!projectPath) {
      throw new Error('CIRCLE_CI_PROJECT_PATH environment variable is required');
    }

    // Validate and parse the JSON request body
    try {
      JSON.parse(requestBodyJson);
    } catch {
      throw new Error('Invalid JSON format in request body parameter');
    }

    try {
      Logger.info('Triggering Circle CI E2E pipeline');

      const pipelineUrl = `${baseUrl}/v2/project/github/${projectPath}/pipeline`;

      const response = await fetch(pipelineUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'circle-token': circleToken,
        },
        body: requestBodyJson, // Use the original JSON string directly
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Circle CI API request failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result: CircleCIPipelineResponse = await response.json();

      Logger.info('Circle CI pipeline triggered successfully', {
        pipelineId: result.id,
        pipelineNumber: result.number,
      });

      return result;
    } catch (error) {
      Logger.error('Failed to trigger Circle CI E2E runs', { error });
      throw error;
    }
  }

  static async getPipelineLatestWorkflow(pipelineId: string): Promise<CircleCIWorkflow> {
    const circleToken = process.env.CIRCLE_CI_TOKEN;
    const baseUrl = process.env.CIRCLE_CI_BASE_URL;

    if (!circleToken) {
      throw new Error('CIRCLE_CI_TOKEN environment variable is required');
    }

    if (!pipelineId) {
      throw new Error('Pipeline ID is required');
    }

    if (!baseUrl) {
      throw new Error('CIRCLE_CI_BASE_URL environment variable is required');
    }

    const apiUrl = `${baseUrl}/v2/pipeline/${pipelineId}/workflow`;

    try {
      Logger.debug('Getting Circle CI pipeline status', { pipelineId });

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'circle-token': circleToken,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Circle CI API request failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result: CircleCIWorkflowResponse = await response.json();

      const workflow = result.items && result.items.length > 0 ? result.items[0] : null;

      if (!workflow) {
        throw new Error('No workflow named "integration_tests" found in the pipeline');
      }

      return workflow;
    } catch (error) {
      Logger.error('Failed to get Circle CI pipeline status', { pipelineId, error });
      throw error;
    }
  }
}
