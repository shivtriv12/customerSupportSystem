import { prisma } from "../lib/db.js"

// get invoice+refund
export async function getInvoiceService(invoiceNo: string) {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { invoiceNo },
      include: { refunds: true }
    })

    if (!invoice) return null

    return {
      id: invoice.id,
      invoiceNo: invoice.invoiceNo,
      amount: invoice.amount,
      status: invoice.status,
      createdAt: invoice.createdAt,
      refunds: invoice.refunds.map(r => ({
        id: r.id,
        amount: r.amount,
        status: r.status,
        createdAt: r.createdAt
      }))
    }
  } catch (error) {
    throw new Error(`Failed to fetch invoice ${invoiceNo}: ${(error as Error).message}`)
  }
}

// get only refund
export async function getRefundStatusService(invoiceNo: string) {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { invoiceNo },
      include: {
        refunds: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!invoice) return null

    if (invoice.refunds.length === 0) {
      return { status: 'NO_REFUND_FOUND' }
    }

    return invoice.refunds.map(r => ({
      id: r.id,
      amount: r.amount,
      status: r.status,
      createdAt: r.createdAt
    }))
  } catch (error) {
    throw new Error(`Failed to fetch refund status for invoice ${invoiceNo}: ${(error as Error).message}`)
  }
}