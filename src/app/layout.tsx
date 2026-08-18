import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tripa AI - Assistente de Viagens e Ferias",
  description:
    "Assistente de planeamento de viagens e ferias economicas com analise de custos e orquestracao inteligente.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-PT" className="dark">
      <body className="antialiased min-h-screen bg-[#070b14] text-slate-100 selection:bg-sky-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
