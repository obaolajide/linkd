import type { Metadata } from "next";
import PwaRegistration from "@/components/PwaRegistration";

export const metadata: Metadata = {
  title: "linkd",
  description: "Personal sync inbox",
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, backgroundColor: "#f7f7f7" }}>
        <PwaRegistration />
        {children}
      </body>
    </html>
  );
}
