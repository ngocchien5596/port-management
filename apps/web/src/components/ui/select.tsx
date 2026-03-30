import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';

export interface SelectOption {
    value: string;
    label: string;
    disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    options: SelectOption[];
    error?: string;
    helperText?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, label, options, error, helperText, ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        {label}
                    </label>
                )}
                <div className="relative">
                    <select
                        className={cn(
                            "flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white",
                            "file:border-0 file:bg-transparent file:text-sm file:font-medium",
                            "placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/20 focus-visible:border-brand",
                            "disabled:cursor-not-allowed disabled:opacity-50 appearance-none",
                            error ? "border-red-500 focus-visible:ring-red-500/20" : "",
                            className
                        )}
                        ref={ref}
                        {...props}
                    >
                        {options.map((option) => (
                            <option key={option.value} value={option.value} disabled={option.disabled}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                        <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                        </svg>
                    </div>
                </div>
                {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
                {helperText && !error && <p className="mt-1 text-xs text-slate-500">{helperText}</p>}
            </div>
        );
    }
);

Select.displayName = 'Select';

export { Select };
