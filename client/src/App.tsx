import {SWRConfig} from "swr";
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import Layout from './components/layout/Layout';
import E2EPage from './pages/E2EPage.tsx';
import PullRequestsPage from "./pages/PullRequestsPage.tsx";
import TasksPage from "./pages/TasksPage.tsx";
import LoginPage from "./pages/LoginPage.tsx";
import AppsPage from "./pages/AppsPage.tsx";
import NotificationPermission from './components/NotificationPermission';
import { apiFetch } from './utils/helpers';
import {SnackbarProvider} from "notistack";
import { CircularProgress, Box } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/useAuth';

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
                <CircularProgress />
            </Box>
        );
    }

    if (!isAuthenticated) {
        return <LoginPage />;
    }

    return (
        <SWRConfig
            value={{
                fetcher: (resource, init) => apiFetch(resource, init).then(res => {
                    if (!res.ok) {
                        throw new Error(`HTTP error! status: ${res.status}`);
                    }
                    return res.json();
                })
            }}
        >
            <Layout>
                <NotificationPermission />
                <Routes>
                    <Route index element={<TasksPage/>}/>
                    <Route path="/e2e-dashboard" element={<E2EPage/>}/>
                    <Route path="/pull_requests" element={<PullRequestsPage/>}/>
                    <Route path="/apps" element={<AppsPage/>}/>
                </Routes>
                <SnackbarProvider
                    anchorOrigin={{vertical: 'top', horizontal: 'center'}}
                    autoHideDuration={2000}
                />
            </Layout>
        </SWRConfig>
    );
};

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <ProtectedApp />
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;