import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Echoes of Home — Turn memories into stories you can hear",
  description:
    "A voice-first assistant that turns family photos and videos into conversational audio experiences for visually impaired users.",
  openGraph: {
    title: "Echoes of Home",
    description: "Turn cherished moments into stories you can hear.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen" style={{ background: "#fdf8f0" }}>
        {children}
      </body>
    </html>
  );
}
