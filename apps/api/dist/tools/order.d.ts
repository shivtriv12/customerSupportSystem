export declare function getOrderDetailsService(orderNumber: string, userId: string): Promise<{
    id: string;
    createdAt: Date;
    userId: string;
    orderNumber: string;
    deliveryStatus: import("@prisma/client").$Enums.OrderStatus;
    item: string;
    totalAmount: number;
} | null>;
export declare function getDeliveryStatusService(orderNumber: string, userId: string): Promise<{
    userId: string;
    orderNumber: string;
    deliveryStatus: import("@prisma/client").$Enums.OrderStatus;
    item: string;
} | null>;
//# sourceMappingURL=order.d.ts.map