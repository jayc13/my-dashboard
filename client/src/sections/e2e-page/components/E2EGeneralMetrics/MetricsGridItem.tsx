import { Grid } from '@mui/material';
import type { ReactNode } from 'react';

interface MetricsGridItemProps {
    children: ReactNode;
}

const MetricsGridItem = ({ children }: MetricsGridItemProps) => {
    return (
        <Grid size={{ xs: 12, sm: 6, md: 6, lg: 3 }}>
            {children}
        </Grid>
    );
};

export default MetricsGridItem;

