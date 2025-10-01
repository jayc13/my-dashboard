import { E2EReportMessage } from '@my-dashboard/types';
import { DateTime } from 'luxon';
import { getRedisClient } from '../utils/redis';
import { v4 as uuidv4 } from 'uuid';

/**
 * Publish a message to generate an E2E report
 */
export async function publishE2EReportRequest(date: string, requestId?: string): Promise<void> {
  const client = getRedisClient();
  const message: E2EReportMessage = {
    date,
    requestId,
  };

  await client.publish('e2e:report:generate', JSON.stringify(message));
  console.log(`[E2E Report Publisher] Published report request for date: ${date}`);
}

const reportE2eJob = async (): Promise<void> => {
  try{
    const requestId = uuidv4();

    const date:string = DateTime.now().toUTC().toISODate().slice(0, 10);

    console.log('='.repeat(60));
    console.log('Publishing E2E Report Request');
    console.log('='.repeat(60));
    console.log(`Date: ${date}`);
    console.log(`Request ID: ${requestId}`);
    console.log('='.repeat(60));
    
    await publishE2EReportRequest(date, requestId);
  } catch (error) {
    console.error('Error running E2E Report job:', error);
  }
  return;
};

export default reportE2eJob;