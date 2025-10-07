import Tooltip from '@mui/material/Tooltip';
import InfoOutlineIcon from '@mui/icons-material/InfoOutline';

export const getColorByPassingRate = (rate: number) => {
    if (rate >= 0.8) {
        return 'green';
    }
    if (rate >= 0.5) {
        return 'orange';
    }
    return 'red';
};

export function wantedQuantity(targetRate: number, passedRuns: number, totalRuns: number): number {
    return Math.ceil(((totalRuns * targetRate) - passedRuns) / (1 - targetRate));
}

export const getTooltipByPassingRate = (passedRuns: number, totalRuns: number, passingRate: number) => {
    if (passingRate >= 0.9) {
        return <InfoOutlineIcon sx={{ fontSize: 15, visibility: 'hidden' }}/>;
    }

    const runsFor80Percent = wantedQuantity(0.8, passedRuns, totalRuns);
    const runsFor90Percent = wantedQuantity(0.9, passedRuns, totalRuns);

    let tooltipText = <span>
           For 90%: <strong>{runsFor90Percent}</strong> more tests.
        </span>;
    if (runsFor80Percent > 0) {
        tooltipText = <span>
                For 80%: <strong>{runsFor80Percent}</strong> more tests.
            <br/>
            {tooltipText}
            </span>;
    }

    return <Tooltip title={tooltipText} style={{ marginLeft: '4px', cursor: 'default' }} placement="left" arrow>
        <InfoOutlineIcon sx={{ fontSize: 15 }}/>
    </Tooltip>;
};