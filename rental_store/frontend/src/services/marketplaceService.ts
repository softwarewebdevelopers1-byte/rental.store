import { http } from "./apiClient";
import type { Pack, Product } from "../types/marketplace";

export interface MarketplaceQuery {
  q?: string;
  agentId?: string;
  activeOnly?: boolean;
}

interface Page<T> {
  content: T[];
}

interface ProductResponse {
  id: string;
  agentId: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  active: boolean;
}

interface PackItemResponse {
  productId: string;
  quantity: number;
}

interface PackResponse {
  id: string;
  agentId: string;
  name: string;
  description: string | null;
  items: PackItemResponse[];
  price: number;
  imageUrl: string | null;
  active: boolean;
}

function toProduct(raw: ProductResponse): Product {
  return {
    id: raw.id,
    agentId: raw.agentId,
    name: raw.name,
    description: raw.description ?? "",
    price: raw.price,
    imageUrl: raw.imageUrl ?? "",
    active: raw.active,
  };
}

function toPack(raw: PackResponse): Pack {
  return {
    id: raw.id,
    agentId: raw.agentId,
    name: raw.name,
    description: raw.description ?? "",
    items: raw.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    })),
    price: raw.price,
    imageUrl: raw.imageUrl ?? "",
    active: raw.active,
  };
}

function params(query: MarketplaceQuery): string {
  return query.q ? `?q=${encodeURIComponent(query.q)}` : "";
}

export const marketplaceService = {
  async listProducts(query: MarketplaceQuery = {}): Promise<Product[]> {
    const path = query.agentId ? "/agents/me/products" : "/marketplace/products";
    const page = await http.get<Page<ProductResponse>>(`${path}${params(query)}`);
    return page.content
      .map(toProduct)
      .filter((product) => query.agentId === undefined || product.agentId === query.agentId)
      .filter((product) => query.activeOnly === false || product.active);
  },

  async getProduct(id: string): Promise<Product | null> {
    return toProduct(await http.get<ProductResponse>(`/marketplace/products/${id}`));
  },

  async createProduct(input: Omit<Product, "id">): Promise<Product> {
    const raw = await http.post<ProductResponse>("/agents/me/products", {
      name: input.name,
      description: input.description,
      price: input.price,
      imageUrl: input.imageUrl,
    });
    return toProduct(raw);
  },

  async updateProduct(id: string, patch: Partial<Product>): Promise<Product | null> {
    const raw = await http.patch<ProductResponse>(`/agents/me/products/${id}`, patch);
    return toProduct(raw);
  },

  async removeProduct(id: string): Promise<boolean> {
    await http.delete<void>(`/agents/me/products/${id}`);
    return true;
  },

  async listPacks(query: MarketplaceQuery = {}): Promise<Pack[]> {
    const path = query.agentId ? "/agents/me/packs" : "/marketplace/packs";
    const page = await http.get<Page<PackResponse>>(`${path}${params(query)}`);
    return page.content
      .map(toPack)
      .filter((pack) => query.agentId === undefined || pack.agentId === query.agentId)
      .filter((pack) => query.activeOnly === false || pack.active);
  },

  async getPack(id: string): Promise<Pack | null> {
    return toPack(await http.get<PackResponse>(`/marketplace/packs/${id}`));
  },

  async createPack(input: Omit<Pack, "id">): Promise<Pack> {
    const raw = await http.post<PackResponse>("/agents/me/packs", {
      name: input.name,
      description: input.description,
      price: input.price,
      imageUrl: input.imageUrl,
      items: input.items,
    });
    return toPack(raw);
  },

  async updatePack(id: string, patch: Partial<Pack>): Promise<Pack | null> {
    const raw = await http.patch<PackResponse>(`/agents/me/packs/${id}`, patch);
    return toPack(raw);
  },

  async removePack(id: string): Promise<boolean> {
    await http.delete<void>(`/agents/me/packs/${id}`);
    return true;
  },
};
