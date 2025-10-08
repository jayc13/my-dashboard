import { Grid } from '@mui/material';
import type { ReactNode } from 'react';

interface MetricsGridProps {
  children: ReactNode;
}

const MetricsGrid = ({ children }: MetricsGridProps) => {
  return (
    <Grid
      container
      direction="row"
      spacing={2}
      sx={{
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {children}
    </Grid>
  );
};

export default MetricsGrid;
