import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST() {
  try {
    console.log('🔄 Resetando todas as senhas para bcrypt...')

    // Resetar senha do paciente
    await prisma.user.updateMany({
      where: { email: 'paciente@exemplo.com' },
      data: { password: await bcrypt.hash('senha123', 12) }
    })

    // Resetar senhas dos médicos
    await prisma.user.updateMany({
      where: {
        OR: [
          { email: 'dr.silva@clinica.com' },
          { email: { contains: '@clinica.com' } }
        ]
      },
      data: { password: await bcrypt.hash('senha123', 12) }
    })

    console.log('✅ Todas as senhas foram resetadas!')
    
    return NextResponse.json({
      message: 'Senhas resetadas com sucesso',
      credentials: {
        paciente: 'paciente@exemplo.com / senha123',
        medico: 'dr.silva@clinica.com / senha123'
      }
    })

  } catch (error) {
    console.error('Erro ao resetar senhas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}