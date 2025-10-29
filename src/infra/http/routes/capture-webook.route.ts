import { db } from '@/infra/database'
import { webhooks } from '@/infra/database/schemas/webhooks.schema'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

export const captureWebhookRoute:FastifyPluginAsyncZod = async (app) => {
  app.all('/api/capture/*',
    {
      schema: {
        summary: 'Capture incoming webhook request',
        tags: ['External'],
        response: {
          201: z.object({
            id: z.uuidv7()
          })
        }
      }
    },
    async (request, reply) => {

      const method = request.method
      const ip = request.ip
      const contentType = request.headers['content-type']
      const contentLength = request.headers['content-length']
        ? Number(request.headers['content-length']) : null
      
      let body:string | null = null

      if(request.body) {
        body = typeof request.body === 'string' ? request.body : JSON.stringify(request.body, null, 2)
      }

      const pathname = new URL(request.url).pathname.replace('/capture', '')

      const headers = Object.fromEntries(
        Object.entries(request.headers).map(([key, value]) => [
          key,
          Array.isArray(value) ? value.join(', '): value || '',
        ])
      )

      const result = await db
      .insert(webhooks)
      .values({
        method,
        ip,
        contentType,
        contentLength,
        body,
        pathname,
        headers,
      })
      .returning()

      const { id } = result[0]

      return reply.send({
        id
      })
    }
  )
}