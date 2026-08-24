import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
    variable: "--font-nunito",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Jackson Wright",
    description: "Jackson Wright's Professional Website",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={`${nunito.className} h-full antialiased`}>
            <body className="min-h-dvh flex flex-col">
                {children}
            </body>
        </html>
    );
}
