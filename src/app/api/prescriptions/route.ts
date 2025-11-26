import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { doctorId, patientId, medication, dosage, instructions } = await request.json()

    const prescription = await prisma.prescription.create({
      data: {
        doctorId,
        patientId,
        medication,
        dosage,
        instructions
      },
      include: {
        patient: {
          select: {
            name: true,
            phone: true,
            birthDate: true
          }
        }
      }
    })

    return NextResponse.json(prescription)
  } catch (error) {
    console.error('Erro ao criar prescrição:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}