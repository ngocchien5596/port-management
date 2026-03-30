'use client';

import React from 'react';
import ReactDatePicker, { registerLocale } from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { vi } from 'date-fns/locale';
import { DATE_FORMAT, DATE_TIME_FORMAT } from '@/lib/utils/date';
import { cn } from '@/lib/utils/cn';
import { Calendar } from 'lucide-react';

registerLocale('vi', vi);

interface DatePickerProps {
    selected?: Date | null;
    onChange: (date: Date | null) => void;
    placeholderText?: string;
    showTimeSelect?: boolean;
    className?: string;
    label?: string;
    error?: string;
    minDate?: Date;
    maxDate?: Date;
    disabled?: boolean;
    required?: boolean;
}

export function DatePicker({
    selected,
    onChange,
    placeholderText = 'Chọn ngày',
    showTimeSelect = false,
    className,
    label,
    error,
    minDate,
    maxDate,
    disabled = false,
    required = false
}: DatePickerProps) {
    return (
        <div className="flex flex-col gap-1.5 w-full">
            {label && (
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            <div className="relative group">
                <ReactDatePicker
                    selected={selected}
                    onChange={onChange}
                    showTimeSelect={showTimeSelect}
                    timeFormat="HH:mm"
                    timeIntervals={15}
                    dateFormat={showTimeSelect ? DATE_TIME_FORMAT : DATE_FORMAT}
                    locale="vi"
                    placeholderText={placeholderText}
                    minDate={minDate}
                    maxDate={maxDate}
                    disabled={disabled}
                    autoComplete="off"
                    portalId="datepicker-portal"
                    className={cn(
                        "flex h-10 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition-all",
                        "placeholder:text-slate-400 placeholder:font-medium",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/20 focus-visible:border-brand",
                        "group-hover:border-slate-300",
                        disabled && "opacity-50 cursor-not-allowed bg-slate-50",
                        error && "border-red-500 focus-visible:ring-red-100 focus-visible:border-red-500",
                        className
                    )}
                    wrapperClassName="w-full"
                />
                <Calendar className={cn(
                    "absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none transition-colors",
                    "group-hover:text-slate-500",
                    error && "text-red-400"
                )} />
            </div>
            {error && <span className="text-[10px] font-bold text-red-500 pl-1">{error}</span>}
        </div>
    );
}
