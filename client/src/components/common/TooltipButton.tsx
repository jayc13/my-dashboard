import { Button, Tooltip } from '@mui/material';
import type { ButtonProps, TooltipProps } from '@mui/material';
import type { ReactNode } from 'react';

export interface TooltipButtonProps extends Omit<ButtonProps, 'onClick'> {
    /**
     * Optional tooltip title. If not provided, no tooltip will be shown.
     */
    tooltip?: string;
    /**
     * Optional click handler
     */
    onClick?: () => void;
    /**
     * Optional tooltip props for customization
     */
    tooltipProps?: Partial<Omit<TooltipProps, 'title' | 'children'>>;
    /**
     * The content to display in the button
     */
    children: ReactNode;
}

const TooltipButton = ({
    tooltip,
    onClick,
    tooltipProps,
    children,
    ...buttonProps
}: TooltipButtonProps) => {
    const button = (
        <Button onClick={onClick} {...buttonProps}>
            {children}
        </Button>
    );

    if (!tooltip) {
        return button;
    }

    return (
        <Tooltip title={tooltip} {...tooltipProps}>
            <span>
                {button}
            </span>
        </Tooltip>
    );
};

export default TooltipButton;

