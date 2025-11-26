'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'

interface MedicalRecord {
  id: string
  title: string
  description: string
  fileUrl: string
  fileName: string
  fileSize: number
  fileType: string
  createdAt: string
  doctor: {
    name: string
    specialty: string
  } | null
}

export default function MyExamsPage() {
  const [records, setRecords] = useState<MedicalRecord[]>([])
  const [uploading, setUploading] = useState(false)
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    fetchMedicalRecords()
  }, [user, router])

  // 🔥 DEBUG: Monitorar mudanças nos records
  useEffect(() => {
    console.log('🔄 Records atualizado:', records)
  }, [records])

  const fetchMedicalRecords = async () => {
    try {
      console.log('🔍 Buscando exames para paciente:', user?.patient?.id)
      
      // 🔥 CORREÇÃO: Adicionar patientId na URL
      const response = await fetch(`/api/medical-records?patientId=${user?.patient?.id}`)
      
      console.log('📡 Status da resposta:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('📋 Exames carregados:', data)
        setRecords(data)
      } else {
        const error = await response.text()
        console.error('❌ Erro na API:', error)
      }
    } catch (error) {
      console.error('❌ Erro ao buscar exames:', error)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Limitar para 10MB
      if (file.size > 10 * 1024 * 1024) {
        alert('Arquivo muito grande. Tamanho máximo: 10MB')
        return
      }
      setSelectedFile(file)
      // Preencher título automaticamente se vazio
      if (!formData.title) {
        setFormData(prev => ({
          ...prev,
          title: file.name.split('.')[0] // Nome do arquivo sem extensão
        }))
      }
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile || !user?.patient?.id) return

    setUploading(true)

    try {
      // Criar FormData para upload
      const formDataToSend = new FormData()
      formDataToSend.append('file', selectedFile)
      formDataToSend.append('title', formData.title)
      formDataToSend.append('description', formData.description)
      formDataToSend.append('patientId', user.patient.id)

      console.log('📤 Iniciando upload...')

      const response = await fetch('/api/medical-records/upload', {
        method: 'POST',
        body: formDataToSend,
      })

      if (response.ok) {
        const result = await response.json()
        console.log('✅ Upload bem-sucedido:', result)
        alert('Exame enviado com sucesso!')
        
        // Resetar formulário
        setShowUploadForm(false)
        setFormData({ title: '', description: '' })
        setSelectedFile(null)
        
        // 🔥 Recarregar a lista
        console.log('🔄 Recarregando lista de exames...')
        await fetchMedicalRecords()
        
      } else {
        const error = await response.json()
        console.error('❌ Erro no upload:', error)
        alert(error.error || 'Erro ao enviar exame')
      }
    } catch (error) {
      console.error('❌ Erro no upload:', error)
      alert('Erro ao enviar exame')
    } finally {
      setUploading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
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

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return '📄'
    if (fileType.includes('image')) return '🖼️'
    if (fileType.includes('word')) return '📝'
    return '📎'
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Cabeçalho */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🏥 Meus Exames e Documentos
          </h1>
          <p className="text-gray-600">
            Gerencie seus exames, laudos e documentos médicos
          </p>
        </div>

        {/* Botões */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => setShowUploadForm(!showUploadForm)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center"
          >
            <span className="mr-2">📤</span>
            Enviar Novo Exame
          </button>
          
          <button
            onClick={fetchMedicalRecords}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center"
          >
            <span className="mr-2">🔄</span>
            Recarregar Lista
          </button>
        </div>

        {/* Formulário de Upload */}
        {showUploadForm && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Enviar Novo Exame</h2>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título do Exame *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Hemograma completo, Raio-X Toráx..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição (opcional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Observações sobre o exame..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Arquivo do Exame *
                </label>
                <input
                  type="file"
                  onChange={handleFileSelect}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Formatos aceitos: PDF, JPG, PNG, DOC (Máx: 10MB)
                </p>
                {selectedFile && (
                  <div className="mt-2 p-2 bg-blue-50 rounded">
                    <p className="text-sm text-blue-700">
                      📎 {selectedFile.name} ({formatFileSize(selectedFile.size)})
                    </p>
                  </div>
                )}
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={uploading || !selectedFile}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                >
                  {uploading ? 'Enviando...' : '📤 Enviar Exame'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowUploadForm(false)}
                  className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Lista de Exames */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold">Meus Exames ({records.length})</h2>
          </div>
          
          <div className="p-6">
            {records.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📁</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Nenhum exame encontrado
                </h3>
                <p className="text-gray-600">
                  Envie seu primeiro exame clicando no botão acima.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {records.map(record => (
                  <div key={record.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="text-2xl mt-1">
                          {getFileIcon(record.fileType)}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {record.title}
                          </h3>
                          {record.description && (
                            <p className="text-sm text-gray-600 mb-2">
                              {record.description}
                            </p>
                          )}
                          <div className="text-sm text-gray-500 space-y-1">
                            <p>📎 {record.fileName} • {formatFileSize(record.fileSize)}</p>
                            <p>📅 {formatDate(record.createdAt)}</p>
                            {record.doctor && (
                              <p>👨‍⚕️ Solicitado por: Dr. {record.doctor.name}</p>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <a
                          href={record.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
                        >
                          👁️ Visualizar
                        </a>
                        <a
                          href={record.fileUrl}
                          download={record.fileName}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm"
                        >
                          📥 Download
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Informações */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-800 mb-3">💡 Dicas Importantes</h3>
          <ul className="text-sm text-blue-700 space-y-2">
            <li>• Mantenha seus exames organizados por data</li>
            <li>• Sempre nomeie os arquivos de forma clara</li>
            <li>• Guarde os exames por pelo menos 5 anos</li>
            <li>• Compartilhe os exames com seus médicos durante as consultas</li>
          </ul>
        </div>
      </div>
    </div>
  )
}