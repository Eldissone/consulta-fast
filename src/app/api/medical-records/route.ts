import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get('patientId')

    if (!patientId) {
      return NextResponse.json(
        { error: 'patientId é obrigatório' },
        { status: 400 }
      )
    }

    console.log('🔍 Buscando exames para paciente:', patientId)

    // USANDO O NOME CORRETO: medicalRecord (minúsculo)
    const records = await prisma.medicalRecord.findMany({
      where: { 
        patientId: patientId 
      },
      include: {
        doctor: {
          select: {
            name: true,
            specialty: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`✅ Encontrados ${records.length} exames`)

    return NextResponse.json(records)

  } catch (error: any) {
    console.error('❌ Erro ao buscar exames:', error)
    console.error('❌ Stack trace:', error.stack)
    
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}