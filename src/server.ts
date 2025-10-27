import { fastify } from 'fastify'
import { serializerCompiler, validatorCompiler, type ZodTypeProvider, jsonSchemaTransform } from 'fastify-type-provider-zod'
import cors from '@fastify/cors'
import scalar from '@scalar/fastify-api-reference'
import { fastifySwagger } from '@fastify/swagger'
import { env } from './env'

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
    routePrefix: '/docs'
  })
}

server.setValidatorCompiler(validatorCompiler)
server.setSerializerCompiler(serializerCompiler)

server.listen({ port: env.PORT }).then(() => {
  console.log('HTTP server running!')
})