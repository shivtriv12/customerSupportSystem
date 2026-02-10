import { prisma } from "../lib/db.js"

// get full order details
export async function getOrderDetailsService(orderNumber: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { orderNumber }
    })

    if (!order) return null

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      item: order.item,
      totalAmount: order.totalAmount,
      deliveryStatus: order.deliveryStatus,
      createdAt: order.createdAt
    }
  } catch (error) {
    throw new Error(`Failed to fetch order ${orderNumber}: ${(error as Error).message}`)
  }
}

// get delivery status only
export async function getDeliveryStatusService(orderNumber: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      select: {
        orderNumber: true,
        item: true,
        deliveryStatus: true
      }
    })

    if (!order) return null

    return {
      orderNumber: order.orderNumber,
      item: order.item,
      deliveryStatus: order.deliveryStatus
    }
  } catch (error) {
    throw new Error(`Failed to fetch delivery status for order ${orderNumber}: ${(error as Error).message}`)
  }
}