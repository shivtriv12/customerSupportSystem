export declare const MessageRole: {
    readonly USER: "USER";
    readonly AGENT: "AGENT";
    readonly SYSTEM: "SYSTEM";
};
export type MessageRole = (typeof MessageRole)[keyof typeof MessageRole];
export declare const AgentType: {
    readonly SUPPORT: "SUPPORT";
    readonly ORDER: "ORDER";
    readonly BILLING: "BILLING";
};
export type AgentType = (typeof AgentType)[keyof typeof AgentType];
export declare const OrderStatus: {
    readonly PROCESSING: "PROCESSING";
    readonly DISPATCHED: "DISPATCHED";
    readonly DELIVERED: "DELIVERED";
    readonly CANCELLED: "CANCELLED";
};
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];
export declare const InvoiceStatus: {
    readonly OPEN: "OPEN";
    readonly PAID: "PAID";
    readonly OVERDUE: "OVERDUE";
    readonly REFUNDED: "REFUNDED";
};
export type InvoiceStatus = (typeof InvoiceStatus)[keyof typeof InvoiceStatus];
export declare const RefundStatus: {
    readonly REQUESTED: "REQUESTED";
    readonly APPROVED: "APPROVED";
    readonly REJECTED: "REJECTED";
    readonly PROCESSED: "PROCESSED";
};
export type RefundStatus = (typeof RefundStatus)[keyof typeof RefundStatus];
//# sourceMappingURL=enums.d.ts.map