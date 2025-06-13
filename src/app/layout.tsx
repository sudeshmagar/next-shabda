"use client"

import {Poppins, Noto_Sans} from "next/font/google";
import "@/styles/globals.css";
import React from "react";
import {SessionProvider} from "next-auth/react";
import {ThemeProvider} from "@/components/theme-provider";


const poppinsSans = Poppins({
    variable: "--font-poppins",
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"]
});

const notoSans = Noto_Sans({
    variable: "--font-noto-sans",
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"]
})


export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>

        <body
            className={`${notoSans.variable} antialiased`}
        >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <SessionProvider>
                {children}
            </SessionProvider>
        </ThemeProvider>
        </body>
        </html>
    );
}
