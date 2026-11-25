import type { Metadata, Viewport } from "next";
import { Oxanium, Space_Grotesk } from "next/font/google";
import { Starfield } from "@/components/Starfield";
import { site } from "@/content/site";
import { scenes } from "@/lib/scenes";
import "./globals.css";

const oxanium = Oxanium({
  subsets: ["latin"],
  variable: "--font-oxanium",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const name = `${site.firstName} ${site.lastName}`;

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: `${name}: portfolio`,
  description: `${name}. ${site.tagline} A zero-gravity portfolio where everything is a physical object you can throw around.`,
};

export const viewport: Viewport = {
  themeColor: "#03060d",
};

// Runs before first paint. Marks that motion will play, so the tidy layout is
// not shown for a moment first, and lets ?scene=name pick the scroll scene.
const motionFlag = `try{var d=document.documentElement,s=new URLSearchParams(location.search).get('scene');if(${JSON.stringify(
  Object.keys(scenes),
)}.indexOf(s)>-1)d.dataset.scene=s;if(!matchMedia('(prefers-reduced-motion: reduce)').matches)d.classList.add('motion')}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" data-scene={site.scene} className={`${oxanium.variable} ${spaceGrotesk.variable} antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: motionFlag }} />
        <noscript>
          <style>{`dialog.case{display:block;position:static;margin:24px auto;max-height:none}`}</style>
        </noscript>
      </head>
      <body>
        <Starfield />
        {children}
      </body>
    </html>
  );
}
