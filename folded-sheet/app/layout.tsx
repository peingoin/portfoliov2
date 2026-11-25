import type { Metadata, Viewport } from "next";
import { Archivo, Newsreader } from "next/font/google";
import { site } from "@/content/site";
import "./globals.css";

const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  variable: "--font-newsreader",
  display: "swap",
});

// A compact grotesque for labels: Archivo with its width axis, set narrow.
const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});

const name = `${site.firstName} ${site.lastName}`;

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: `${name}: a folded sheet`,
  description: `${name}. ${site.tagline} A portfolio printed on one sheet of paper that unfolds as you scroll.`,
};

export const viewport: Viewport = {
  themeColor: "#2a2826",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${newsreader.variable} ${archivo.variable} antialiased`}>
      <head>
        <noscript>
          <style>{`dialog.case{display:block;position:static;margin:24px auto;max-height:none}`}</style>
        </noscript>
      </head>
      <body>
        <a href="#flat" className="skip">
          Skip to the plain version
        </a>
        {children}
      </body>
    </html>
  );
}
