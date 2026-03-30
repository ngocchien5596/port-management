'use client';

import { Header } from './Header';
import { LeftMenu } from './LeftMenu';
import { MobileNav } from './MobileNav';

interface AppShellProps {
    children: React.ReactNode;
    user?: {
        fullName: string;
        employeeCode: string;
    };
    userRole?: string;
}

export function AppShell({ children, user, userRole }: AppShellProps) {
    return (
        <div className="min-h-screen bg-white flex flex-col">
            <Header user={user} userRole={userRole} />
            <div className="flex flex-1 relative">
                {/* Desktop Sidebar - Hidden on Mobile */}
                <div className="hidden md:block h-full shrink-0">
                    <LeftMenu userRole={userRole} />
                </div>

                {/* Main Content */}
                <main className="flex-1 p-4 md:p-6 overflow-auto w-full pb-20 md:pb-6">
                    {children}
                </main>
            </div>

            {/* Mobile Navigation */}
            <MobileNav userRole={userRole} />
        </div>
    );
}
