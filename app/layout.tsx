import type React from "react"
import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "FlowPulse - Real-time Stablecoin Flow Dashboard",
  description: "Monitor stablecoin flows across blockchain networks with real-time analytics and betting",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
