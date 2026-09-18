import { mockProducts, mockPacks } from "../data/products";
import type { Pack, Product } from "../types/marketplace";
import { delay } from "../utils/delay";
import { generateId } from "../utils/idGenerator";

export interface MarketplaceQuery {
  q?: string;
  agentId?: string;
  activeOnly?: boolean;
}

export const marketplaceService = {
  async listProducts(q: MarketplaceQuery = {}): Promise<Product[]> {
    let items = [...mockProducts];
    if (q.activeOnly !== false) items = items.filter((p) => p.active);
    if (q.agentId) items = items.filter((p) => p.agentId === q.agentId);
    if (q.q) {
      const needle = q.q.toLowerCase();
      items = items.filter(
        (p) =>
          p.name.toLowerCase().includes(needle) ||
          p.description.toLowerCase().includes(needle),
      );
    }
    return delay(items);
  },

  async getProduct(id: string): Promise<Product | null> {
    return delay(mockProducts.find((p) => p.id === id) ?? null);
  },

  async createProduct(input: Omit<Product, "id">): Promise<Product> {
    const product: Product = { ...input, id: generateId("pr") };
    mockProducts.push(product);
    return delay(product);
  },

  async updateProduct(
    id: string,
    patch: Partial<Product>,
  ): Promise<Product | null> {
    const idx = mockProducts.findIndex((p) => p.id === id);
    if (idx < 0) return delay(null);
    mockProducts[idx] = { ...mockProducts[idx], ...patch };
    return delay(mockProducts[idx]);
  },

  async removeProduct(id: string): Promise<boolean> {
    const idx = mockProducts.findIndex((p) => p.id === id);
    if (idx < 0) return delay(false);
    mockProducts[idx].active = false;
    return delay(true);
  },

  async listPacks(q: MarketplaceQuery = {}): Promise<Pack[]> {
    let items = [...mockPacks];
    if (q.activeOnly !== false) items = items.filter((p) => p.active);
    if (q.agentId) items = items.filter((p) => p.agentId === q.agentId);
    if (q.q) {
      const needle = q.q.toLowerCase();
      items = items.filter(
        (p) =>
          p.name.toLowerCase().includes(needle) ||
          p.description.toLowerCase().includes(needle),
      );
    }
    return delay(items);
  },

  async getPack(id: string): Promise<Pack | null> {
    return delay(mockPacks.find((p) => p.id === id) ?? null);
  },

  async createPack(input: Omit<Pack, "id">): Promise<Pack> {
    const pack: Pack = { ...input, id: generateId("pk") };
    mockPacks.push(pack);
    return delay(pack);
  },

  async updatePack(id: string, patch: Partial<Pack>): Promise<Pack | null> {
    const idx = mockPacks.findIndex((p) => p.id === id);
    if (idx < 0) return delay(null);
    mockPacks[idx] = { ...mockPacks[idx], ...patch };
    return delay(mockPacks[idx]);
  },

  async removePack(id: string): Promise<boolean> {
    const idx = mockPacks.findIndex((p) => p.id === id);
    if (idx < 0) return delay(false);
    mockPacks[idx].active = false;
    return delay(true);
  },
};
