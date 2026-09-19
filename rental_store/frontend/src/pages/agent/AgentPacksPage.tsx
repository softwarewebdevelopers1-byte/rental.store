import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { usePacks, useProducts } from "../../hooks/useMarketplace";
import { useToast } from "../../hooks/useToast";
import { marketplaceService } from "../../services/marketplaceService";
import { PageHeader } from "../../components/layout/PageHeader";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Modal } from "../../components/common/Modal";
import { Input } from "../../components/common/Input";
import { FileUpload } from "../../components/common/FileUpload";
import { PriceDisplay } from "../../components/common/PriceDisplay";
import { Skeleton } from "../../components/common/Skeleton";
import { EmptyState } from "../../components/common/EmptyState";
import type { PackItem } from "../../types/marketplace";
import styles from "./AgentProductsPage.module.css";

export default function AgentPacksPage() {
  const { user } = useAuth();
  const { show } = useToast();
  const {
    data: packs,
    loading,
    reload,
  } = usePacks({ agentId: user?.id, activeOnly: false });
  const { data: products } = useProducts({ activeOnly: false });
  const myProducts = products.filter((p) => p.agentId === user?.id);

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [items, setItems] = useState<PackItem[]>([]);
  const [submitting, setSubmitting] = useState(false);

  function toggleItem(pid: string) {
    setItems((prev) =>
      prev.find((i) => i.productId === pid)
        ? prev.filter((i) => i.productId !== pid)
        : [...prev, { productId: pid, quantity: 1 }],
    );
  }

  async function create() {
    if (!user) return;
    setSubmitting(true);
    try {
      await marketplaceService.createPack({
        agentId: user.id,
        name,
        description,
        price: Number(price),
        imageUrl,
        items,
        active: true,
      });
      show("Pack created.", "success");
      setOpen(false);
      setName("");
      setDescription("");
      setPrice("");
      setItems([]);
      await reload();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.wrap}>
      <PageHeader
        title="Packs"
        subtitle="Bundle products together."
        actions={<Button onClick={() => setOpen(true)}>+ New Pack</Button>}
      />
      {loading ? (
        <Skeleton height={200} radius="var(--radius-lg)" />
      ) : packs.length === 0 ? (
        <EmptyState
          title="No packs yet"
          description="Bundle products into a pack for a discount."
        />
      ) : (
        <div className={styles.grid}>
          {packs.map((p) => (
            <Card key={p.id} padding="none">
              <img src={p.imageUrl} alt="" className={styles.image} />
              <div className={styles.body}>
                <h3 className={styles.name}>{p.name}</h3>
                <p className={styles.description}>{p.description}</p>
                <PriceDisplay amount={p.price} />
                <div
                  style={{
                    fontSize: "var(--text-xs)",
                    color: "var(--color-text-muted)",
                    marginTop: "var(--space-2)",
                  }}
                >
                  {p.items.length} item{p.items.length === 1 ? "" : "s"}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={open}
        title="Create pack"
        onClose={() => setOpen(false)}
        size="lg"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={create}
              loading={submitting}
              disabled={!name || !price || items.length === 0}
            >
              Create pack
            </Button>
          </>
        }
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-4)",
          }}
        >
          <Input
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          <Input
            label="Price (KES)"
            type="number"
            min={0}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
          <FileUpload
            folder="packs"
            label="Pack image"
            value={imageUrl ? [imageUrl] : []}
            onChange={(urls) => setImageUrl(urls[0] ?? "")}
          />
          <div>
            <div
              style={{
                fontSize: "var(--text-sm)",
                fontWeight: 500,
                marginBottom: "var(--space-2)",
              }}
            >
              Products ({items.length} selected)
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-1)",
                maxHeight: 220,
                overflowY: "auto",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                padding: "var(--space-2)",
              }}
            >
              {myProducts.map((p) => (
                <label
                  key={p.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--space-2)",
                    fontSize: "var(--text-sm)",
                    padding: "var(--space-1)",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={!!items.find((i) => i.productId === p.id)}
                    onChange={() => toggleItem(p.id)}
                  />
                  {p.name} · <PriceDisplay amount={p.price} size="sm" />
                </label>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
