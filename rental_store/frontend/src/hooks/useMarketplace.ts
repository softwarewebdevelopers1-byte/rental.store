import { useCallback, useEffect, useState } from "react";
import {
  marketplaceService,
  type MarketplaceQuery,
} from "../services/marketplaceService";
import type { Pack, Product } from "../types/marketplace";

export function useProducts(query: MarketplaceQuery = {}) {
  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await marketplaceService.listProducts(query));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(query)]);

  useEffect(() => {
    void reload();
  }, [reload]);
  return { data, loading, error, reload };
}

export function usePacks(query: MarketplaceQuery = {}) {
  const [data, setData] = useState<Pack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await marketplaceService.listPacks(query));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load packs");
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(query)]);

  useEffect(() => {
    void reload();
  }, [reload]);
  return { data, loading, error, reload };
}

export function useProduct(id: string) {
  const [data, setData] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      setData(await marketplaceService.getProduct(id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load product");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void reload();
  }, [reload]);
  return { data, loading, error, reload };
}

export function usePack(id: string) {
  const [data, setData] = useState<Pack | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      setData(await marketplaceService.getPack(id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load pack");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void reload();
  }, [reload]);
  return { data, loading, error, reload };
}
