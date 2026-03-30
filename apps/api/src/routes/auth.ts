import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import prisma from '../lib/prisma.js';

const router: Router = Router();

// Validation schemas
const loginSchema = z.object({
    employeeCode: z.string().min(1, 'Mã nhân viên không được để trống'),
    password: z.string().min(1, 'Mật khẩu không được để trống'),
});

const changePasswordSchema = z.object({
    currentPassword: z.string().min(1),
    newPassword: z
        .string()
        .min(6, 'Mật khẩu tối thiểu 6 ký tự')
        .max(12, 'Mật khẩu tối đa 12 ký tự')
        .regex(/[a-zA-Z]/, 'Mật khẩu phải chứa chữ cái')
        .regex(/[0-9]/, 'Mật khẩu phải chứa số')
        .regex(/[!@#$%^&*]/, 'Mật khẩu phải chứa ký tự đặc biệt'),
});

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
    try {
        const validation = loginSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                error: { message: validation.error.errors[0].message, code: 'VALIDATION_ERROR' },
            });
        }

        const { employeeCode, password } = validation.data;

        // Find employee by code
        const employee = await prisma.employee.findUnique({
            where: { employeeCode },
            include: {
                account: true,
            },
        });

        if (!employee || !employee.account) {
            return res.status(401).json({
                success: false,
                error: { message: 'Sai thông tin đăng nhập', code: 'INVALID_CREDENTIALS' },
            });
        }

        if (!employee.account.isActive) {
            return res.status(401).json({
                success: false,
                error: { message: 'Tài khoản đã bị khóa', code: 'ACCOUNT_DISABLED' },
            });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, employee.account.passwordHash);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                error: { message: 'Sai thông tin đăng nhập', code: 'INVALID_CREDENTIALS' },
            });
        }

        // Update last login
        await prisma.account.update({
            where: { id: employee.account.id },
            data: { lastLogin: new Date() },
        });

        // Generate JWT
        const token = jwt.sign(
            {
                accountId: employee.account.id,
                employeeId: employee.id,
                employeeCode: employee.employeeCode,
                role: employee.account.role,
            },
            process.env.JWT_SECRET || 'default-secret',
            { expiresIn: (process.env.JWT_EXPIRES_IN || '3h') as any }
        );

        res.json({
            success: true,
            data: {
                token,
                user: {
                    id: employee.id,
                    employeeCode: employee.employeeCode,
                    fullName: employee.fullName,
                    email: employee.email,
                    role: employee.account.role,
                    secretCode: employee.account.secretCode,
                },
            },
        });
    } catch (error) {
        next(error);
    }
});

// POST /api/auth/change-password
router.post('/change-password', authenticate, async (req: AuthRequest, res, next) => {
    try {
        const validation = changePasswordSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                error: { message: validation.error.errors[0].message, code: 'VALIDATION_ERROR' },
            });
        }

        const { currentPassword, newPassword } = validation.data;

        // Get current account
        const account = await prisma.account.findUnique({
            where: { id: req.user!.id },
        });

        if (!account) {
            return res.status(404).json({
                success: false,
                error: { message: 'Tài khoản không tồn tại', code: 'NOT_FOUND' },
            });
        }

        // Verify current password
        const isValidPassword = await bcrypt.compare(currentPassword, account.passwordHash);
        if (!isValidPassword) {
            return res.status(400).json({
                success: false,
                error: { message: 'Mật khẩu hiện tại không đúng', code: 'INVALID_PASSWORD' },
            });
        }

        // Update password
        const newPasswordHash = await bcrypt.hash(newPassword, 10);
        await prisma.account.update({
            where: { id: account.id },
            data: {
                passwordHash: newPasswordHash,
                passwordChangedAt: new Date(),
            },
        });

        res.json({
            success: true,
            message: 'Đổi mật khẩu thành công',
        });
    } catch (error) {
        next(error);
    }
});



// POST /api/auth/secret-code
router.post('/secret-code', authenticate, async (req: AuthRequest, res, next) => {
    try {
        const { secretCode } = req.body;
        if (!secretCode) {
            return res.status(400).json({
                success: false,
                error: { message: 'Mã bí mật không được để trống', code: 'VALIDATION_ERROR' },
            });
        }

        const account = await prisma.account.findUnique({
            where: { id: req.user!.id },
        });

        if (!account) {
            return res.status(404).json({ success: false, error: { message: 'Tài khoản không tồn tại' } });
        }

        await prisma.account.update({
            where: { id: account.id },
            data: { secretCode },
        });

        res.json({
            success: true,
            message: 'Cập nhật mã bí mật thành công',
        });
    } catch (error) {
        next(error);
    }
});

// GET /api/auth/me
router.get('/me', authenticate, async (req: AuthRequest, res, next) => {
    try {
        const employee = await prisma.employee.findUnique({
            where: { id: req.user!.employeeId },
            include: {
                account: {
                    select: {
                        role: true,
                        secretCode: true,
                        lastLogin: true,
                    },
                },
            },
        });

        if (!employee) {
            return res.status(404).json({
                success: false,
                error: { message: 'Không tìm thấy thông tin', code: 'NOT_FOUND' },
            });
        }

        res.json({
            success: true,
            data: {
                id: employee.id,
                employeeCode: employee.employeeCode,
                fullName: employee.fullName,
                email: employee.email,
                role: employee.account?.role,
                secretCode: employee.account?.secretCode,
                lastLogin: employee.account?.lastLogin,
            },
        });
    } catch (error) {
        next(error);
    }
});

export default router;
