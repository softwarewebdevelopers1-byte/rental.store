export interface Product {
  id: string;
  agentId: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  active: boolean;
}

export interface PackItem {
  productId: string;
  quantity: number;
}

export interface Pack {
  id: string;
  agentId: string;
  name: string;
  description: string;
  items: PackItem[];
  price: number;
  imageUrl: string;
  active: boolean;
}

export interface CartItem {
  kind: "PRODUCT" | "PACK";
  refId: string;
  quantity: number;
}
