import type { Metadata } from "next"
import { Rajdhani, Inter } from "next/font/google"
import "./globals.css"

const rajdhani = Rajdhani({
  variable: "--font-rajdhani",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Lapzy Hub",
  description: "Cronometragem de kart — painel de gestão e análise",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${rajdhani.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg text-text-primary font-body">
        {children}
      </body>
    </html>
  )
}
