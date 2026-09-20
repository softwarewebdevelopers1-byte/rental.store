import { useRef, useState, type DragEvent } from "react";
import { uploadService, type UploadFolder } from "../../services/uploadService";
import { useToast } from "../../hooks/useToast";
import styles from "./FileUpload.module.css";

export interface FileUploadProps {
  label?: string;
  folder: UploadFolder;
  multiple?: boolean;
  accept?: string;
  maxSizeMb?: number;
  value: string[];
  onChange: (urls: string[]) => void;
  uploading?: boolean;
  onUploadingChange?: (v: boolean) => void;
}

export function FileUpload({
  label = "Upload files",
  folder,
  multiple = false,
  accept = "image/*",
  maxSizeMb = 10,
  value,
  onChange,
  uploading: controlledUploading,
  onUploadingChange,
}: FileUploadProps) {
  const { show } = useToast();
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isUploading =
    controlledUploading !== undefined ? controlledUploading : busy;

  function setBusyState(v: boolean) {
    setBusy(v);
    onUploadingChange?.(v);
  }

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setBusyState(true);
    setProgress("");
    try {
      const fileArray = Array.from(files).filter(
        (f) => f.size <= maxSizeMb * 1024 * 1024,
      );
      if (fileArray.length !== files.length) {
        show(`Some files exceeded ${maxSizeMb}MB and were skipped.`, "error");
      }
      const uploaded: string[] = [];
      for (let i = 0; i < fileArray.length; i++) {
        setProgress(`Uploading ${i + 1} of ${fileArray.length}...`);
        const url = await uploadService.upload(fileArray[i], folder);
        uploaded.push(url);
      }
      onChange([...value, ...uploaded]);
    } catch (e) {
      show(e instanceof Error ? e.message : "Upload failed", "error");
    } finally {
      setBusyState(false);
      setProgress("");
    }
  }

  async function remove(index: number) {
    const url = value[index];
    onChange(value.filter((_, i) => i !== index));
    try {
      await uploadService.remove(url);
    } catch (error) {
      show(error instanceof Error ? error.message : "Unable to remove file", "error");
    }
  }

  function isImage(url: string): boolean {
    return /\.(jpg|jpeg|png|webp|gif)(\?|$)/i.test(url);
  }

  function handleDragOver(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    if (!isUploading) setIsDragging(true);
  }

  function handleDragLeave(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    if (e.currentTarget === e.target) setIsDragging(false);
  }

  function handleDrop(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setIsDragging(false);
    if (!isUploading) void handleFiles(e.dataTransfer.files);
  }

  return (
    <div className={styles.wrap}>
      {label && <label className={styles.label}>{label}</label>}
      <label
        className={[
          styles.zone,
          isUploading ? styles.zoneDisabled : "",
          isDragging ? styles.zoneDragging : "",
        ].join(" ")}
        onClick={() => !isUploading && inputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        aria-disabled={isUploading}
      >
        <input
          ref={inputRef}
          type="file"
          className={styles.input}
          accept={accept}
          multiple={multiple}
          disabled={isUploading}
          onChange={(e) => {
            void handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <span className={styles.button}>
          {isUploading ? "Uploading..." : "Choose files or drop them here"}
        </span>
      </label>
      {progress && <span className={styles.progress}>{progress}</span>}
      {value.length > 0 && (
        <div className={styles.list}>
          {value.map((url, i) => (
            <div key={url + i} className={styles.item}>
              {isImage(url) ? (
                <img src={url} alt="" className={styles.thumb} />
              ) : (
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.link}
                >
                  {decodeURIComponent(url.split("/").pop()?.split(".").shift() ?? url)}
                </a>
              )}
              <button
                type="button"
                className={styles.remove}
                onClick={() => void remove(i)}
                disabled={isUploading}
                aria-label="Remove"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
