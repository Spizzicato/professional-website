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

export default function RootLayout(
    {children}: Readonly<{children: React.ReactNode;}>,
) {
    return (
        <html lang="en" className={`${nunito.className} h-full antialiased`}>
            <body>
                {children}
            </body>
        </html>
    );
}

export function Main(
    {children}: Readonly<{children: React.ReactNode;}>,
) {
    return (
        <main className="grid grid-rows-[auto_1fr] gap-6 min-h-dvh mx-auto p-6">
            {children}
        </main>
    );
}

export function Navbar() {
    return (
        <div className="hidden grid-rows-[auto_1fr] gap-6 min-h-dvh w-full mx-auto p-6 pr-0 lg:grid">
            {/* <nav className='basic-card'>
                hi
            </nav> */}
        </div>
    );
}

export function StandardLayout(
    {children}: Readonly<{children: React.ReactNode}>,
) {
    return (
        <div className="min-h-dvh bg-linear-to-b from-[#E7FFB9] via-emerald-300 to-blue-300">
            <div className="grid grid-rows-1 grid-cols-1 justify-items-center lg:grid-cols-[1fr_4fr_1fr]">
                <Navbar/>
                <Main children={children}/>
            </div>
        </div>
    );
}