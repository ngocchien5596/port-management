'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import { Clock } from 'lucide-react';

export default function ShiftConfigPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [shift1, setShift1] = useState('06:00');
    const [shift2, setShift2] = useState('14:00');
    const [shift3, setShift3] = useState('22:00');

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const res: any = await api.get('/config/shifts');
                const configs = res.data?.data || res.data || [];

                const s1 = configs.find((c: any) => c.key === 'SHIFT_1_START')?.value;
                const s2 = configs.find((c: any) => c.key === 'SHIFT_2_START')?.value;
                const s3 = configs.find((c: any) => c.key === 'SHIFT_3_START')?.value;

                if (s1) setShift1(s1);
                if (s2) setShift2(s2);
                if (s3) setShift3(s3);
            } catch (error: any) {
                toast.error('Lỗi khi tải cấu hình ca làm việc: ' + error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchConfig();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.put('/config/shifts', { shift1, shift2, shift3 });
            toast.success('Cập nhật cấu hình ca làm việc thành công!');
        } catch (error: any) {
            toast.error('Lỗi khi lưu cấu hình: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="p-6">Đang tải...</div>;
    }

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Cấu hình Ca làm việc</h1>
                <p className="text-slate-500 mt-1">Định nghĩa mốc thời gian bắt đầu cho các ca trong ngày phục vụ hệ thống báo cáo sản lượng.</p>
            </div>

            <Card className="p-6">
                <div className="space-y-6">
                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-800">
                        <strong>Lưu ý:</strong> Hệ thống tự động hiểu một ca sẽ kéo dài đến khi ca tiếp theo bắt đầu. Ví dụ: Nếu Ca 1 bắt đầu lúc 06:00 và Ca 2 bắt đầu lúc 14:00, thì Ca 1 sẽ kéo dài từ 06:00 đến 13:59.
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Ca 1 */}
                        <div className="space-y-3 p-4 border border-slate-100 rounded-xl bg-slate-50/50">
                            <h3 className="font-semibold flex items-center gap-2 text-slate-700">
                                <Clock className="w-4 h-4 text-vt-primary" />
                                Ca 1 (Sáng)
                            </h3>
                            <div>
                                <label className="text-xs text-slate-500 mb-1 block">Giờ bắt đầu</label>
                                <Input
                                    type="time"
                                    value={shift1}
                                    onChange={(e) => setShift1(e.target.value)}
                                    className="bg-white"
                                />
                            </div>
                        </div>

                        {/* Ca 2 */}
                        <div className="space-y-3 p-4 border border-slate-100 rounded-xl bg-slate-50/50">
                            <h3 className="font-semibold flex items-center gap-2 text-slate-700">
                                <Clock className="w-4 h-4 text-orange-500" />
                                Ca 2 (Chiều)
                            </h3>
                            <div>
                                <label className="text-xs text-slate-500 mb-1 block">Giờ bắt đầu</label>
                                <Input
                                    type="time"
                                    value={shift2}
                                    onChange={(e) => setShift2(e.target.value)}
                                    className="bg-white"
                                />
                            </div>
                        </div>

                        {/* Ca 3 */}
                        <div className="space-y-3 p-4 border border-slate-100 rounded-xl bg-slate-50/50">
                            <h3 className="font-semibold flex items-center gap-2 text-slate-700">
                                <Clock className="w-4 h-4 text-indigo-500" />
                                Ca 3 (Đêm)
                            </h3>
                            <div>
                                <label className="text-xs text-slate-500 mb-1 block">Giờ bắt đầu</label>
                                <Input
                                    type="time"
                                    value={shift3}
                                    onChange={(e) => setShift3(e.target.value)}
                                    className="bg-white"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-slate-100">
                        <Button
                            onClick={handleSave}
                            disabled={saving}
                        >
                            {saving ? 'Đang lưu...' : 'Lưu Cấu Hình'}
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}
