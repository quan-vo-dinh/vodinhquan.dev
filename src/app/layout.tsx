import Navbar from "@/components/navbar";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DATA } from "@/data/resume";
import { LocaleProvider } from "@/i18n/locale-provider";
import { getServerI18n } from "@/i18n/server";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ModeToggle } from "@/components/mode-toggle";
import { BackgroundGrid } from "@/components/background-grid";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-mono",
});

export async function generateMetadata(): Promise<Metadata> {
  const { dictionary, locale } = await getServerI18n();

  return {
    metadataBase: new URL(DATA.url),
    title: {
      default: DATA.name,
      template: `%s | ${DATA.name}`,
    },
    description: dictionary.metadata.description,
    openGraph: {
      title: DATA.name,
      description: dictionary.metadata.description,
      url: DATA.url,
      siteName: DATA.name,
      locale: locale === "vi" ? "vi_VN" : "en_US",
      type: "website",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    twitter: {
      title: DATA.name,
      card: "summary_large_image",
    },
    verification: {
      google: "",
      yandex: "",
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { dictionary, locale } = await getServerI18n();

  return (
    <html lang={locale} suppressHydrationWarning className="overflow-x-clip max-w-full">
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased relative overflow-x-clip",
          geist.variable,
          geistMono.variable,
        )}
      >
        <LocaleProvider dictionary={dictionary} locale={locale}>
          <ThemeProvider defaultTheme="dark">
            <TooltipProvider delayDuration={0}>
              <BackgroundGrid />
              <div className="absolute right-4 top-4 sm:right-6 sm:top-6 z-50">
                <ModeToggle className="size-10 rounded-3xl border border-border bg-background p-2.5 text-muted-foreground backdrop-blur-3xl transition-colors hover:bg-muted hover:text-foreground shadow-sm" />
              </div>
              <div className="relative z-10 max-w-2xl mx-auto pt-6 pb-20 sm:pt-10 sm:pb-24 px-3 sm:px-6">
                {children}
              </div>
              <Navbar />
            </TooltipProvider>
          </ThemeProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
