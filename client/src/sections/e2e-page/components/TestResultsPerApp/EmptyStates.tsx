import { Alert, Card } from '@mui/material';

export const NoTestResults = () => {
  return (
    <Card style={{ padding: 24, marginTop: 16 }}>
      <Alert severity="info">No test results available.</Alert>
    </Card>
  );
};

export const AllTestsPassing = () => {
  return (
    <Card style={{ padding: 24, marginTop: 16 }}>
      <Alert severity="success">All apps are passing! No failures to display.</Alert>
    </Card>
  );
};
