// test-connection.js
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function test() {
  try {
    console.log('🔌 Testando conexão com PostgreSQL...')
    await prisma.$connect()
    console.log('✅ Conectado ao PostgreSQL!')
    
    // Teste criar uma tabela simples
    await prisma.$executeRaw`SELECT 1 as test`
    console.log('✅ Query executada com sucesso!')
    
    await prisma.$disconnect()
  } catch (error) {
    console.error('❌ Erro:', error.message)
  }
}

test()