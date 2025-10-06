import { getSDK } from '@/utils/sdk';
import { publishNotificationRequest } from '@/services/notification.service';

const manualTicketsReminderJob = async () => {
  console.log('Checking for Manual Testing tickets...');
  const sdk = await getSDK();
  const { issues } = await sdk.jira.getManualQATasks();

  const size = issues.length;

  if (size > 0) {
    // Create a notification using Redis producer
    await publishNotificationRequest({
      title: 'Manual Testing Tickets - Reminder',
      message: `There ${size > 1 ? 'are' : 'is'} ${size} ticket${size > 1 ? 's' : ''} that need${size > 1 ? '' : 's'} attention.`,
      type: 'warning',
      link: '/',
    });
  }
};

export default manualTicketsReminderJob;