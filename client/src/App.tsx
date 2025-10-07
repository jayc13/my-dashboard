import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import E2EPage from '@/pages/E2EPage.tsx';
import PullRequestsPage from './pages/PullRequestsPage.tsx';
import TasksPage from './pages/TasksPage.tsx';
import LoginPage from './pages/LoginPage.tsx';
import AppsPage from './pages/AppsPage.tsx';
import NotificationPermission from './components/NotificationPermission';
import { type SnackbarKey, SnackbarProvider, useSnackbar } from 'notistack';
import { CircularProgress, Box, IconButton } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import { SDKProvider } from './contexts/SDKContext';
import { useAuth } from './contexts/useAuth';
import IconClose from '@mui/icons-material/Close';


function SnackbarCloseButton({ snackbarKey } : { snackbarKey: SnackbarKey }) {
  const { closeSnackbar } = useSnackbar();

  return (
    <IconButton onClick={() => closeSnackbar(snackbarKey)}>
      <IconClose />
    </IconButton>
  );
}

// Protected Routes Component
const ProtectedApp: React.FC = () => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '100vh',
                }}
            >
                <CircularProgress/>
            </Box>
        );
    }

    if (!isAuthenticated) {
        return <LoginPage/>;
    }

    return (
        <SDKProvider>
              <Layout>
                  <NotificationPermission/>
                  <Routes>
                      <Route index element={<TasksPage/>}/>
                      <Route path="/e2e-dashboard" element={<E2EPage/>}/>
                      <Route path="/pull_requests" element={<PullRequestsPage/>}/>
                      <Route path="/apps" element={<AppsPage/>}/>
                  </Routes>
                  <SnackbarProvider
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      autoHideDuration={2000}
                      maxSnack={3}
                      action={snackbarKey => <SnackbarCloseButton snackbarKey={snackbarKey} />}
                  />
              </Layout>
        </SDKProvider>
    );
};

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <ProtectedApp/>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;