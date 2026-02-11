import { prisma } from "../lib/db.js";

export async function getInvoiceService(invoiceNo: string, userId: string) {
  try {
    const invoice = await prisma.invoice.findFirst({
      where: { invoiceNo, userId },
      select: {
        id: true,
        invoiceNo: true,
        amount: true,
        status: true,
        createdAt: true,
        userId: true,
        refunds: {
          select: {
            id: true,
            amount: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    if (!invoice) return null;

    return invoice;
  } catch (error) {
    throw new Error(
      `Failed to fetch invoice ${invoiceNo}: ${(error as Error).message}`
    );
  }
}

export async function getRefundStatusService(invoiceNo: string, userId: string) {
  try {
    const invoice = await prisma.invoice.findFirst({
      where: { invoiceNo, userId },
      select: {
        userId: true,
        refunds: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            amount: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    if (!invoice) return null;

    if (invoice.refunds.length === 0) {
      return { status: "NO_REFUND_FOUND", userId: invoice.userId };
    }

    return {
      userId: invoice.userId,
      refunds: invoice.refunds,
    };
  } catch (error) {
    throw new Error(
      `Failed to fetch refund status for invoice ${invoiceNo}: ${
        (error as Error).message
      }`
    );
  }
}