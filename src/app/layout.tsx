// src/app/layout.tsx
import "./globals.css";
import Providers from "./providers";

export const metadata = {
  title: "CarePoint",
  description: "Medical appointment management",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Ensure every page is wrapped by Providers so useToast() always has context
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
