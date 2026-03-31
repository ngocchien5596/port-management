'use client';

import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/button';
import { X, Download, Share2, Copy, Check, ExternalLink, QrCode } from 'lucide-react';
import { Voyage } from '@/features/qltau/types';
import toast from 'react-hot-toast';

interface QRCodeModalProps {
    isOpen: boolean;
    onClose: () => void;
    voyage: Voyage;
}

export default function QRCodeModal({ isOpen, onClose, voyage }: QRCodeModalProps) {
    const [qrDataUrl, setQrDataUrl] = useState<string>('');
    const [isCopied, setIsCopied] = useState(false);

    const trackingUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/track/${voyage.id}`
        : '';

    useEffect(() => {
        if (isOpen && trackingUrl) {
            QRCode.toDataURL(trackingUrl, {
                width: 400,
                margin: 2,
                color: {
                    dark: '#0f172a', // slate-900
                    light: '#ffffff'
                }
            })
                .then(url => setQrDataUrl(url))
                .catch(err => console.error('QR generation error:', err));
        }
    }, [isOpen, trackingUrl]);

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = qrDataUrl;
        link.download = `QR_Tracking_${voyage.voyageCode}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(trackingUrl);
        setIsCopied(true);
        toast.success('Đã sao chép liên kết tra cứu');
        setTimeout(() => setIsCopied(false), 2000);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-brand/10 rounded-xl text-brand">
                            <QrCode size={20} strokeWidth={2.5} />
                        </div>
                        <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Chia sẻ tra cứu</h3>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 text-slate-400 transition-colors">
                        <X size={20} strokeWidth={2.5} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-8 flex flex-col items-center">
                    <div className="relative group p-4 bg-white border-2 border-slate-100 rounded-3xl shadow-sm mb-6">
                        {qrDataUrl ? (
                            <img src={qrDataUrl} alt="QR Code" className="w-48 h-48 rounded-lg" />
                        ) : (
                            <div className="w-48 h-48 flex items-center justify-center">
                                <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-brand/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    </div>

                    <div className="text-center mb-8">
                        <h4 className="font-black text-slate-800 uppercase tracking-widest text-xs mb-1">Mã chuyến: {voyage.voyageCode}</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 leading-relaxed">Quét mã QR để xem trạng thái tàu trực tuyến</p>
                    </div>

                    <div className="w-full space-y-3">
                        <Button
                            onClick={handleDownload}
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black rounded-xl h-12 flex items-center justify-center gap-2 uppercase tracking-widest text-[11px] shadow-lg shadow-slate-200"
                        >
                            <Download size={16} strokeWidth={3} /> Tải ảnh mã QR
                        </Button>

                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={handleCopyLink}
                                className="flex-1 border-slate-200 hover:bg-slate-50 text-slate-600 font-black rounded-xl h-12 flex items-center justify-center gap-2 uppercase tracking-widest text-[11px]"
                            >
                                {isCopied ? <Check size={16} strokeWidth={3} className="text-emerald-500" /> : <Copy size={16} strokeWidth={3} />}
                                {isCopied ? 'Đã chép' : 'Chép link'}
                            </Button>

                            <Button
                                variant="outline"
                                onClick={() => window.open(trackingUrl, '_blank')}
                                className="flex-1 border-slate-200 hover:bg-slate-50 text-slate-600 font-black rounded-xl h-12 flex items-center justify-center gap-2 uppercase tracking-widest text-[11px]"
                            >
                                <ExternalLink size={16} strokeWidth={3} /> Xem thử
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Footer hint */}
                <div className="px-6 py-4 bg-amber-50 border-t border-amber-100/50">
                    <p className="text-[9px] text-amber-700 font-bold uppercase tracking-widest text-center leading-relaxed">
                        Chỉ khách hàng có số điện thoại đăng ký "{voyage.vessel?.customerPhone || 'N/A'}" mới có thể xem thông tin này.
                    </p>
                </div>
            </div>
        </div>
    );
}
