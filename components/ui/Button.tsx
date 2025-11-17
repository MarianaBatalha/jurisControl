import React from 'react';
import { cva, cn, VariantProps } from '../../lib/utils';
import { ICONS } from '../../constants';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        primary: 'bg-brand-blue-600 text-white shadow-sm hover:bg-brand-blue-700 disabled:bg-brand-blue-400',
        success: 'bg-green-600 text-white shadow-sm hover:bg-green-700 disabled:bg-green-400',
        destructive: 'bg-red-600 text-white shadow-sm hover:bg-red-700 disabled:bg-red-400',
        outline: 'border border-brand-gray-200 bg-white text-brand-gray-700 hover:bg-brand-gray-50',
        'primary-ghost': 'text-brand-gray-500 hover:text-brand-blue-600 hover:bg-brand-blue-50',
        'destructive-ghost': 'text-brand-gray-500 hover:text-red-600 hover:bg-red-50',
      },
      size: {
        default: 'px-4 py-2',
        sm: 'px-3 py-1.5',
        'icon-sm': 'p-2',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, children, isLoading, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading ? <ICONS.Spinner className="w-5 h-5 animate-spin" /> : children}
      </button>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
