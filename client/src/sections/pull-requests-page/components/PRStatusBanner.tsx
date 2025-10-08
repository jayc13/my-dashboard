import { Box, Chip, Typography } from '@mui/material';
import type { GithubPullRequestDetails } from '@/types';

export interface PRStatusBannerProps {
  details: GithubPullRequestDetails;
}

const isPullRequestApproved = (details: GithubPullRequestDetails): boolean => {
  return ['clean', 'unstable'].includes(details.mergeableState);
};

const isPullRequestReadyForReview = (details: GithubPullRequestDetails): boolean => {
  return details.labels.some(label => label.name === 'Ready For Review');
};

const PRStatusBanner = ({ details }: PRStatusBannerProps) => {
  // Only show banners for open PRs
  if (details.state !== 'open') {
    return null;
  }

  const isApproved = isPullRequestApproved(details);
  const isReadyForReview = isPullRequestReadyForReview(details);

  // Priority: Approved > Ready for Review
  if (isApproved) {
    return (
      <Box display="flex" alignItems="center" sx={{ backgroundColor: '#e8f5e9', p: 1 }}>
        <Chip
          label="Approved"
          color="success"
          size="small"
          sx={{ fontWeight: 'bold', fontSize: 12, mr: 1 }}
        />
        <Typography variant="caption" color="success.main" fontWeight="bold">
          Ready to merge
        </Typography>
      </Box>
    );
  }

  if (isReadyForReview) {
    return (
      <Box display="flex" alignItems="center" sx={{ backgroundColor: '#e3f2fd', p: 1 }}>
        <Chip
          label="Ready for Review"
          color="info"
          size="small"
          sx={{ fontWeight: 'bold', fontSize: 12, mr: 1 }}
        />
        <Typography variant="caption" color="info.main" fontWeight="bold">
          In Code Review
        </Typography>
      </Box>
    );
  }

  // No banner to show
  return null;
};

export default PRStatusBanner;
