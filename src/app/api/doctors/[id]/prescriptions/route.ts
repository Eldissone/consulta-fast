import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const doctorId = params.id

    const prescriptions = await prisma.prescription.findMany({
      where: {
        doctorId
      },
      include: {
        patient: {
          select: {
            name: true,
            phone: true,
            birthDate: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(prescriptions)
  } catch (error) {
    console.error('Erro ao buscar prescrições:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}