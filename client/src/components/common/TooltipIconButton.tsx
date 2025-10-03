import { IconButton, Tooltip } from '@mui/material';
import type { IconButtonProps, TooltipProps } from '@mui/material';
import type { ReactElement } from 'react';

export interface TooltipIconButtonProps extends Omit<IconButtonProps, 'onClick'> {
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
     * The icon to display in the button
     */
    children: ReactElement;
    /**
     * Optional href for link buttons
     */
    href?: string;
    /**
     * Optional target for link buttons
     */
    target?: string;
    /**
     * Optional rel for link buttons
     */
    rel?: string;
}

const TooltipIconButton = ({
    tooltip,
    onClick,
    tooltipProps,
    children,
    href,
    target,
    rel,
    ...iconButtonProps
}: TooltipIconButtonProps) => {
    const button = (
        <IconButton
            onClick={onClick}
            href={href}
            target={target}
            rel={rel}
            component={href ? 'a' : 'button'}
            {...iconButtonProps}
        >
            {children}
        </IconButton>
    );

    if (!tooltip) {
        return button;
    }

    return (
        <Tooltip title={tooltip} {...tooltipProps}>
            {button}
        </Tooltip>
    );
};

export default TooltipIconButton;

