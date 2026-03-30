'use client';

import * as React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { cn } from '@/lib/utils/cn';
import { Button } from './button';

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'info';
    isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = 'Xác nhận',
    cancelText = 'Hủy bỏ',
    type = 'danger',
    isLoading = false,
}) => {
    return (
        <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <Dialog.Portal>
                {/* Overlay with glassmorphism */}
                <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />

                <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-[400px] translate-x-[-50%] translate-y-[-50%] gap-4 border border-slate-200 bg-white p-0 shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-2xl overflow-hidden">

                    {/* Header with Icon/Style based on type */}
                    <div className={cn(
                        "px-6 pt-8 pb-4 flex flex-col items-center text-center",
                        type === 'danger' ? "bg-red-50/30" : "bg-brand-soft/30"
                    )}>
                        <div className={cn(
                            "w-14 h-14 rounded-full flex items-center justify-center mb-4 transition-transform duration-500 hover:scale-110",
                            type === 'danger' ? "bg-red-100 text-red-600" : "bg-brand-soft text-brand"
                        )}>
                            {type === 'danger' ? (
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2m-6 5v6m4-6v6" />
                                </svg>
                            ) : (
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="12" y1="16" x2="12" y2="12" />
                                    <line x1="12" y1="8" x2="12.01" y2="8" />
                                </svg>
                            )}
                        </div>

                        <Dialog.Title className="text-xl font-bold text-slate-900 leading-tight">
                            {title}
                        </Dialog.Title>

                        <Dialog.Description className="mt-3 text-[15px] text-slate-500 leading-relaxed px-4">
                            {description}
                        </Dialog.Description>
                    </div>

                    {/* Footer Actions */}
                    <div className="px-6 py-6 flex flex-col sm:flex-row gap-3">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            className="flex-1 h-12 rounded-xl text-[15px] font-bold border-slate-200 hover:bg-slate-50 text-slate-600 transition-all active:scale-[0.98]"
                            disabled={isLoading}
                        >
                            {cancelText}
                        </Button>
                        <Button
                            variant={type === 'danger' ? 'destructive' : 'default'}
                            onClick={onConfirm}
                            isLoading={isLoading}
                            className={cn(
                                "flex-1 h-12 rounded-xl text-[15px] font-bold transition-all shadow-md active:scale-[0.98]",
                                type === 'danger'
                                    ? "bg-red-600 hover:bg-red-700 shadow-red-200"
                                    : "bg-brand hover:bg-brand-hover shadow-brand/20"
                            )}
                        >
                            {isLoading ? 'Đang xử lý...' : confirmText}
                        </Button>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};
