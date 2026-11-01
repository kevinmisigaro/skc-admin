import type { Metadata } from "next";
import { Bangers, Poppins } from "next/font/google";
import "./globals.css";

const bangers = Bangers({
  variable: "--font-bangers",
  weight: "400",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "SKC Admin",
    template: "%s | SKC Admin",
  },
  description: "Staff dashboard for Swahili Komik Con — influencers, referral codes and redemptions.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${bangers.variable} ${poppins.variable} h-full antialiased`}
    >
      <body className="bg-grain flex min-h-full flex-col bg-warm-white text-comic-black">
        {children}
      </body>
    </html>
  );
}
