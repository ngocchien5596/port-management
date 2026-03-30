import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';

const badgeVariants = cva(
    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
    {
        variants: {
            variant: {
                default: 'bg-brand-soft text-brand',
                secondary: 'bg-surface-2 text-vttext-secondary',
                success: 'bg-state-greenSoft text-state-success',
                warning: 'bg-state-amberSoft text-state-warning',
                destructive: 'bg-state-redSoft text-state-danger',
                outline: 'border border-vtborder text-vttext-secondary bg-white',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
);

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
    return (
        <div className={cn(badgeVariants({ variant }), className)} {...props} />
    );
}

export { Badge, badgeVariants };
