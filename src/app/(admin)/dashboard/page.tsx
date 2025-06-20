"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { 
    Users, 
    BookOpen, 
    Clock, 
    TrendingUp, 
    Plus, 
    Edit, 
    Trash, 
    Shield,
    Award,
    Activity
} from "lucide-react";
import { DashboardStats, UserContribution, UserRole } from "@/lib/types";
import { getRoleColorClass, getRoleDisplayName, getDashboardAccess } from "@/lib/permissions";

export default function Dashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [topContributors, setTopContributors] = useState<UserContribution[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("overview");

    const userRole = session?.user?.role as UserRole || 'user';
    const dashboardAccess = getDashboardAccess(userRole);

    useEffect(() => {
        if (status === "authenticated" && !dashboardAccess.canViewOverview) {
            router.push("/");
        }
    }, [session, status, router]);

    const fetchDashboardData = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/dashboard/stats");
            if (res.ok) {
                const data = await res.json();
                setStats(data.stats);
                setTopContributors(data.topContributors);
            }
        } catch (error) {
            toast.error("Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchUsers = useCallback(async () => {
        if (!dashboardAccess.canViewUsers) return;
        
        try {
            const res = await fetch("/api/users");
            if (res.ok) {
                const data = await res.json();
                setUsers(data.users);
            }
        } catch (error) {
            toast.error("Failed to load users");
        }
    }, [dashboardAccess.canViewUsers]);

    useEffect(() => {
        if (session?.user) {
            fetchDashboardData();
            if (dashboardAccess.canViewUsers) {
                fetchUsers();
            }
        }
    }, [session?.user, fetchDashboardData, fetchUsers]);

    const updateUserRole = async (userId: string, newRole: UserRole) => {
        try {
            const res = await fetch("/api/users", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, role: newRole }),
            });

            if (res.ok) {
                toast.success("User role updated successfully");
                fetchUsers(); // Refresh users list
            } else {
                const error = await res.json();
                toast.error(error.error || "Failed to update user role");
            }
        } catch (error) {
            toast.error("Failed to update user role");
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto py-10">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-32 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-10">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    <p className="text-muted-foreground">
                        Welcome back, {session?.user?.name} ({getRoleDisplayName(userRole)})
                    </p>
                </div>
                <div className="flex gap-2">
                    {dashboardAccess.canViewWords && (
                        <Link href="/dashboard/words">
                            <Button variant="outline">
                                <BookOpen className="h-4 w-4 mr-2" />
                                Manage Words
                            </Button>
                        </Link>
                    )}
                    <Link href="/dashboard/new">
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Add New Word
                        </Button>
                    </Link>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="contributions">Contributions</TabsTrigger>
                    {dashboardAccess.canViewUsers && (
                        <TabsTrigger value="users">User Management</TabsTrigger>
                    )}
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Words</CardTitle>
                                <BookOpen className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats?.totalWords || 0}</div>
                                <p className="text-xs text-muted-foreground">
                                    Dictionary entries
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-border">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
                                <p className="text-xs text-muted-foreground">
                                    Registered users
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                                <Clock className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats?.pendingApprovals || 0}</div>
                                <p className="text-xs text-muted-foreground">
                                    Awaiting review
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
                                <Activity className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats?.recentContributions || 0}</div>
                                <p className="text-xs text-muted-foreground">
                                    Last 7 days
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Your Contributions */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Award className="h-5 w-5" />
                                Your Contributions
                            </CardTitle>
                            <CardDescription>
                                Track your impact on the dictionary
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">
                                        {stats?.userContributions.wordsCreated || 0}
                                    </div>
                                    <div className="text-sm text-muted-foreground">Words Created</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600">
                                        {stats?.userContributions.wordsEdited || 0}
                                    </div>
                                    <div className="text-sm text-muted-foreground">Words Edited</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-red-600">
                                        {stats?.userContributions.wordsDeleted || 0}
                                    </div>
                                    <div className="text-sm text-muted-foreground">Words Deleted</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="contributions" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5" />
                                Top Contributors
                            </CardTitle>
                            <CardDescription>
                                Most active contributors to the dictionary
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Words Created</TableHead>
                                        <TableHead>Words Edited</TableHead>
                                        <TableHead>Total Impact</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {topContributors.map((contributor) => (
                                        <TableRow key={contributor._id}>
                                            <TableCell className="font-medium">
                                                {contributor.name}
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={getRoleColorClass(contributor.role)}>
                                                    {getRoleDisplayName(contributor.role)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{contributor.contributions.wordsCreated}</TableCell>
                                            <TableCell>{contributor.contributions.wordsEdited}</TableCell>
                                            <TableCell className="font-bold">
                                                {contributor.contributions.wordsCreated + contributor.contributions.wordsEdited}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {dashboardAccess.canViewUsers && (
                    <TabsContent value="users" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="h-5 w-5" />
                                    User Management
                                </CardTitle>
                                <CardDescription>
                                    Manage user roles and permissions
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Current Role</TableHead>
                                            <TableHead>Contributions</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {users.map((user) => (
                                            <TableRow key={user._id}>
                                                <TableCell className="font-medium">
                                                    {user.name}
                                                </TableCell>
                                                <TableCell>{user.email}</TableCell>
                                                <TableCell>
                                                    <Badge className={getRoleColorClass(user.role)}>
                                                        {getRoleDisplayName(user.role)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {user.contributions?.wordsCreated || 0} created, {user.contributions?.wordsEdited || 0} edited
                                                </TableCell>
                                                <TableCell>
                                                    <Select
                                                        value={user.role}
                                                        onValueChange={(newRole) => updateUserRole(user._id, newRole as UserRole)}
                                                    >
                                                        <SelectTrigger className="w-32">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="user">User</SelectItem>
                                                            <SelectItem value="editor">Editor</SelectItem>
                                                            {userRole === 'superadmin' && (
                                                                <>
                                                                    <SelectItem value="admin">Admin</SelectItem>
                                                                    <SelectItem value="superadmin">Super Admin</SelectItem>
                                                                </>
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>
                )}
            </Tabs>
        </div>
    );
}
