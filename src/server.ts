import { fastify } from 'fastify'
import { serializerCompiler, validatorCompiler, type ZodTypeProvider, jsonSchemaTransform } from 'fastify-type-provider-zod'
import cors from '@fastify/cors'
import scalar from '@scalar/fastify-api-reference'
import { fastifySwagger } from '@fastify/swagger'
import { env } from './env'
import { listWebhooksRoute } from './infra/http/routes/list-webhooks.route'
import { getWebhookRoute } from './infra/http/routes/get-webhook.route'
import { deleteWebhookRoute } from './infra/http/routes/delete-webhook.route'
import { captureWebhookRoute } from './infra/http/routes/capture-webook.route'

const server = fastify().withTypeProvider<ZodTypeProvider>()

server.register(cors,{
  origin: ['http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
})

if(env.NODE_ENV === 'development') {
  
  server.register(fastifySwagger, {
    openapi: {
      info: {
        title: 'Hookly',
        description: 'API for capturing and inspecting webhook requests',
        version: '1.0.0',
      }
    },
    transform: jsonSchemaTransform,
  })

  server.register(scalar, {
    routePrefix: '/api/docs'
  })
}

server.setValidatorCompiler(validatorCompiler)
server.setSerializerCompiler(serializerCompiler)

server.register(listWebhooksRoute)
server.register(getWebhookRoute)
server.register(deleteWebhookRoute)
server.register(captureWebhookRoute)

server.listen({ port: env.PORT }).then(() => {
  console.log(`💻 HTTP server running on http://localhost:${env.PORT}`)
  console.log(`📝 Docs available at http://localhost:${env.PORT}/api/docs`)
})