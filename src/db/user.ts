import { ModelHandler } from '@/db/model-handler'

export class UserHandler extends ModelHandler<'user'> {
  constructor() {
    super('user')
  }

  async findByUsername(username: string) {
    return this.findUnique({
      where: { username }
    })
  }

  async createUser(username: string, passwordHash: string) {
    return this.create({
      data: { username, passwordHash }
    })
  }
}

export const userHandler = new UserHandler()
