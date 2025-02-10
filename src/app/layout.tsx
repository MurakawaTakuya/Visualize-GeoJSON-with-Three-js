import PlaceSelection from "@/components/PlaceSelection/PlaceSelection";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import "./globals.scss";

export const metadata: Metadata = {
  title: "Visualize GeoJSON with Three js",
  description: "This app visualizes GeoJSON data using Three.js.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        <main>
          <PlaceSelection>{children}</PlaceSelection>
          <SpeedInsights />
          <Analytics />
        </main>
      </body>
    </html>
  );
}
