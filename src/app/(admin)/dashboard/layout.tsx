"use client"

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Header } from "@/components/header";
import {
    LayoutDashboard,
    BookOpen,
    Users,
    Settings,
    BarChart3,
    Package2,
} from "lucide-react";
import { getDashboardAccess, getRoleDisplayName } from "@/lib/permissions";
import { UserRole } from "@/lib/types";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const { data: session } = useSession();
    const pathname = usePathname();

    const userRole = (session?.user?.role as UserRole) || "user";
    const dashboardAccess = getDashboardAccess(userRole);

    const navigation = [
        {
            title: "Overview",
            url: "/dashboard",
            icon: LayoutDashboard,
            canAccess: dashboardAccess.canViewOverview,
        },
        {
            title: "Words",
            url: "/dashboard/words",
            icon: BookOpen,
            canAccess: dashboardAccess.canViewWords,
        },
        {
            title: "Analytics",
            url: "/dashboard/analytics",
            icon: BarChart3,
            canAccess: dashboardAccess.canViewAnalytics,
        },
        {
            title: "Users",
            url: "/dashboard/users",
            icon: Users,
            canAccess: dashboardAccess.canViewUsers,
        },
        {
            title: "Settings",
            url: "/dashboard/settings",
            icon: Settings,
            canAccess: dashboardAccess.canViewSettings,
        },
    ];

    const filteredNavigation = navigation
        .filter((item) => item.canAccess)
        .map((item) => ({ ...item, isActive: pathname === item.url }));

    return (
        <>
            <SidebarProvider>
                <Sidebar collapsible="icon" className="border-r bg-muted/40 min-h-screen flex flex-col">
                    <SidebarHeader className="border-b px-4 py-3">
                        <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
                            <Package2 className="h-6 w-6" />
                            <span>Shabda</span>
                        </Link>
                    </SidebarHeader>
                    <SidebarContent className="flex-1 px-2 py-4">
                        <SidebarMenu>
                            {filteredNavigation.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild isActive={item.isActive}>
                                        <Link href={item.url} className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors hover:bg-muted/60">
                                            {item.icon && <item.icon className="h-4 w-4" />}
                                            <span className="truncate">{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarContent>
                    <SidebarFooter className="border-t px-4 py-3 flex flex-col gap-2">
                        {/* <div className="text-xs text-muted-foreground">
                            {session?.user?.name && (
                                <>
                                    <span className="font-medium">{session.user.name}</span>
                                    <span className="ml-1">({getRoleDisplayName(userRole)})</span>
                                </>
                            )}
                        </div> */}
                        <SidebarTrigger className="mt-2" />
                    </SidebarFooter>
                </Sidebar>
                <SidebarInset>
                    <Header />
                    <main className="flex-1 p-4 sm:p-6">{children}</main>
                </SidebarInset>
            </SidebarProvider>
        </>
    );
}
