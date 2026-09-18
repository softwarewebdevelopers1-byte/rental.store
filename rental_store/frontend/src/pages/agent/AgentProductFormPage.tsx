import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import { marketplaceService } from "../../services/marketplaceService";
import { PageHeader } from "../../components/layout/PageHeader";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import styles from "./AgentProductFormPage.module.css";

export default function AgentProductFormPage() {
  const { user } = useAuth();
  const { productId } = useParams<{ productId?: string }>();
  const isEdit = !!productId;
  const navigate = useNavigate();
  const { show } = useToast();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState(
    "https://picsum.photos/seed/newproduct/400/300",
  );
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      const p = await marketplaceService.getProduct(productId!);
      if (p) {
        setName(p.name);
        setDescription(p.description);
        setPrice(String(p.price));
        setImageUrl(p.imageUrl);
      }
      setLoading(false);
    })();
  }, [isEdit, productId]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    try {
      if (isEdit) {
        await marketplaceService.updateProduct(productId!, {
          name,
          description,
          price: Number(price),
          imageUrl,
        });
        show("Product updated.", "success");
      } else {
        await marketplaceService.createProduct({
          agentId: user.id,
          name,
          description,
          price: Number(price),
          imageUrl,
          active: true,
        });
        show("Product created.", "success");
      }
      navigate("/agent/products");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return null;

  return (
    <div>
      <PageHeader title={isEdit ? "Edit product" : "New product"} />
      <Card>
        <form className={styles.form} onSubmit={onSubmit}>
          <Input
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <div className={styles.field}>
            <label className={styles.label}>Description</label>
            <textarea
              className={styles.textarea}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              required
            />
          </div>
          <Input
            label="Price (KES)"
            type="number"
            min={0}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
          <Input
            label="Image URL"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            required
          />
          <div className={styles.actions}>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate("/agent/products")}
            >
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              {isEdit ? "Save changes" : "Create product"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
