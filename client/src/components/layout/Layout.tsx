import {Box} from '@mui/material';
import Header from './Header';

interface DashboardProps {
    children: React.ReactNode;
}

const Layout = ({children}: DashboardProps) => {
    return (
        <Box sx={{
            display: 'flex',
            maxHeight: '100vh',
        }}>
            <Header/>
            {/* Main content */}
            <Box
                component="main"
                sx={(theme) => ({
                    flexGrow: 1,
                    width: '100%',
                    marginTop: '64px',
                    padding: theme.spacing(3),
                    paddingTop: 0,
                    overflow: 'auto',
                })}
            >
                {children}
            </Box>
        </Box>
    );
};

export default Layout;