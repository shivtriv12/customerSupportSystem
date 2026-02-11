export declare function getInvoiceService(invoiceNo: string, userId: string): Promise<{
    id: string;
    status: import("@prisma/client").$Enums.InvoiceStatus;
    createdAt: Date;
    userId: string;
    invoiceNo: string;
    amount: number;
    refunds: {
        id: string;
        status: import("@prisma/client").$Enums.RefundStatus;
        createdAt: Date;
        amount: number;
    }[];
} | null>;
export declare function getRefundStatusService(invoiceNo: string, userId: string): Promise<{
    status: string;
    userId: string;
    refunds?: undefined;
} | {
    userId: string;
    refunds: {
        id: string;
        status: import("@prisma/client").$Enums.RefundStatus;
        createdAt: Date;
        amount: number;
    }[];
    status?: undefined;
} | null>;
//# sourceMappingURL=billing.d.ts.map