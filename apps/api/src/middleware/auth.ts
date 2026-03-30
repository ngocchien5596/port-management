import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';

export interface AuthRequest extends Request {
    user?: {
        id: string;
        employeeId: string;
        employeeCode: string;
        role: string;
    };
}

export async function authenticate(
    req: AuthRequest,
    res: Response,
    next: NextFunction
) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: { message: 'Unauthorized - No token provided', code: 'NO_TOKEN' },
            });
        }

        const token = authHeader.split(' ')[1];
        const secret = process.env.JWT_SECRET || 'default-secret';

        const decoded = jwt.verify(token, secret) as {
            accountId: string;
            employeeId: string;
            employeeCode: string;
            role: string;
        };

        // Verify account still exists and is active
        const account = await prisma.account.findUnique({
            where: { id: decoded.accountId },
            include: { employee: true },
        });

        if (!account || !account.isActive) {
            return res.status(401).json({
                success: false,
                error: { message: 'Unauthorized - Account inactive', code: 'INACTIVE_ACCOUNT' },
            });
        }

        req.user = {
            id: account.id,
            employeeId: account.employeeId || '', // Fallback to empty string
            employeeCode: account.employee?.employeeCode || '',
            role: account.role,
        };

        next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({
                success: false,
                error: { message: 'Token expired', code: 'TOKEN_EXPIRED' },
            });
        }

        return res.status(401).json({
            success: false,
            error: { message: 'Invalid token', code: 'INVALID_TOKEN' },
        });
    }
}

export function authorize(...roles: string[]) {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: { message: 'Unauthorized', code: 'UNAUTHORIZED' },
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: { message: 'Forbidden - Insufficient permissions', code: 'FORBIDDEN' },
            });
        }

        next();
    };
}
