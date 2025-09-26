import { API_BASE_URL } from '../utils/constants';
import { apiFetch } from '../utils/helpers';

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 60 * 1000;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const reportE2eJob = async (attempt = 1): Promise<void> => {
  console.log(`Report E2E job started (attempt: ${attempt})`);
  async function retryAfterDelay(): Promise<void> {
    if (attempt < MAX_RETRIES) {
      await sleep(RETRY_DELAY_MS);
      await reportE2eJob(attempt + 1);
    } else {
      console.error('Max retries reached. E2E Report job failed.');
    }
  }
  try {
    const res = await apiFetch(`${API_BASE_URL}/api/e2e_reports`);
    if (!res.ok) {
      console.log(res);
      console.error(`Error running E2E Report job (attempt ${attempt})`);
      await retryAfterDelay();
    }
    // Create a notification saying the E2E Report job was successful
    // const today = new Date().toISOString().split('T')[0];
    // await apiFetch(`${API_BASE_URL}/api/notifications`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     title: 'E2E Report',
    //     message: `The E2E report for ${today} has been generated successfully`,
    //     link: '/e2e-dashboard',
    //     type: 'success',
    //   }),
    // });
    const result = await res.json();
    if (result && result.length > 0) {
      for (const project of result) {
        if (project.lastRunStatus === 'failed') {
          // await apiFetch(`${API_BASE_URL}/api/notifications`, {
          //   method: 'POST',
          //   headers: {
          //     'Content-Type': 'application/json',
          //   },
          //   body: JSON.stringify({
          //     title: `E2E Report for ${project.projectName}`,
          //     message: `The latest E2E run for ${project.projectName} has failed. Please check the dashboard for details.`,
          //     link: `https://cloud.cypress.io/projects/${project.projectCode}/runs`,
          //     type: 'error',
          //   }),
          // });
        }
      }
    }
    console.log('E2E Report job completed successfully');
  } catch (error) {
    console.error(`Error running E2E Report job (attempt ${attempt}):`, error);
    await retryAfterDelay();
  }
  return;
};

export default reportE2eJob;