'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { accountApi } from '@/features/accounts/api';
import {
    ChevronLeft,
    FileUp,
    Download,
    UploadCloud,
    CheckCircle2,
    AlertCircle,
    FileSpreadsheet,
    ArrowRight,
    RefreshCcw,
    Users,
    Upload,
    Cloud
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export default function ImportAccountContent() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [importResult, setImportResult] = useState<any>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFiles = Array.from(e.dataTransfer.files);
        if (droppedFiles.length > 0) {
            handleFileSelection(droppedFiles[0]);
        }
    };

    const handleFileSelection = (selectedFile: File) => {
        if (!selectedFile.name.match(/\.(xlsx|xls)$/)) {
            toast.error('Vui lòng chọn file Excel (.xlsx, .xls)');
            return;
        }
        setFile(selectedFile);
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFileSelection(e.target.files[0]);
        }
    };

    const handleClickUpload = () => {
        fileInputRef.current?.click();
    };

    const handleImport = async () => {
        if (!file) return;

        setIsImporting(true);
        try {
            const res = await accountApi.importAccounts(file);
            console.log('Import res:', res);

            if (res.success) {
                setImportResult(res.data);
                // Invalidate query to refresh the accounts list
                queryClient.invalidateQueries({ queryKey: ['accounts'] });
                toast.success(res.message || 'Nhập dữ liệu hoàn tất! ✨');
            } else {
                toast.error(res.message || 'Import thất bại');
            }
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'Lỗi khi nhập file');
        } finally {
            setIsImporting(false);
        }
    };

    const handleReset = () => {
        setFile(null);
        setImportResult(null);
    };

    return (
        <div className="w-full min-h-screen bg-[#f8fafc] px-4 pb-12 animate-in fade-in duration-500">
            <div className="max-w-[1280px] mx-auto pt-6">

                {/* 1. Header Section */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <Link
                            href="/accounts"
                            className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-brand hover:border-brand-soft2 transition-all shadow-sm active:scale-95"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </Link>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-brand rounded-2xl flex items-center justify-center shadow-xl shadow-brand/20">
                                <FileSpreadsheet className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black text-slate-900 leading-none">Import tài khoản</h1>
                                <p className="text-sm text-slate-500 mt-1.5 font-medium">Thêm nhiều nhân viên cùng lúc từ file Excel</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Main content area */}
                <div className="max-w-4xl mx-auto">
                    {!importResult ? (
                        <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden p-8">

                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-10 h-10 flex items-center justify-center bg-brand-soft rounded-2xl">
                                    <FileSpreadsheet className="w-5 h-5 text-brand" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black text-slate-800">Tải lên dữ liệu</h2>
                                    <p className="text-sm text-slate-400 font-medium">Chọn file Excel và điền đầy đủ thông tin nhân viên</p>
                                </div>
                            </div>

                            {/* DRAG & DROP ZONE */}
                            <div
                                onDragOver={onDragOver}
                                onDragLeave={onDragLeave}
                                onDrop={onDrop}
                                onClick={handleClickUpload}
                                className={cn(
                                    "relative border-2 border-dashed rounded-[24px] h-72 flex flex-col items-center justify-center cursor-pointer transition-all duration-300",
                                    isDragging
                                        ? "border-brand bg-brand-soft/50 scale-[0.99]"
                                        : "border-slate-200 bg-slate-50/30 hover:border-brand-soft2 hover:bg-white hover:shadow-inner"
                                )}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    accept=".xlsx, .xls"
                                    className="hidden"
                                    onChange={handleFileInputChange}
                                />

                                {file ? (
                                    <div className="text-center p-4 animate-in zoom-in duration-300">
                                        <div className="w-20 h-20 bg-brand rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-brand/20 text-white">
                                            <FileSpreadsheet className="w-8 h-8" />
                                        </div>
                                        <p className="text-lg font-black text-slate-900 truncate max-w-xs">{file.name}</p>
                                        <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">{(file.size / 1024).toFixed(2)} KB</p>
                                        <div className="inline-flex items-center gap-2 mt-4 text-brand font-black text-[11px] uppercase tracking-widest bg-brand-soft px-4 py-2 rounded-full border border-brand-soft2">
                                            Nhấn để đổi file khác
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <div className="w-20 h-20 bg-brand-soft rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-brand/20 text-white">
                                            <Upload className="w-10 h-10" />
                                        </div>
                                        <div className="inline-flex items-center gap-2 mt-4 text-brand font-black text-[11px] uppercase tracking-widest bg-brand-soft px-4 py-2 rounded-full border border-brand-soft2">
                                            <Cloud className="w-3.5 h-3.5" />
                                            Đã sẵn sàng
                                        </div>
                                        <p className="text-[11px] font-black text-slate-400 mt-3 uppercase tracking-[0.2em]">XLSX, XLS (Tối đa 10MB)</p>
                                    </div>
                                )}
                            </div>

                            {/* ACTIONS */}
                            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-6">
                                <button
                                    onClick={async () => {
                                        try {
                                            toast.loading('Đang tạo file mẫu...', { id: 'dl-template' });
                                            await accountApi.downloadTemplate();
                                            toast.success('Đã tải xuống file mẫu!', { id: 'dl-template' });
                                        } catch (e) {
                                            toast.error('Lỗi tải file mẫu', { id: 'dl-template' });
                                        }
                                    }}
                                    className="flex items-center gap-2 text-xs font-black text-slate-500 hover:text-brand transition-colors uppercase tracking-widest group"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center group-hover:bg-brand-soft transition-colors">
                                        <Download className="w-4 h-4" />
                                    </div>
                                    Tải file mẫu (.xlsx)
                                </button>

                                <button
                                    onClick={handleImport}
                                    disabled={!file || isImporting}
                                    className="w-full sm:w-auto h-12 px-10 bg-brand hover:bg-brand-hover text-white font-black rounded-2xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-brand/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed uppercase text-[13px] tracking-wider"
                                >
                                    {isImporting ? (
                                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <CheckCircle2 className="w-5 h-5" />
                                    )}
                                    {isImporting ? 'Đang xử lý...' : 'Xác nhận Nhập dữ liệu'}
                                </button>
                            </div>

                        </div>
                    ) : (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* RESULT SUMMARY CARDS */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-1">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tổng dòng</span>
                                    <span className="text-3xl font-black text-slate-900 leading-none">{importResult?.total || 0}</span>
                                </div>
                                <div className="bg-emerald-50/50 p-5 rounded-3xl border border-emerald-100 shadow-sm flex flex-col gap-1">
                                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Tạo mới</span>
                                    <span className="text-3xl font-black text-emerald-600 leading-none">{importResult?.created || 0}</span>
                                </div>
                                <div className="bg-brand-soft/50 p-5 rounded-3xl border border-brand-soft2 shadow-sm flex flex-col gap-1">
                                    <span className="text-[10px] font-black text-brand uppercase tracking-widest">Cập nhật</span>
                                    <span className="text-3xl font-black text-brand leading-none">{importResult?.updated || 0}</span>
                                </div>
                                <div className="bg-rose-50/50 p-5 rounded-3xl border border-rose-100 shadow-sm flex flex-col gap-1">
                                    <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Thất bại</span>
                                    <span className="text-3xl font-black text-rose-600 leading-none">{importResult?.failed || 0}</span>
                                </div>
                            </div>

                            {/* IMPORTED ITEMS TABLE */}
                            <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                                <div className="px-8 py-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Dữ liệu đã nhập</h3>
                                    <span className="text-[11px] font-black bg-brand text-white px-3 py-1 rounded-full uppercase tracking-wider">
                                        {(importResult?.importedItems || []).length} Nhân viên
                                    </span>
                                </div>
                                <div className="max-h-[400px] overflow-y-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest sticky top-0 backdrop-blur-sm">
                                            <tr>
                                                <th className="px-8 py-4">Mã NV</th>
                                                <th className="px-8 py-4">Họ tên hân viên</th>
                                                <th className="px-8 py-4 text-right">Trạng thái xử lý</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {(importResult?.importedItems || []).map((item: any, idx: number) => (
                                                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                                    <td className="px-8 py-4 text-sm font-black font-mono text-slate-500">{item.code}</td>
                                                    <td className="px-8 py-4 text-sm font-bold text-slate-700">{item.name}</td>
                                                    <td className="px-8 py-4 text-right">
                                                        {item.status === 'CREATED' ? (
                                                            <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100 uppercase tracking-wider">
                                                                <CheckCircle2 className="w-3 h-3" /> Tạo mới
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-brand bg-brand-soft px-2.5 py-1 rounded-lg border border-brand-soft2 uppercase tracking-wider">
                                                                Cập nhật
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                            {(importResult?.importedItems || []).length === 0 && (
                                                <tr>
                                                    <td colSpan={3} className="px-8 py-16 text-center text-slate-400 font-bold italic">
                                                        Không có dữ liệu thành công
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* ERRORS LIST */}
                            {(importResult?.errors || []).length > 0 && (
                                <div className="bg-rose-50/50 rounded-[32px] border border-rose-100 p-8 shadow-sm">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 bg-rose-100 rounded-2xl flex items-center justify-center">
                                            <AlertCircle className="w-5 h-5 text-rose-600" />
                                        </div>
                                        <FileSpreadsheet className="w-5 h-5 text-brand" />
                                        <h2 className="text-sm font-black text-vttext-primary uppercase tracking-wider">Tải lên file dữ liệu nhân viên</h2>
                                        <p className="text-xs text-rose-500 font-medium">Vui lòng kiểm tra lại file Excel theo thông tin dưới đây</p>
                                    </div>
                                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                                        {(importResult?.errors || []).map((err: any, idx: number) => (
                                            <div key={idx} className="bg-white/60 p-4 rounded-2xl border border-rose-100 flex flex-col gap-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-black bg-rose-600 text-white px-2 py-0.5 rounded uppercase tracking-wider">Dòng {err.row}</span>
                                                    {err.code && <span className="text-xs font-black text-slate-700 bg-slate-100 px-2 py-0.5 rounded font-mono tracking-wider">{err.code}</span>}
                                                    {err.name && <span className="text-xs font-black text-slate-500 italic">- {err.name}</span>}
                                                </div>
                                                <p className="text-[13px] font-bold text-rose-600 leading-relaxed">{err.message}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* FOOTER ACTIONS */}
                            <div className="flex items-center justify-end gap-4 pt-4">
                                <button
                                    onClick={handleReset}
                                    className="px-6 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm font-bold rounded-2xl transition-all shadow-sm active:scale-95 flex items-center gap-2"
                                >
                                    <RefreshCcw className="w-4 h-4" />
                                    Tiếp tục Nhập file
                                </button>
                                <button
                                    onClick={() => router.push('/accounts')}
                                    className="px-8 py-3 bg-slate-900 hover:bg-black text-white text-sm font-black rounded-2xl transition-all shadow-lg active:scale-95 flex items-center gap-2"
                                >
                                    <ArrowRight className="w-4 h-4" />
                                    Quay về Danh sách
                                </button>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
