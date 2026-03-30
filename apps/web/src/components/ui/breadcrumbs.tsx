import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"
import { cn } from "@/lib/utils/cn"

export interface BreadcrumbItem {
    label: string
    href?: string
}

export function Breadcrumbs({ items, className }: { items: BreadcrumbItem[], className?: string }) {
    return (
        <nav className={cn("flex items-center space-x-2 text-sm text-slate-500", className)}>
            <Link href="/" className="hover:text-brand transition-colors">
                <Home size={14} />
            </Link>
            {items.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                    <ChevronRight size={14} className="text-slate-300" />
                    {item.href ? (
                        <Link href={item.href} className="hover:text-brand transition-colors font-medium">
                            {item.label}
                        </Link>
                    ) : (
                        <span className="text-slate-900 font-semibold cursor-default">
                            {item.label}
                        </span>
                    )}
                </div>
            ))}
        </nav>
    )
}
