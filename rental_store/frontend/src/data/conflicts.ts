// orders.ts
import type { Order } from "../types/order";

export const mockOrders: Order[] = [
  {
    id: "o-1",
    studentId: "u-stu-1",
    agentId: "u-ag-1",
    items: [
      {
        kind: "PRODUCT",
        refId: "pr-1",
        name: "Gas Cylinder 6kg",
        unitPrice: 1200,
        quantity: 1,
      },
      {
        kind: "PRODUCT",
        refId: "pr-2",
        name: "Cooking Pot",
        unitPrice: 850,
        quantity: 1,
      },
    ],
    total: 2050,
    status: "OUT_FOR_DELIVERY",
    createdAt: "2024-03-18T10:00:00Z",
    updatedAt: "2024-03-20T09:00:00Z",
    timeline: [
      { status: "PENDING_PAYMENT", at: "2024-03-18T10:00:00Z" },
      { status: "PAID", at: "2024-03-18T10:05:00Z" },
      { status: "PREPARING", at: "2024-03-18T11:00:00Z" },
      { status: "READY", at: "2024-03-19T08:00:00Z" },
      { status: "OUT_FOR_DELIVERY", at: "2024-03-20T09:00:00Z" },
    ],
  },
];

// conflicts.ts
import type { Conflict } from "../types/conflict";

export const mockConflicts: Conflict[] = [
  {
    id: "cf-1",
    orderId: "o-1",
    studentId: "u-stu-1",
    agentId: "u-ag-1",
    issue: "DAMAGED_ITEM",
    description: "Cooking pot arrived dented.",
    status: "OPEN",
    createdAt: "2024-03-21T08:00:00Z",
  },
];
