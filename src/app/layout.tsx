import type { Metadata, Viewport } from "next";
import { Archivo, Bricolage_Grotesque, Spline_Sans_Mono } from "next/font/google";
import "./globals.css";
import { NavBar } from "@/components/NavBar";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
});
const archivo = Archivo({ subsets: ["latin"], variable: "--font-archivo" });
const spline = Spline_Sans_Mono({ subsets: ["latin"], variable: "--font-spline" });

export const metadata: Metadata = {
  title: {
    default: "Promptly — Find the right prompt. Don't reinvent it.",
    template: "%s · Promptly",
  },
  description:
    "220,106 reusable prompts across 22 domains. Describe the job — Promptly finds the match, you copy it and go. Nothing fits? Generate writes a new one.",
};

// Light-only experience: never let the OS darken the app.
export const viewport: Viewport = {
  themeColor: "#FFFDF9",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${archivo.variable} ${spline.variable}`}
    >
      <body className="flex min-h-screen flex-col">
        <NavBar />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-20 pt-8 sm:px-6">
          {children}
        </main>
        <footer className="border-t border-cyan/15 bg-paper-soft py-6">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-2 px-4 font-mono text-xs text-ink-mute">
            <span className="inline-block h-2 w-2 rounded-full bg-cyan" aria-hidden />
            <span className="inline-block h-2 w-2 rounded-full bg-cyan-light" aria-hidden />
            <span className="inline-block h-2 w-2 rounded-full bg-turquoise" aria-hidden />
            <span className="ml-2">
              Promptly — find the right prompt, don&apos;t reinvent it.
            </span>
          </div>
        </footer>
      </body>
    </html>
  );
}
