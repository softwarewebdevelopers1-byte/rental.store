import { useEffect, useState } from "react";
import { useDebounce } from "../../hooks/useDebounce";
import styles from "./SearchBar.module.css";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  delayMs?: number;
}

export function SearchBar({
  value,
  onChange,
  placeholder = "Search...",
  delayMs = 250,
}: SearchBarProps) {
  const [local, setLocal] = useState(value);
  const debounced = useDebounce(local, delayMs);

  useEffect(() => {
    onChange(debounced);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  useEffect(() => {
    setLocal(value);
  }, [value]);

  return (
    <div className={styles.wrap}>
      <span className={styles.icon} aria-hidden>
        🔍
      </span>
      <input
        className={styles.input}
        type="search"
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
      />
    </div>
  );
}
