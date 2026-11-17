import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "./Header";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Meu Cine",
  description: "Filmes e Séries em alta — catálogo completo",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#0a0a0f] text-white">
        <Header />
        <main className="flex-1">{children}</main>
        <footer className="py-8 text-center text-gray-500 text-sm border-t border-gray-800/60">
          <p>© Direitos reservados - Atlas System</p>
        </footer>
      </body>
    </html>
  );
}
