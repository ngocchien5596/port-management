import { format, parseISO, isToday, isBefore, isAfter, startOfDay, addDays } from 'date-fns';
import { vi } from 'date-fns/locale';

export const DATE_FORMAT = 'dd/MM/yyyy';
export const TIME_FORMAT = 'HH:mm';
export const DATE_TIME_FORMAT = 'HH:mm dd/MM/yyyy';
export const APP_TIMEZONE = 'Asia/Ho_Chi_Minh';
export const VIETNAM_OFFSET_MINUTES = 420; // GMT+7

/**
 * Safely parses a date string or object into a Date object.
 * Reliable across browsers for standard ISO formats.
 */
export const safeDate = (date: Date | string | null | undefined): Date => {
    if (!date) return new Date();
    if (date instanceof Date) return isNaN(date.getTime()) ? new Date() : date;

    if (typeof date === 'string' && date.trim()) {
        // 1. Normalize formatting (replace spaces between date and time with T)
        let normalized = date.trim().replace(/(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})/, '$1T$2');

        // 2. Handle date-only strings (parse as local midnight)
        if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
            const [y, m, d] = normalized.split('-').map(Number);
            return new Date(y, m - 1, d);
        }

        // 3. Assume local Vietnam time for input strings lacking timezone
        // This regex checks for YYYY-MM-DDTHH:mm and confirms NO timezone suffix (Z, +, -)
        const hasTimezone = /(Z|[+-]\d{2})/.test(normalized.split('T')[1] || '');
        const isIsoLike = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(normalized);

        if (isIsoLike && !hasTimezone) {
            normalized += '+07:00';
        }

        const d = new Date(normalized);
        if (!isNaN(d.getTime())) return d;
    }

    const d = new Date(date as any);
    return isNaN(d.getTime()) ? new Date() : d;
};

/**
 * Formats a date for <input type="datetime-local"> in the Vietnam timezone
 */
export const toLocalISOString = (date: Date | string | null | undefined): string => {
    if (!date) return '';
    const d = safeDate(date);

    try {
        const parts = new Intl.DateTimeFormat('en-US', {
            timeZone: APP_TIMEZONE,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hourCycle: 'h23'
        }).formatToParts(d);

        const year = parts.find(p => p.type === 'year')?.value;
        const month = parts.find(p => p.type === 'month')?.value;
        const day = parts.find(p => p.type === 'day')?.value;
        const hours = parts.find(p => p.type === 'hour')?.value;
        const minutes = parts.find(p => p.type === 'minute')?.value;

        return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch (e) {
        console.error('Error in toLocalISOString, falling back to manual shift:', e);
        const vn = getVietnamTime(d);
        const year = vn.getUTCFullYear();
        const month = String(vn.getUTCMonth() + 1).padStart(2, '0');
        const day = String(vn.getUTCDate()).padStart(2, '0');
        const hours = String(vn.getUTCHours()).padStart(2, '0');
        const minutes = String(vn.getUTCMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    }
};

let serverOffset = 0; // in milliseconds

export const setServerTimeOffset = (serverTimeStr: string) => {
    const serverDate = new Date(serverTimeStr);
    const clientDate = new Date();
    serverOffset = serverDate.getTime() - clientDate.getTime();
};

export const getServerDate = () => {
    return new Date(Date.now() + serverOffset);
};

/**
 * Manual shift function to guarantee +7 offset regardless of browser Intl support.
 * Returns a new Date object that represents the same wall-clock time in UTC as Vietnam has in local.
 */
const getVietnamTime = (date: Date): Date => {
    // Get UTC milliseconds
    const utcMs = date.getTime();
    // Add 7 hours in milliseconds
    return new Date(utcMs + (VIETNAM_OFFSET_MINUTES * 60000));
};

/**
 * Diagnostic logger for debugging in the browser console.
 */
if (typeof window !== 'undefined') {
    (window as any).__DEBUG_TIME__ = (dateStr?: string) => {
        const d = safeDate(dateStr);
        console.log('--- TIME DIAGNOSTICS ---');
        console.log('Original Input:', dateStr);
        console.log('SafeDate Output (UTC):', d.toISOString());
        console.log('Browser Local Time:', d.toString());
        console.log('Manual VN Shift (+7h):', getVietnamTime(d).toISOString());
        try {
            const intl = new Intl.DateTimeFormat('vi-VN', {
                timeZone: APP_TIMEZONE,
                hour: '2-digit',
                minute: '2-digit',
                hourCycle: 'h23'
            }).format(d);
            console.log('Intl Asia/Ho_Chi_Minh:', intl);
        } catch (e) {
            console.log('Intl Error:', e);
        }
        console.log('------------------------');
    };
}

export const formatDate = (date: Date | string | null | undefined, formatStr: string = DATE_FORMAT) => {
    if (!date) return '-';
    const d = safeDate(date);
    return format(d, formatStr, { locale: vi });
};

export const formatTime = (date: Date | string | null | undefined) => {
    if (!date) return '-';
    let d = safeDate(date);
    return format(d, TIME_FORMAT, { locale: vi });
};

export const formatDateTime = (date: Date | string | null | undefined) => {
    if (!date) return '-';
    let d = safeDate(date);
    return format(d, DATE_TIME_FORMAT, { locale: vi });
};

export const isDateAvailable = (date: Date, cutoffHour: number = 16): boolean => {
    const now = getServerDate();
    const today = startOfDay(now);
    const checkDate = startOfDay(date);

    if (isBefore(checkDate, today)) return false;
    if (checkDate.getTime() === today.getTime() && now.getHours() >= cutoffHour) return false;
    return true;
};

export const getMonthName = (month: number): string => {
    const months = [
        'Tháng 01', 'Tháng 02', 'Tháng 03', 'Tháng 04',
        'Tháng 05', 'Tháng 06', 'Tháng 07', 'Tháng 08',
        'Tháng 09', 'Tháng 10', 'Tháng 11', 'Tháng 12'
    ];
    return months[month];
};

export { isToday, isBefore, isAfter, startOfDay, addDays };
