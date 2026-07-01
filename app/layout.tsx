import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "ResumeFit — Evidence-Grounded Resume Tailoring",
  description:
    "Tailors your resume to a job posting using only evidence traceable to your real experience, and flags which claims you might struggle to defend in an interview.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={dmSans.variable}>
      <body className="min-h-screen flex flex-col">{children}</body>
    </html>
  );
}
