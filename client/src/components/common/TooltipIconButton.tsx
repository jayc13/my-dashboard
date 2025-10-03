import { IconButton, Tooltip } from '@mui/material';
import type { IconButtonProps, TooltipProps } from '@mui/material';
import type { ReactElement } from 'react';

type BaseIconButtonProps = Omit<IconButtonProps, 'onClick'>;

export interface TooltipIconButtonProps extends BaseIconButtonProps {
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
     * Optional href for link buttons (renders as anchor tag)
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
    /**
     * Optional component override
     */
    component?: React.ElementType;
}

const TooltipIconButton = ({
    tooltip,
    onClick,
    tooltipProps,
    children,
    href,
    target,
    rel,
    component,
    ...iconButtonProps
}: TooltipIconButtonProps) => {
    const buttonProps: any = {
        onClick,
        ...iconButtonProps,
    };

    // Add link-specific props when href is provided
    if (href) {
        buttonProps.href = href;
        buttonProps.target = target;
        buttonProps.rel = rel;
        buttonProps.component = component || 'a';
    }

    const button = (
        <IconButton {...buttonProps}>
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

