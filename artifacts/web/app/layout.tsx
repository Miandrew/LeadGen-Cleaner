import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CommercialCleaningNearMe.com — Find Trusted Commercial Cleaning Companies',
  description:
    'Browse 10,000+ verified commercial cleaning companies across all 50 states. Compare services, read real reviews, and request free quotes.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
