import { Backdrop, CircularProgress, Stack, Typography } from '@mui/material';
import type { DetailedE2EReport } from '@my-dashboard/types';

interface LoadingBackdropProps {
  data: DetailedE2EReport | null | undefined;
}

const LoadingBackdrop = (props: LoadingBackdropProps) => {
  const { data } = props;

  const open = !!data && data.summary.status === 'pending';

  const message = data?.message || 'Loading...';

  return (
    <Backdrop sx={theme => ({ color: '#fff', zIndex: theme.zIndex.appBar - 2 })} open={open}>
      <Stack direction="column" alignItems="center" spacing={2}>
        <CircularProgress color="inherit" size={60} />
        <Typography variant="h6" color="inherit">
          {message}
        </Typography>
      </Stack>
    </Backdrop>
  );
};

export default LoadingBackdrop;
