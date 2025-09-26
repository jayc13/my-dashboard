// import { API_BASE_URL } from '../utils/constants';
// import { apiFetch } from '../utils/helpers';

const manualTicketsReminderJob = async () => {
  console.log('Checking for Manual Testing tickets...');
  // const requestAllTickets = await apiFetch(`${API_BASE_URL}/api/jira/manual_qa`);
  // const { issues } = await requestAllTickets.json();

  // const size = issues.length;

  // if (size > 0) {
  //   await apiFetch(`${API_BASE_URL}/api/notifications`, {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify({
  //       title: 'Manual Testing Tickets - Reminder',
  //       message: `There ${size > 1 ? 'is ' : 'are'} ${size} tickets that needs attention.`,
  //       link: '/',
  //       type: 'warning',
  //     }),
  //   });
  // }

};

export default manualTicketsReminderJob;