'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'

interface Notification {
  id: string
  type: 'APPOINTMENT_REMINDER' | 'APPOINTMENT_CONFIRMED' | 'APPOINTMENT_CANCELLED' | 'NEW_PRESCRIPTION' | 'EXAM_READY'
  title: string
  message: string
  read: boolean
  createdAt: string
  metadata?: any
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    fetchNotifications()
  }, [user, router])

  const fetchNotifications = async () => {
    try {
      // Simular notificações por enquanto
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'APPOINTMENT_REMINDER',
          title: 'Lembrete de Consulta',
          message: 'Sua consulta com Dr. Carlos Silva está agendada para amanhã às 14:00',
          read: false,
          createdAt: new Date().toISOString(),
          metadata: { appointmentId: '123' }
        },
        {
          id: '2',
          type: 'NEW_PRESCRIPTION',
          title: 'Nova Prescrição',
          message: 'Dr. Carlos Silva prescreveu um novo medicamento',
          read: true,
          createdAt: new Date(Date.now() - 86400000).toISOString() // 1 dia atrás
        }
      ]
      
      setNotifications(mockNotifications)
    } catch (error) {
      console.error('Erro ao buscar notificações:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    )
  }

  const markAllAsRead = async () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    )
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'APPOINTMENT_REMINDER': return '⏰'
      case 'APPOINTMENT_CONFIRMED': return '✅'
      case 'APPOINTMENT_CANCELLED': return '❌'
      case 'NEW_PRESCRIPTION': return '💊'
      case 'EXAM_READY': return '📄'
      default: return '🔔'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const unreadCount = notifications.filter(n => !n.read).length

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Carregando notificações...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Cabeçalho */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                🔔 Notificações
              </h1>
              <p className="text-gray-600">
                {unreadCount > 0 
                  ? `${unreadCount} notificação${unreadCount > 1 ? 'es' : ''} não lida${unreadCount > 1 ? 's' : ''}`
                  : 'Todas as notificações foram lidas'
                }
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Marcar Todas como Lidas
              </button>
            )}
          </div>
        </div>

        {/* Lista de Notificações */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Nenhuma notificação
              </h3>
              <p className="text-gray-600">
                Você não tem notificações no momento.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-6 hover:bg-gray-50 transition-colors ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div className="text-2xl flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className={`text-lg font-semibold ${
                            !notification.read ? 'text-blue-900' : 'text-gray-900'
                          }`}>
                            {notification.title}
                          </h3>
                          <p className={`mt-1 ${
                            !notification.read ? 'text-blue-700' : 'text-gray-600'
                          }`}>
                            {notification.message}
                          </p>
                        </div>
                        
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="ml-4 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                          >
                            Marcar como lida
                          </button>
                        )}
                      </div>
                      
                      <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                        <span>{formatDate(notification.createdAt)}</span>
                        {!notification.read && (
                          <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs">
                            Nova
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Informações */}
        <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="font-semibold text-green-800 mb-3">💡 Sobre as Notificações</h3>
          <ul className="text-sm text-green-700 space-y-2">
            <li>• Você receberá lembretes de consultas 24h antes</li>
            <li>• Notificações sobre novas prescrições e exames</li>
            <li>• Alertas sobre cancelamentos e reagendamentos</li>
            <li>• Todas as notificações ficam salvas por 30 dias</li>
          </ul>
        </div>
      </div>
    </div>
  )
}