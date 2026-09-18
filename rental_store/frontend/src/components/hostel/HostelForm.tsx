import { useState, type FormEvent } from "react";
import { Button } from "../common/Button";
import { Input } from "../common/Input";
import styles from "./HostelForm.module.css";

export interface HostelFormValues {
  name: string;
  code: string;
  location: string;
  description: string;
  images: string[];
}

interface HostelFormProps {
  initial?: Partial<HostelFormValues>;
  submitting?: boolean;
  submitLabel?: string;
  onSubmit: (values: HostelFormValues) => void;
  onCancel?: () => void;
}

export function HostelForm({
  initial,
  submitting = false,
  submitLabel = "Save",
  onSubmit,
  onCancel,
}: HostelFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [code, setCode] = useState(initial?.code ?? "");
  const [location, setLocation] = useState(initial?.location ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [images, setImages] = useState<string>(
    (initial?.images ?? []).join("\n"),
  );

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSubmit({
      name: name.trim(),
      code: code.trim().toUpperCase(),
      location: location.trim(),
      description: description.trim(),
      images: images
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
    });
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <Input
        label="Hostel name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <Input
        label="Hostel code"
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        hint="Students will use this code to register."
        required
      />
      <Input
        label="Location"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        required
      />
      <div className={styles.field}>
        <label className={styles.label}>Description (optional)</label>
        <textarea
          className={styles.textarea}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </div>
      <div className={styles.field}>
        <label className={styles.label}>Image URLs (one per line)</label>
        <textarea
          className={styles.textarea}
          value={images}
          onChange={(e) => setImages(e.target.value)}
          rows={3}
          placeholder="https://..."
        />
        <span className={styles.hint}>
          Upload isn't enabled in the prototype — paste image URLs.
        </span>
      </div>
      <div className={styles.actions}>
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={submitting}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={!name || !code || !location}
          loading={submitting}
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
