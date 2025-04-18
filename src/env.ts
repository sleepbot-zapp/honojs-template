import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const env = createEnv({
  server: {
    PORT: z.string().regex(/^\d+$/).transform(Number).default('3000'),
    NODE_ENV: z.enum(['development', 'production']).default('development'),
    JWT_SECRET: z.string().min(32, 'JWT_SECRET should be at least 32 characters long'),
    DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),
  },
  runtimeEnv: {
    PORT: process.env.PORT,
    NODE_ENV: process.env.NODE_ENV,
    JWT_SECRET: process.env.JWT_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
  },
})
