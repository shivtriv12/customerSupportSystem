/*
  Created with help of AI
*/
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient, MessageRole, OrderStatus, InvoiceStatus, RefundStatus, AgentType } from '../src/generated/prisma/client.js'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({adapter})

async function main() {
  console.log('🌱 Starting seed...')

  // 1. Clean up existing data (Optional but good for re-running)
  await prisma.message.deleteMany()
  await prisma.conversation.deleteMany()
  await prisma.refund.deleteMany()
  await prisma.invoice.deleteMany()
  await prisma.order.deleteMany()
  await prisma.user.deleteMany()

  // 2. Create Users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'alice@example.com',
        name: 'Alice Johnson',
      }
    }),
    prisma.user.create({
      data: {
        email: 'bob@example.com',
        name: 'Bob Smith',
      }
    }),
    prisma.user.create({
      data: {
        email: 'charlie@example.com',
        name: 'Charlie Davis',
      }
    }),
    prisma.user.create({
      data: {
        email: 'diana@example.com',
        name: 'Diana Prince',
      }
    }),
    prisma.user.create({
      data: {
        email: 'evan@example.com',
        name: 'Evan Wright',
      }
    })
  ])

  console.log(`👤 Created ${users.length} users`)

  // 3. Create Orders (Mix of statuses)
  const orders = [
    { userId: users[0].id, orderNumber: 'ORD-001', item: 'Wireless Headphones', totalAmount: 199.99, deliveryStatus: OrderStatus.DELIVERED },
    { userId: users[0].id, orderNumber: 'ORD-002', item: 'USB-C Cable', totalAmount: 19.99, deliveryStatus: OrderStatus.PROCESSING },
    { userId: users[1].id, orderNumber: 'ORD-003', item: 'Gaming Mouse', totalAmount: 59.99, deliveryStatus: OrderStatus.DISPATCHED },
    { userId: users[2].id, orderNumber: 'ORD-004', item: 'Mechanical Keyboard', totalAmount: 129.99, deliveryStatus: OrderStatus.CANCELLED },
    { userId: users[3].id, orderNumber: 'ORD-005', item: 'Monitor Stand', totalAmount: 45.00, deliveryStatus: OrderStatus.DELIVERED },
    { userId: users[4].id, orderNumber: 'ORD-006', item: 'Webcam 4K', totalAmount: 89.99, deliveryStatus: OrderStatus.PROCESSING },
  ]

  for (const order of orders) {
    await prisma.order.create({ data: order })
  }
  console.log(`📦 Created ${orders.length} orders`)

  // 4. Create Invoices
  const invoices = [
    { userId: users[0].id, invoiceNo: 'INV-1001', amount: 199.99, status: InvoiceStatus.PAID },
    { userId: users[0].id, invoiceNo: 'INV-1002', amount: 19.99, status: InvoiceStatus.OPEN }, // Alice hasn't paid this yet
    { userId: users[1].id, invoiceNo: 'INV-1003', amount: 59.99, status: InvoiceStatus.PAID },
    { userId: users[2].id, invoiceNo: 'INV-1004', amount: 129.99, status: InvoiceStatus.REFUNDED },
    { userId: users[3].id, invoiceNo: 'INV-1005', amount: 45.00, status: InvoiceStatus.OVERDUE },
    { userId: users[4].id, invoiceNo: 'INV-1006', amount: 89.99, status: InvoiceStatus.PAID },
  ]

  // We need to store created invoices to link refunds later
  const createdInvoices = []
  for (const inv of invoices) {
    const created = await prisma.invoice.create({ data: inv })
    createdInvoices.push(created)
  }
  console.log(`🧾 Created ${invoices.length} invoices`)

  // 5. Create Refunds (Only for refunded invoices)
  // Linking to the invoice for user[2] (Charlie) which is REFUNDED
  const refundedInvoice = createdInvoices.find(i => i.status === InvoiceStatus.REFUNDED)
  
  if (refundedInvoice) {
    await prisma.refund.create({
      data: {
        userId: refundedInvoice.userId,
        invoiceId: refundedInvoice.id,
        amount: refundedInvoice.amount,
        status: RefundStatus.PROCESSED
      }
    })
    
    // Create another pending refund request
    await prisma.refund.create({
      data: {
        userId: users[0].id,
        invoiceId: createdInvoices[0].id, // Alice asks for refund on paid item
        amount: 50.00, // Partial refund
        status: RefundStatus.REQUESTED
      }
    })
  }
  console.log(`💸 Created 2 refunds`)

  // 6. Create Conversations & Messages
  const conversation = await prisma.conversation.create({
    data: {
      userId: users[0].id,
      title: "Order Issue",
    }
  })

  await prisma.message.createMany({
    data: [
      {
        conversationId: conversation.id,
        role: MessageRole.USER,
        content: "Where is my order ORD-002?",
        userId: users[0].id
      },
      {
        conversationId: conversation.id,
        role: MessageRole.SYSTEM, // Or AGENT
        content: "Let me check that for you.",
        agentType: AgentType.ORDER
      },
      {
        conversationId: conversation.id,
        role: MessageRole.AGENT,
        content: "Your order ORD-002 contains a USB-C Cable. It is currently PROCESSING and should ship soon.",
        agentType: AgentType.ORDER
      }
    ]
  })
  console.log(`💬 Created 1 conversation with 3 messages`)

  console.log('✅ Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })