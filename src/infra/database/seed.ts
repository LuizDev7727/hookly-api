import { faker } from '@faker-js/faker'
import { db } from './index'
import { webhooks } from './schemas/webhooks.schema'

const stripeEventTypes = [
  'payment_intent.succeeded',
  'payment_intent.payment_failed',
  'payment_intent.created',
  'charge.succeeded',
  'charge.failed',
  'charge.refunded',
  'customer.created',
  'customer.updated',
  'customer.deleted',
  'checkout.session.completed',
  'invoice.created',
  'invoice.paid',
  'invoice.payment_failed',
]

async function seed() {
  try {
    console.log('Seeding database...')

    const webhooksToInsert = []

    for (let i = 0; i < 60; i++) {
      const eventType = faker.helpers.arrayElement(stripeEventTypes)
      const customerId = `cus_${faker.string.alphanumeric(14)}`
      const paymentIntentId = `pi_${faker.string.alphanumeric(24)}`
      const chargeId = `ch_${faker.string.alphanumeric(24)}`

      const eventBody = {
        id: `evt_${faker.string.alphanumeric(24)}`,
        object: 'event',
        api_version: '2022-11-15',
        data: {
          object: {
            id: paymentIntentId,
            object: eventType.split('.')[0],
            amount: faker.number.int({ min: 100, max: 10000 }),
            currency: 'usd',
            customer: customerId,
            status: eventType.includes('succeeded') ? 'succeeded' : 'requires_payment_method',
            charge: chargeId,
          },
        },
        livemode: false,
        pending_webhooks: 1,
        request: {
          id: `req_${faker.string.alphanumeric(24)}`,
          idempotency_key: faker.string.uuid(),
        },
        type: eventType,
      }

      const bodyString = JSON.stringify(eventBody, null, 2)

      webhooksToInsert.push({
        method: 'POST',
        pathname: '/webhooks/stripe',
        ip: faker.internet.ip(),
        statusCode: 200,
        contentType: 'application/json',
        contentLength: bodyString.length,
        queryParams: {},
        headers: {
          'user-agent': 'Stripe/1.0 (+https://stripe.com/docs/webhooks)',
          'stripe-signature': `t=${Math.floor(Date.now() / 1000)},v1=${faker.string.hexadecimal({ length: 64 })},v0=${faker.string.hexadecimal({ length: 64 })}`,
          'content-type': 'application/json',
        },
        body: bodyString,
      })
    }

    await db.insert(webhooks).values(webhooksToInsert)

    console.log(`Seeded 60 webhooks.`)
    console.log('Database seeded successfully!')
  } catch (error) {
    console.error('Error seeding database:', error)
  } finally {
    process.exit()
  }
}

seed()
