import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    const file = formData.get('file') as File
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const patientId = formData.get('patientId') as string

    console.log('🔍 Dados do upload:', { 
      title, 
      description, 
      patientId, 
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type
    })

    // Validações
    if (!file) {
      return NextResponse.json(
        { error: 'Arquivo é obrigatório' },
        { status: 400 }
      )
    }

    if (!title) {
      return NextResponse.json(
        { error: 'Título é obrigatório' },
        { status: 400 }
      )
    }

    if (!patientId) {
      return NextResponse.json(
        { error: 'ID do paciente é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar se o paciente existe
    const patient = await prisma.patient.findUnique({
      where: { id: patientId }
    })

    if (!patient) {
      return NextResponse.json(
        { error: 'Paciente não encontrado' },
        { status: 404 }
      )
    }

    // Verificar tamanho do arquivo (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Arquivo muito grande. Tamanho máximo: 10MB' },
        { status: 400 }
      )
    }

    // Criar diretório se não existir
    const uploadsDir = join(process.cwd(), 'public/uploads')
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
      console.log('✅ Diretório de uploads criado:', uploadsDir)
    }

    // Gerar nome único para o arquivo
    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop()
    const fileName = `exam_${patientId}_${timestamp}.${fileExtension}`
    const filePath = join(uploadsDir, fileName)

    console.log('📁 Salvando arquivo:', filePath)

    // Converter File para Buffer e salvar
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    console.log('✅ Arquivo salvo com sucesso')

    // AGORA USANDO O NOME CORRETO: medicalRecord (minúsculo)
    console.log('🔍 Criando registro no banco...')
    
    const record = await prisma.medicalRecord.create({
      data: {
        patientId,
        title,
        description: description || '',
        fileUrl: `/uploads/${fileName}`,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      },
      include: {
        doctor: {
          select: {
            name: true,
            specialty: true
          }
        }
      }
    })

    console.log('✅ Registro médico criado com sucesso:', record.id)

    return NextResponse.json({
      success: true,
      message: 'Exame enviado com sucesso!',
      record: record
    })

  } catch (error: any) {
    console.error('❌ Erro no upload:', error)
    console.error('❌ Stack trace:', error.stack)
    
    return NextResponse.json(
      { 
        error: 'Erro ao enviar exame',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}