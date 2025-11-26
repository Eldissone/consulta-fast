import './globals.css'
import { AuthProvider } from '@/context/AuthContext'
import Header from '@/components/Header'

export const metadata = {
  title: 'MedApp - Agende sua Consulta',
  description: 'Sistema de agendamento de consultas médicas',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>
        <AuthProvider>
          <Header />
          <main>
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  )
}