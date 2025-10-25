import { Manrope, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/lib/contexts/AuthContext'
import { UIPreferencesProvider } from '@/lib/contexts/UIPreferencesContext'
import { EditableContentProvider } from '@/lib/contexts/EditableContentContext'
import ErrorBoundary from '@/components/ErrorBoundary'

const manrope = Manrope({ subsets: ['latin'] })
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' })

export const metadata = {
  title: 'LinkedIn Yearly Wrap • Preview (Chart.js)',
  description: 'Analyze your LinkedIn posts with AI-powered insights',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${manrope.className} ${jetbrainsMono.variable}`}>
        <ErrorBoundary>
          <AuthProvider>
            <UIPreferencesProvider>
              <EditableContentProvider>
                {children}
              </EditableContentProvider>
            </UIPreferencesProvider>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
