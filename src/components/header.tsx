"use client"

import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { Book, Bookmark, User, LogOut, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {ModeToggle} from "@/components/dark-mode-toggle";

export function Header() {
    const { user, logout, isAuthenticated } = useAuth()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    return (
        <header className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4">
                <div className="flex h-16 items-center justify-between">
                    <Link href="/" className="flex items-center space-x-2">

                        <span className="font-bold text-xl">शब्द</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-4">
                        <Link href="/">
                            <Button variant="ghost">Dictionary</Button>
                        </Link>
                        <Link href="/bookmarks">
                            <Button variant="ghost">
                                <Bookmark className="h-4 w-4 mr-2" />
                                Bookmarks
                            </Button>
                        </Link>

                        <ModeToggle />

                        {isAuthenticated ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="flex items-center space-x-2">
                                        <User className="h-4 w-4" />
                                        <span>{user?.name}</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem asChild>
                                        <Link href="/add-word">Add Word</Link>
                                    </DropdownMenuItem>
                                    {user?.role === "admin" && (
                                        <DropdownMenuItem asChild>
                                            <Link href="/admin">Admin</Link>
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => logout()}>
                                        <LogOut className="h-4 w-4 mr-2" />
                                        Sign Out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <div className="flex items-center space-x-2">
                                <Link href="/signin">
                                    <Button variant="ghost">Sign In</Button>
                                </Link>
                                <Link href="/signup">
                                    <Button>Sign Up</Button>
                                </Link>
                            </div>
                        )}
                    </nav>

                    {/* Mobile Menu Button */}
                    <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                        {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </Button>
                </div>

                {/* Mobile Navigation */}
                {mobileMenuOpen && (
                    <div className="md:hidden py-4 space-y-2">
                        <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                            <Button variant="ghost" className="w-full justify-start">
                                Dictionary
                            </Button>
                        </Link>
                        <Link href="/bookmarks" onClick={() => setMobileMenuOpen(false)}>
                            <Button variant="ghost" className="w-full justify-start">
                                <Bookmark className="h-4 w-4 mr-2" />
                                Bookmarks
                            </Button>
                        </Link>

                        <div className="flex items-center justify-between px-3 py-2">
                            <span className="text-sm">Theme</span>
                            <ModeToggle />
                        </div>

                        {isAuthenticated ? (
                            <>
                                <div className="px-3 py-2 text-sm font-medium">{user?.name}</div>
                                <Link href="/add-word" onClick={() => setMobileMenuOpen(false)}>
                                    <Button variant="ghost" className="w-full justify-start">
                                        Add Word
                                    </Button>
                                </Link>
                                {user?.role === "admin" && (
                                    <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
                                        <Button variant="ghost" className="w-full justify-start">
                                            Admin
                                        </Button>
                                    </Link>
                                )}
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start"
                                    onClick={() => {
                                        logout()
                                        setMobileMenuOpen(false)
                                    }}
                                >
                                    <LogOut className="h-4 w-4 mr-2" />
                                    Sign Out
                                </Button>
                            </>
                        ) : (
                            <div className="space-y-2">
                                <Link href="/auth/signin" onClick={() => setMobileMenuOpen(false)}>
                                    <Button variant="ghost" className="w-full">
                                        Sign In
                                    </Button>
                                </Link>
                                <Link href="/auth/signup" onClick={() => setMobileMenuOpen(false)}>
                                    <Button className="w-full">Sign Up</Button>
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </header>
    )
}
