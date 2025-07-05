import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "FlowPulse - Real-time Stablecoin Flow Dashboard",
  description: "Monitor stablecoin flows across blockchain networks with real-time analytics and betting",
  keywords: "stablecoin, blockchain, defi, analytics, betting, ethereum, polygon, arbitrum",
  authors: [{ name: "FlowPulse Team" }],
  openGraph: {
    title: "FlowPulse - Real-time Stablecoin Flow Dashboard",
    description: "Monitor stablecoin flows across blockchain networks with real-time analytics and betting",
    type: "website",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "FlowPulse - Real-time Stablecoin Flow Dashboard",
    description: "Monitor stablecoin flows across blockchain networks with real-time analytics and betting",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
