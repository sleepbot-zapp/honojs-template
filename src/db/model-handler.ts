import { PrismaClient } from '@prisma/client'
import { prisma } from '@/db/prisma'
import { errorResponse } from '@/utils/response'
import { Logger } from '@/utils/logger'

export class ModelHandler<T extends keyof PrismaClient> {
  protected model: any

  constructor(model: T) {
    this.model = prisma[model]
  }

  async create(args: any) {
    try {
      const result = await this.model.create(args)
      Logger.dbWrite(`Created: ${JSON.stringify(result)}`)
      return result
    } catch (err) {
      Logger.error(`[CREATE ERROR] ${err}`)
      throw errorResponse(500, 'Create failed', 'Database error')
    }
  }

  async findUnique(args: any) {
    try {
      const result = await this.model.findUnique(args)
      Logger.dbRead(`Find unique: ${JSON.stringify(result)}`)
      return result
    } catch (err) {
      Logger.error(`[FIND UNIQUE ERROR] ${err}`)
      throw errorResponse(500, 'Find unique failed', 'Database error')
    }
  }

  async findMany(args?: any) {
    try {
      const result = await this.model.findMany(args)
      Logger.dbRead(`Find many: ${JSON.stringify(result)}`)
      return result
    } catch (err) {
      Logger.error(`[FIND MANY ERROR] ${err}`)
      throw errorResponse(500, 'Find many failed', 'Database error')
    }
  }

  async update(args: any) {
    try {
      const result = await this.model.update(args)
      Logger.dbWrite(`Updated: ${JSON.stringify(result)}`)
      return result
    } catch (err) {
      Logger.error(`[UPDATE ERROR] ${err}`)
      throw errorResponse(500, 'Update failed', 'Database error')
    }
  }

  async delete(args: any) {
    try {
      const result = await this.model.delete(args)
      Logger.dbWrite(`Deleted: ${JSON.stringify(result)}`)
      return result
    } catch (err) {
      Logger.error(`[DELETE ERROR] ${err}`)
      throw errorResponse(500, 'Delete failed', 'Database error')
    }
  }
}
