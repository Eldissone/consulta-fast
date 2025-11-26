import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const patients = await prisma.patient.findMany({
      select: {
        id: true,
        name: true,
        phone: true,
        birthDate: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(patients)
  } catch (error) {
    console.error('Erro ao buscar pacientes:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}