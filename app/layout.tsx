import { Inter, JetBrains_Mono } from 'next/font/google'
import { ToastProvider } from '@/components/ui/ToastContext'
import { NotificationProvider } from '@/components/ui/NotificationContext'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' })

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`}>
      <body>
        <ToastProvider>
          <NotificationProvider>
            {children}
          </NotificationProvider>
        </ToastProvider>
      </body>
    </html>
  )
}
