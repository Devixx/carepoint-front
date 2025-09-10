import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "./contexts/AuthContext";
import "./globals.css";
import Providers from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CarePoint - Doctor Dashboard",
  description: "Modern Doctor-Patient Appointment Management System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <AuthProvider>{children}</AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
