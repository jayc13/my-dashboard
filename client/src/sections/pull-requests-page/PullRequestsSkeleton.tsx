import { Box, Grid, Skeleton } from '@mui/material';
import React from 'react';

const PullRequestsSkeleton: React.FC = () => (
  <Box p={0}>
    <Grid container spacing={2}>
      {[...Array(5)].map((_, idx) => (
        <Skeleton variant="rectangular" width="100%" key={idx}>
          <div style={{ paddingTop: 40, paddingBottom: 40 }} />
        </Skeleton>
      ))}
    </Grid>
  </Box>
);

export default PullRequestsSkeleton;

