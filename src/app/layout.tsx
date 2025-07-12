'use client'
import { Geist, Geist_Mono } from "next/font/google";
import UserContext from "@/components/context-api/save-user-context";
import "./globals.css";
import { UserInformation } from "./types/application.types";
import { useState } from "react";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });



export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
 const [user, setUser] = useState<UserInformation | null>(null);

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <UserContext.Provider value={{ user, setUser }}>
          {children}
        </UserContext.Provider>
      </body>
    </html>
  );
}
