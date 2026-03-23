import type { Metadata } from "next";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "PDF Annotation App",
  description: "Annotate PDFs with shapes and text.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-screen flex-col bg-app-bg text-app-text antialiased">
        {children}
      </body>
    </html>
  );
}
