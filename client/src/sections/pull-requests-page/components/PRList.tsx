import { Grid } from '@mui/material';
import PRCard from './PRCard';
import type { PullRequest } from '@/types';

export interface PRListProps {
  pullRequests: PullRequest[];
  onDelete: (id: string) => void;
}

const PRList = ({ pullRequests, onDelete }: PRListProps) => {
  return (
    <>
      {pullRequests.map((pr: PullRequest) => (
        <Grid key={pr.id} size={{ xs: 12 }}>
          <PRCard pr={pr} onDelete={onDelete} />
        </Grid>
      ))}
    </>
  );
};

export default PRList;
