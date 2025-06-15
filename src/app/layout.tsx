"use client"

import { Noto_Sans} from "next/font/google";
import "@/styles/globals.css";
import React from "react";
import {SessionProvider} from "next-auth/react";
import {ThemeProvider} from "@/components/theme-provider";
import Head from "next/head";


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
        <Head>
            <title>Shabda - Nepali Dictionary</title>
        </Head>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <SessionProvider>
                {children}
            </SessionProvider>
        </ThemeProvider>
        </body>
        </html>
    );
}
