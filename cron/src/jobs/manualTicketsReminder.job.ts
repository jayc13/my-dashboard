import { API_BASE_URL } from '../utils/constants';
import { apiFetch } from '../utils/helpers';
import { publishNotificationRequest } from './notification.job';

const manualTicketsReminderJob = async () => {
  console.log('Checking for Manual Testing tickets...');
  const requestAllTickets = await apiFetch(`${API_BASE_URL}/api/jira/manual_qa`);
  const { issues } = await requestAllTickets.json();

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