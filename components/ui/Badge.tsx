import React from 'react';
import { cva, cn, VariantProps } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        primary: 'bg-blue-100 text-blue-800',
        secondary: 'bg-gray-200 text-gray-800',
        success: 'bg-green-100 text-green-800',
        warning: 'bg-orange-100 text-orange-800',
        destructive: 'bg-red-100 text-red-800',
        yellow: 'bg-yellow-100 text-yellow-800',
      },
    },
    defaultVariants: {
      variant: 'primary',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, className }))} {...props} />
  );
}

export { Badge, badgeVariants };
