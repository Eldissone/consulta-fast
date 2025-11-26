import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, phone, birthDate } = await request.json()

    // Verificar se o usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Usuário já cadastrado' },
        { status: 400 }
      )
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 12)

    // Criar usuário e paciente
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: 'PATIENT',
        patient: {
          create: {
            name,
            phone,
            birthDate: new Date(birthDate)
          }
        }
      },
      include: {
        patient: true
      }
    })

    // Remover a senha do retorno
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      message: 'Usuário criado com sucesso',
      user: userWithoutPassword
    })

  } catch (error) {
    console.error('Erro no registro:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}