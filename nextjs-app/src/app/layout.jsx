import { Manrope, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/lib/contexts/AuthContext'

const manrope = Manrope({ subsets: ['latin'] })
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' })

export const metadata = {
  title: 'LinkedIn Yearly Wrap • Preview (Chart.js)',
  description: 'Analyze your LinkedIn posts with AI-powered insights',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${manrope.className} ${jetbrainsMono.variable}`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
