import { Box, Grid, Skeleton } from '@mui/material';
import { PAGE_SIZE } from './constants';

const LoadingState = () => {
    return (
        <Box sx={{ marginTop: 2 }}>
            <Grid container spacing={1.5}>
                {[...Array(PAGE_SIZE)].map((_, idx) =>
                    <Grid size={{ xs: 12 }} key={idx}>
                        <Skeleton key={idx} variant="rounded" height={44}/>
                    </Grid>,
                )}
            </Grid>
        </Box>
    );
};

export default LoadingState;

