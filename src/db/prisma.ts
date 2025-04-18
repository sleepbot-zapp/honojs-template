import { PrismaClient } from '@prisma/client'
import { Logger } from '@/utils/logger'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query', 'error', 'warn'],
  })

prisma.$on('query' as never, (e: { query: any; params: any; duration: any }) => {
  Logger.dbWrite(
    `Prisma Query: ${e.query} | Params: ${JSON.stringify(e.params)} | Duration: ${e.duration}ms`
  )
})

prisma.$on('error' as never, (e: { message: string }) => {
  Logger.db('Prisma Error: ' + e.message)
})

prisma.$on('warn' as never, (e: { message: string }) => {
  Logger.db('Prisma Warn: ' + e.message)
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

async function connectPrisma() {
  try {
    await prisma.$connect()
    Logger.dbConnect('Connected to PostgreSQL database via Prisma')
  } catch (err) {
    Logger.error('Prisma connection error: ' + (err as Error).message)
    Logger.db('Prisma connection failed')
    process.exit(1)
  }
}

connectPrisma()

process.on('beforeExit', async () => {
  await prisma.$disconnect()
  Logger.dbConnect('Disconnected from database (beforeExit)')
})

export default prisma
