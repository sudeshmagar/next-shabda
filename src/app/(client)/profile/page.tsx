"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WordList } from "@/components/word-list";
import { DictionaryEntry, User } from "@/lib/types";
import { BookmarkCheck, Calendar, Clock, Edit, Mail, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { format } from "date-fns";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ProfilePage() {
    const { status } = useSession();
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [bookmarks, setBookmarks] = useState<DictionaryEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("bookmarks");
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState("");
    const [isUpdating, setIsUpdating] = useState(false);

    // Redirect if not authenticated
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/signin");
        }
    }, [status, router]);

    // Fetch user data and bookmarks
    useEffect(() => {
        const fetchUserData = async () => {
            if (status === "authenticated") {
                try {
                    setLoading(true);
                    // Fetch user profile
                    const userRes = await fetch("/api/users/profile");
                    if (!userRes.ok) throw new Error("Failed to fetch user profile");
                    const userData = await userRes.json();
                    setUser(userData);

                    // Fetch bookmarks
                    const bookmarksRes = await fetch("/api/bookmarks");
                    if (!bookmarksRes.ok) throw new Error("Failed to fetch bookmarks");
                    const bookmarksData = await bookmarksRes.json();
                    setBookmarks(bookmarksData.results || []);
                } catch (error) {
                    console.error("Error fetching user data:", error);
                    toast.error("Failed to load profile data");
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchUserData();
    }, [status]);

    const handleEditProfile = async () => {
        if (!editName.trim()) {
            toast.error("Name cannot be empty");
            return;
        }

        try {
            setIsUpdating(true);
            const response = await fetch("/api/users/profile", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name: editName }),
            });

            if (!response.ok) {
                throw new Error("Failed to update profile");
            }

            const updatedUser = await response.json();
            setUser(updatedUser);
            setIsEditing(false);
            toast.success("Profile updated successfully");
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error("Failed to update profile");
        } finally {
            setIsUpdating(false);
        }
    };

    if (status === "loading" || loading) {
        return (
            <div className="container mx-auto py-10">
                <div className="flex flex-col gap-4">
                    {[...Array(3)].map((_, index) => (
                        <div key={index} className="animate-pulse">
                            <div className="bg-muted rounded-lg h-32"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    const bookmarkedWords = bookmarks;

    return (
        <main className="min-h-screen py-10">
            <Toaster position="top-right" />
            
            <div className="container mx-auto space-y-8">
                {/* Profile Header */}
                <Card>
                    <CardHeader>
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div className="flex items-center gap-4">
                                {user.image ? (
                                    <Avatar className="h-20 w-20">
                                        <AvatarImage src={user.image} alt={user.name || "User avatar"} />
                                        <AvatarFallback className="text-lg">
                                            {user.name?.split(" ").map(n => n[0]).join("").toUpperCase() || "U"}
                                        </AvatarFallback>
                                    </Avatar>
                                ) : (
                                    <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                                        <UserIcon className="h-10 w-10 text-primary" />
                                    </div>
                                )}
                                <div>
                                    <CardTitle className="text-2xl">{user.name}</CardTitle>
                                    <div className="flex items-center gap-2 text-muted-foreground mt-1">
                                        <Mail className="h-4 w-4" />
                                        <span>{user.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground mt-1">
                                        <Calendar className="h-4 w-4" />
                                        <span>Joined {user.createdAt ? format(new Date(user.createdAt), "MMMM yyyy") : "Recently"}</span>
                                    </div>
                                </div>
                            </div>
                            <Dialog open={isEditing} onOpenChange={setIsEditing}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" className="gap-2">
                                        <Edit className="h-4 w-4" />
                                        Edit Profile
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Edit Profile</DialogTitle>
                                        <DialogDescription>
                                            Update your profile information. You can change your name here.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="name">Name</Label>
                                            <Input
                                                id="name"
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                placeholder="Enter your name"
                                                defaultValue={user.name}
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button
                                            variant="outline"
                                            onClick={() => setIsEditing(false)}
                                            disabled={isUpdating}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={handleEditProfile}
                                            disabled={isUpdating}
                                        >
                                            {isUpdating ? "Saving..." : "Save Changes"}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex items-center gap-2 p-4 rounded-lg bg-primary/5">
                                <BookmarkCheck className="h-5 w-5 text-primary" />
                                <div>
                                    <div className="text-sm text-muted-foreground">Bookmarks</div>
                                    <div className="text-2xl font-bold">{bookmarks.length}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 p-4 rounded-lg bg-primary/5">
                                <Clock className="h-5 w-5 text-primary" />
                                <div>
                                    <div className="text-sm text-muted-foreground">Last Active</div>
                                    <div className="text-2xl font-bold">
                                        {format(new Date(), "MMM d, yyyy")}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 p-4 rounded-lg bg-primary/5">
                                <UserIcon className="h-5 w-5 text-primary" />
                                <div>
                                    <div className="text-sm text-muted-foreground">Role</div>
                                    <div className="text-2xl font-bold capitalize">
                                        {user.role || "user"}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Tabs Section */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="bookmarks" className="gap-2">
                            <BookmarkCheck className="h-4 w-4" />
                            Bookmarks
                        </TabsTrigger>
                        <TabsTrigger value="activity" className="gap-2">
                            <Clock className="h-4 w-4" />
                            Activity
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="bookmarks" className="space-y-4">
                        {bookmarks.length === 0 ? (
                            <Card>
                                <CardContent className="py-8 text-center">
                                    <BookmarkCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">No Bookmarks Yet</h3>
                                    <p className="text-muted-foreground mb-4">
                                        Start bookmarking your favorite words to see them here
                                    </p>
                                    <Button onClick={() => router.push("/")}>
                                        Browse Dictionary
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : (
                            <WordList entries={bookmarkedWords} loading={loading} />
                        )}
                    </TabsContent>

                    <TabsContent value="activity">
                        <Card>
                            <CardContent className="py-8 text-center">
                                <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold mb-2">Activity Coming Soon</h3>
                                <p className="text-muted-foreground">
                                    We&apos;re working on adding activity tracking to help you keep track of your dictionary usage
                                </p>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </main>
    );
}