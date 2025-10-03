import { Chip } from '@mui/material';
import TrendDownIcon from '@mui/icons-material/TrendingDown';
import TrendUpIcon from '@mui/icons-material/TrendingUp';
import type { ChipColor, TrendDirection } from './types';

interface TrendChipProps {
    trend: TrendDirection;
    trendLabel: string;
    color: ChipColor;
}

const getTrendIcon = (trend: TrendDirection) => {
    if (trend === 'up') {
        return <TrendUpIcon />;
    } else {
        return <TrendDownIcon />;
    }
};

const TrendChip = ({ trend, trendLabel, color }: TrendChipProps) => {
    return (
        <Chip
            label={trendLabel}
            icon={getTrendIcon(trend)}
            color={color}
            size="small"
            variant="outlined"
            sx={{ marginBottom: 1 }}
        />
    );
};

export default TrendChip;

