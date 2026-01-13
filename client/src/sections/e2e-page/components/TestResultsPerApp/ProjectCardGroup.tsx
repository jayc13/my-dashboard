import { Grid, Typography, IconButton, Box, Card, CardContent } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import type { AppDetailedE2EReportDetail, DetailedE2EReportDetail } from '@my-dashboard/types';
import React, { useState } from 'react';
import ProjectCard from './ProjectCard';
import { useTheme } from '@mui/material/styles';

interface ProjectCardGroupProps {
  title: string;
  data: DetailedE2EReportDetail[];
  sortedData: DetailedE2EReportDetail[];
  onUpdate: (summaryId: number, appId: number) => Promise<void>;
  onContextMenu: (event: React.MouseEvent, result: AppDetailedE2EReportDetail) => void;
  hiddenByDefault?: boolean;
  backgroundColor?: string;
  status?: 'passing' | 'failing'; // New prop
}

const ProjectCardGroup = ({
  title,
  data,
  sortedData,
  onUpdate,
  onContextMenu,
  hiddenByDefault = false,
  backgroundColor,
  status = 'passing', // Default to 'passing'
}: ProjectCardGroupProps) => {
  const theme = useTheme();
  const [collapsed, setCollapsed] = useState(hiddenByDefault);

  if (!data.length) {
    return null;
  }

  const handleToggleCollapse = () => setCollapsed(prev => !prev);
  const groupBgColor = backgroundColor || theme.palette.background.paper;

  // Title background and text color based on status
  const titleTextColor = theme.palette.text.primary;
  const titleBgColor = status === 'failing' ? theme.palette.error.main : theme.palette.success.main;

  return (
    <Card sx={{ backgroundColor: groupBgColor, borderRadius: 2, p: 0, mb: 2 }}>
      <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
        <Box
          display="flex"
          alignItems="center"
          sx={{
            m: 0,
            borderRadius: 1,
            backgroundColor: titleBgColor,
            color: titleTextColor,
            px: 2,
            py: 1,
          }}
        >
          <IconButton
            size="small"
            onClick={handleToggleCollapse}
            aria-label={collapsed ? 'Expand group' : 'Collapse group'}
            sx={{ mr: 1, color: titleTextColor }}
          >
            {collapsed ? <ExpandMoreIcon /> : <ExpandLessIcon />}
          </IconButton>
          <Typography
            variant="h6"
            component="div"
            sx={{
              userSelect: 'none',
              cursor: 'pointer',
              fontWeight: 'bold',
              color: titleTextColor,
              textShadow: 'none',
            }}
            onClick={handleToggleCollapse}
          >
            {title} ({data.length})
          </Typography>
        </Box>
        {!collapsed && (
          <Grid container spacing={1.5} padding={2}>
            {data.map((result, idx) => {
              const globalIdx = sortedData.indexOf(result);
              const previousValue = globalIdx > 0 ? sortedData[globalIdx - 1] : null;
              return (
                <ProjectCard
                  key={result.appId || idx}
                  result={result}
                  previousValue={previousValue}
                  onUpdate={() => onUpdate(result.reportSummaryId, result.appId)}
                  onContextMenu={onContextMenu}
                />
              );
            })}
          </Grid>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectCardGroup;
