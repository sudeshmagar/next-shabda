"use client"

import React from "react";
import AnnouncementHeader from "@/components/announcement-header";
import {Header} from "@/components/header";


export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <AnnouncementHeader/>
            <Header />
            {children}
        </>

    );
}
