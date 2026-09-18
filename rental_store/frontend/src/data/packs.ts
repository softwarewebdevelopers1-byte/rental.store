// products.ts
import type { Product } from "../types/marketplace";

export const mockProducts: Product[] = [
  {
    id: "pr-1",
    agentId: "u-ag-1",
    name: "Gas Cylinder 6kg",
    description: "Refillable 6kg cooking gas.",
    price: 1200,
    imageUrl: "https://picsum.photos/seed/gas/400/300",
    active: true,
  },
  {
    id: "pr-2",
    agentId: "u-ag-1",
    name: "Cooking Pot",
    description: "Durable aluminium cooking pot.",
    price: 850,
    imageUrl: "https://picsum.photos/seed/pot/400/300",
    active: true,
  },
  {
    id: "pr-3",
    agentId: "u-ag-1",
    name: "Plates (Set of 4)",
    description: "Ceramic plates set.",
    price: 400,
    imageUrl: "https://picsum.photos/seed/plates/400/300",
    active: true,
  },
  {
    id: "pr-4",
    agentId: "u-ag-1",
    name: "Bedsheet",
    description: "Cotton single bedsheet.",
    price: 700,
    imageUrl: "https://picsum.photos/seed/sheet/400/300",
    active: true,
  },
];

// packs.ts
import type { Pack } from "../types/marketplace";

export const mockPacks: Pack[] = [
  {
    id: "pk-1",
    agentId: "u-ag-1",
    name: "Cooking Pack",
    description: "Everything you need to start cooking.",
    items: [
      { productId: "pr-1", quantity: 1 },
      { productId: "pr-2", quantity: 1 },
      { productId: "pr-3", quantity: 1 },
    ],
    price: 2300,
    imageUrl: "https://picsum.photos/seed/cookpack/400/300",
    active: true,
  },
];
