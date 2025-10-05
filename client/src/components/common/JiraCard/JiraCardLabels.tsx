import { Box, Chip } from '@mui/material';

interface JiraCardLabelsProps {
  labels: string[];
  maxVisible?: number;
}

/**
 * Displays ticket labels with overflow indicator
 */
const JiraCardLabels = (props: JiraCardLabelsProps) => {
  const { labels, maxVisible = 3 } = props;

  if (!labels || labels.length === 0) {
    return null;
  }

  return (
    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
      {labels.slice(0, maxVisible).map((label) => (
        <Chip
          key={label}
          label={label}
          size="small"
          variant="outlined"
          sx={{
            height: 20,
            fontSize: '0.7rem',
            borderRadius: 1,
          }}
        />
      ))}
      {labels.length > maxVisible && (
        <Chip
          label={`+${labels.length - maxVisible}`}
          size="small"
          variant="outlined"
          sx={{
            height: 20,
            fontSize: '0.7rem',
            borderRadius: 1,
          }}
        />
      )}
    </Box>
  );
};

export default JiraCardLabels;

