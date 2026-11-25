import type { Metadata, Viewport } from "next";
import { Roboto_Flex } from "next/font/google";
import { site } from "@/content/site";
import "./globals.css";

// One variable font for everything, from 12px labels to a name the width of
// the screen. The extra axes are what let the letters breathe.
const robotoFlex = Roboto_Flex({
  subsets: ["latin"],
  axes: ["wdth", "GRAD", "opsz", "slnt"],
  variable: "--font-flex",
  display: "swap",
});

const name = `${site.firstName} ${site.lastName}`;

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: name,
    template: `%s · ${name}`,
  },
  description: `${name}. ${site.tagline} A portfolio with no pictures: the name is the site, and every letter holds a project.`,
};

export const viewport: Viewport = {
  themeColor: "#f4f2ed",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${robotoFlex.variable} antialiased`}>
      <body>
        <a href="#index" className="skip">
          Skip to the index
        </a>
        {children}
      </body>
    </html>
  );
}
