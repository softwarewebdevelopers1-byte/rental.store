import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useProducts } from "../../hooks/useMarketplace";
import { useToast } from "../../hooks/useToast";
import { marketplaceService } from "../../services/marketplaceService";
import { PageHeader } from "../../components/layout/PageHeader";
import { Button } from "../../components/common/Button";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { PriceDisplay } from "../../components/common/PriceDisplay";
import { Skeleton } from "../../components/common/Skeleton";
import { EmptyState } from "../../components/common/EmptyState";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import type { Product } from "../../types/marketplace";
import styles from "./AgentProductsPage.module.css";

export default function AgentProductsPage() {
  const { user } = useAuth();
  const { show } = useToast();
  const { data, loading, reload } = useProducts({
    agentId: user?.id,
    activeOnly: false,
  });
  const [toDelete, setToDelete] = useState<Product | null>(null);

  async function confirmDelete() {
    if (!toDelete) return;
    await marketplaceService.removeProduct(toDelete.id);
    show("Product deactivated.", "success");
    setToDelete(null);
    await reload();
  }

  return (
    <div className={styles.wrap}>
      <PageHeader
        title="Products"
        subtitle="Your marketplace products."
        actions={
          <Link to="/agent/products/create">
            <Button>+ New Product</Button>
          </Link>
        }
      />
      {loading ? (
        <Skeleton height={200} radius="var(--radius-lg)" />
      ) : data.length === 0 ? (
        <EmptyState
          title="No products yet"
          description="Add your first product to sell it in the marketplace."
          action={
            <Link to="/agent/products/create">
              <Button>Create product</Button>
            </Link>
          }
        />
      ) : (
        <div className={styles.grid}>
          {data.map((p) => (
            <Card key={p.id} padding="none">
              <img src={p.imageUrl} alt="" className={styles.image} />
              <div className={styles.body}>
                <div className={styles.head}>
                  <h3 className={styles.name}>{p.name}</h3>
                  <Badge tone={p.active ? "success" : "neutral"}>
                    {p.active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <p className={styles.description}>{p.description}</p>
                <PriceDisplay amount={p.price} />
                <div className={styles.actions}>
                  <Link to={`/agent/products/${p.id}/edit`}>
                    <Button size="sm" variant="secondary">
                      Edit
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => setToDelete(p)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!toDelete}
        title="Delete product?"
        message={`${toDelete?.name} will be deactivated and hidden from the marketplace.`}
        confirmLabel="Delete"
        tone="danger"
        onCancel={() => setToDelete(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
