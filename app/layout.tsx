import type { Metadata, Viewport } from "next";
import PwaRegistration from "@/components/PwaRegistration";

export const metadata: Metadata = {
  title: "linkd",
  description: "Personal sync inbox",
  manifest: "/manifest.webmanifest",
  icons: { apple: "/icons/arrow-transparent-180.png" },
};

export const viewport: Viewport = { themeColor: "#000000" };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, backgroundColor: "#f7f7f7" }}>
        <PwaRegistration>{children}</PwaRegistration>
      </body>
    </html>
  );
}
