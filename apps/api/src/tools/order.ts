import { prisma } from "../lib/db.js";

export async function getOrderDetailsService(orderNumber: string, userId: string) {
  try {
    const order = await prisma.order.findFirst({
      where: { orderNumber, userId },
      select: {
        id: true,
        orderNumber: true,
        item: true,
        totalAmount: true,
        deliveryStatus: true,
        createdAt: true,
        userId: true,
      },
    });

    if (!order) return null;

    return order;
  } catch (error) {
    throw new Error(
      `Failed to fetch order ${orderNumber}: ${(error as Error).message}`
    );
  }
}

export async function getDeliveryStatusService(orderNumber: string, userId: string) {
  try {
    const order = await prisma.order.findFirst({
      where: { orderNumber, userId },
      select: {
        orderNumber: true,
        item: true,
        deliveryStatus: true,
        userId: true,
      },
    });

    if (!order) return null;

    return order;
  } catch (error) {
    throw new Error(
      `Failed to fetch delivery status for order ${orderNumber}: ${
        (error as Error).message
      }`
    );
  }
}