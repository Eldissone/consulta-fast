import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        patient: true,
        doctor: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      )
    }

    // Verificar senha - compatibilidade com senhas antigas e novas
    let isPasswordValid = false
    
    // Primeiro tenta verificar com bcrypt
    if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
      // Senha já está em bcrypt
      isPasswordValid = await bcrypt.compare(password, user.password)
    } else {
      // Senha antiga em texto puro - fazer migração
      if (user.password === password) {
        isPasswordValid = true
        // Atualizar para bcrypt
        const hashedPassword = await bcrypt.hash(password, 12)
        await prisma.user.update({
          where: { id: user.id },
          data: { password: hashedPassword }
        })
        console.log(`✅ Senha do usuário ${email} migrada para bcrypt`)
      }
    }

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      )
    }

    // Remover senha do retorno
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      message: 'Login realizado com sucesso',
      user: userWithoutPassword
    })

  } catch (error) {
    console.error('Erro no login:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}