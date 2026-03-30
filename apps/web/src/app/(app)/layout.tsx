'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout';
import { useAuthStore } from '@/features/auth';
import { configApi } from '@/features/config';
import { setServerTimeOffset } from '@/lib/utils/date';

export default function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const { user, isAuthenticated, checkAuth, _hasHydrated, token } = useAuthStore();
    const [isReady, setIsReady] = useState(false);

    // Wait for hydration
    useEffect(() => {
        if (_hasHydrated) {
            setIsReady(true);
        }
    }, [_hasHydrated]);

    useEffect(() => {
        if (!isReady) return;
        checkAuth();

        // Sync server time
        configApi.getServerTime()
            .then((res: any) => {
                if (res.success && res.data.serverTime) {
                    setServerTimeOffset(res.data.serverTime);
                }
            })
            .catch((err: Error) => console.error('Failed to sync server time:', err));
    }, [isReady, checkAuth]);

    useEffect(() => {
        // Only redirect AFTER hydration is complete
        if (isReady && !token) {
            router.push('/login');
        }
    }, [isReady, token, router]);

    // Show nothing or a loader while hydrating
    if (!isReady) {
        return null;
    }

    return (
        <AppShell
            user={user ? { fullName: user.fullName, employeeCode: user.employeeCode } : undefined}
            userRole={user?.role}
        >
            {children}
        </AppShell>
    );
}
