import React, { useState, useEffect } from 'react';
import { Modal, Input, Button } from '@/components/ui';
import { Loader2 } from 'lucide-react';

interface ProgressInputModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { amount: number; hours: number; notes: string }) => Promise<void>;
    isLoading: boolean;
    defaultProductivity?: number;
}

export default function ProgressInputModal({ isOpen, onClose, onSubmit, isLoading }: ProgressInputModalProps) {
    const [amount, setAmount] = useState<string>('');
    const [hours, setHours] = useState<string>('');
    const [notes, setNotes] = useState('');

    // Derived state
    const currentProd = (Number(amount) > 0 && Number(hours) > 0)
        ? Math.round(Number(amount) / Number(hours))
        : 0;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit({
            amount: Number(amount),
            hours: Number(hours),
            notes
        });
        // Reset
        setAmount('');
        setHours('');
        setNotes('');
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="CẬP NHẬT TIẾN ĐỘ LÀM HÀNG"
            className="sm:max-w-[500px]"
        >
            <form onSubmit={handleSubmit} className="space-y-6">

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="text-center">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                            Công suất ca này
                        </div>
                        <div className={`text-3xl font-black inline-flex items-center px-4 py-1 rounded-lg text-brand bg-brand-soft`}>
                            {currentProd.toLocaleString()}
                            <span className="text-sm font-medium opacity-70 ml-1">tấn/giờ</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Sản lượng (tấn)"
                        type="number"
                        placeholder="VD: 500"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                        autoFocus
                    />
                    <Input
                        label="Thời gian làm (Giờ)"
                        type="number"
                        placeholder="VD: 4"
                        value={hours}
                        onChange={(e) => setHours(e.target.value)}
                        required
                    />
                </div>

                <Input
                    label="Ghi chú / Sự cố (nếu có)"
                    placeholder="VD: Mưa 30p, Cẩu trục trặc..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                />

                <div className="pt-2">
                    <Button
                        type="submit"
                        className="w-full bg-brand hover:bg-brand-hover text-white shadow-lg shadow-brand/20"
                        size="lg"
                        disabled={isLoading || !amount || !hours}
                    >
                        {isLoading ? <Loader2 className="animate-spin mr-2" /> : 'LƯU VÀ TÍNH LẠI ETD'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
