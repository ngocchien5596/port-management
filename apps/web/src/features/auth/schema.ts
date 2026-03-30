import { z } from 'zod';

export const loginSchema = z.object({
    employeeCode: z
        .string()
        .min(1, 'Mã nhân viên không được để trống')
        .max(20, 'Mã nhân viên quá dài'),
    password: z
        .string()
        .min(1, 'Mật khẩu không được để trống')
        .min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

export const changePasswordSchema = z.object({
    currentPassword: z
        .string()
        .min(1, 'Mật khẩu hiện tại không được để trống'),
    newPassword: z
        .string()
        .min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự'),
    confirmPassword: z
        .string()
        .min(1, 'Xác nhận mật khẩu không được để trống'),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
