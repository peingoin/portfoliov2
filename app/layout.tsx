import type { Metadata, Viewport } from "next";
import { Archivo, IBM_Plex_Mono, Newsreader } from "next/font/google";
import { TopBar } from "@/components/chrome/TopBar";
import { site } from "@/content/site";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["italic"],
  weight: ["400", "500"],
  variable: "--font-newsreader",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name}: portfolio survey`,
    template: `%s · ${site.name}`,
  },
  description: `${site.name}. ${site.tagline} A portfolio drawn as a contour map, where every summit is a project.`,
};

export const viewport: Viewport = {
  themeColor: "#0e1211",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${plexMono.variable} ${newsreader.variable} antialiased`}
    >
      <body className="min-h-svh">
        <a
          href="#content"
          className="btn btn-primary fixed left-4 top-4 z-50 -translate-y-24 focus-visible:translate-y-0"
        >
          Skip to content
        </a>
        <TopBar />
        <div id="content">{children}</div>
      </body>
    </html>
  );
}
