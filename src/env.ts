import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['production', 'development']),
  PORT: z.coerce.number().default(8080),
  DATABASE_URL: z.url().startsWith('postgresql://', {
    error: 'Invalid database url.'
  })
})

export const env = envSchema.parse(process.env)
