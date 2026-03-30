import * as React from 'react';
import { Button, ButtonProps } from './button';
import { cn } from '@/lib/utils/cn';

const PlusIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14" /><path d="M12 5v14" />
    </svg>
);

interface CreateButtonProps extends ButtonProps {
    label?: string;
}

export const CreateButton = React.forwardRef<HTMLButtonElement, CreateButtonProps>(
    ({ className, children, label = "Thêm mới", ...props }, ref) => {
        return (
            <Button
                ref={ref}
                className={cn("gap-2 pl-3 pr-5 shadow-lg shadow-brand/10 hover:shadow-brand/20", className)}
                {...props}
            >
                <PlusIcon />
                {children || label}
            </Button>
        );
    }
);
CreateButton.displayName = "CreateButton";
