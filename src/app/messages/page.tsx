'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'

interface Message {
  id: string
  senderId: string
  receiverId: string
  content: string
  createdAt: string
  read: boolean
  sender: {
    name: string
    role: string
  }
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const { user } = useAuth()
  const router = useRouter()

  // 🔒 Se não estiver logado, sai fora
  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    fetchMessages()
  }, [user, router])

  const fetchMessages = async () => {
    try {
      // Em breve API real
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error)
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedUser) return
    setSending(true)
    try {
      console.log('📤 Mensagem enviada:', newMessage)
      setNewMessage('')
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      alert('Erro ao enviar mensagem')
    } finally {
      setSending(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Usuários disponíveis para chat (simulado)
  const availableUsers = [
    { id: 'doctor1', name: 'Dr. Carlos Silva', role: 'DOCTOR', specialty: 'Cardiologia' },
    { id: 'doctor2', name: 'Dr. Ana Santos', role: 'DOCTOR', specialty: 'Pediatria' }
  ]

  // 🚫 Enquanto não tiver usuário, não renderiza nada
  if (!user || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Carregando mensagens...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">💬 Mensagens</h1>
          <p className="text-gray-600">Comunique-se com sua equipe médica</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Lista de Contatos */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900">Contatos</h2>
            </div>
            <div className="p-2">
              {availableUsers.map(contact => (
                <button
                  key={contact.id}
                  onClick={() => setSelectedUser(contact.id)}
                  className={`w-full text-left p-3 rounded-lg mb-1 transition-colors ${
                    selectedUser === contact.id ? 'bg-blue-100 border border-blue-300' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="font-medium text-gray-900">{contact.name}</div>
                  <div className="text-sm text-gray-600">{contact.specialty}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Área de Chat */}
          <div className="lg:col-span-3 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col">
            {selectedUser ? (
              <>
                {/* Cabeçalho do Chat */}
                <div className="p-4 border-b border-gray-200">
                  <h2 className="font-semibold text-gray-900">
                    {availableUsers.find(u => u.id === selectedUser)?.name}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {availableUsers.find(u => u.id === selectedUser)?.specialty}
                  </p>
                </div>

                {/* Mensagens */}
                <div className="flex-1 p-4 overflow-y-auto max-h-96">
                  <div className="space-y-4">
                    {messages
                      .filter(msg =>
                        user?.id && (
                          (msg.senderId === selectedUser && msg.receiverId === user.id) ||
                          (msg.senderId === user.id && msg.receiverId === selectedUser)
                        )
                      )
                      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                      .map(message => (
                        <div
                          key={message.id}
                          className={`flex ${
                            message.senderId === user?.id ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              message.senderId === user?.id
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-900'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <p
                              className={`text-xs mt-1 ${
                                message.senderId === user?.id ? 'text-blue-200' : 'text-gray-500'
                              }`}
                            >
                              {formatDate(message.createdAt)}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Input */}
                <div className="p-4 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Digite sua mensagem..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={sending || !newMessage.trim()}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                    >
                      {sending ? '...' : 'Enviar'}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">💬</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Selecione um contato</h3>
                  <p className="text-gray-600">Escolha um médico para iniciar a conversa</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
