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
      <body className="min-h-screen bg-[#F9FAFB] text-[#111827] antialiased flex flex-col">
        {children}
      </body>
    </html>
  );
}
