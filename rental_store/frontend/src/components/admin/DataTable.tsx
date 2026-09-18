import { useMemo, useState, type ReactNode } from "react";
import { SearchBar } from "../common/SearchBar";
import { Select, type SelectOption } from "../common/Select";
import { EmptyState } from "../common/EmptyState";
import { LoadingSpinner } from "../common/LoadingSpinner";
import styles from "./DataTable.module.css";

export interface Column<T> {
  key: string;
  label: string;
  render: (row: T) => ReactNode;
  width?: string;
  hideOnMobile?: boolean;
}

export interface FilterOption {
  id: string;
  label: string;
  options: SelectOption[];
  value: string;
  onChange: (v: string) => void;
}

interface DataTableProps<T> {
  rows: T[];
  columns: Column<T>[];
  keyFor: (row: T) => string;
  loading?: boolean;
  search?: string;
  onSearchChange?: (v: string) => void;
  searchPlaceholder?: string;
  filters?: FilterOption[];
  pageSize?: number;
  emptyTitle?: string;
  emptyDescription?: string;
  actions?: (row: T) => ReactNode;
}

export function DataTable<T>({
  rows,
  columns,
  keyFor,
  loading = false,
  search,
  onSearchChange,
  searchPlaceholder = "Search...",
  filters = [],
  pageSize = 10,
  emptyTitle = "No results",
  emptyDescription = "Try adjusting your search or filters.",
  actions,
}: DataTableProps<T>) {
  const [page, setPage] = useState(1);

  const total = rows.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const paged = useMemo(
    () => rows.slice((page - 1) * pageSize, page * pageSize),
    [rows, page, pageSize],
  );

  const goto = (p: number) => setPage(Math.min(Math.max(1, p), totalPages));

  return (
    <div className={styles.wrap}>
      <div className={styles.toolbar}>
        {onSearchChange && (
          <div className={styles.search}>
            <SearchBar
              value={search ?? ""}
              onChange={onSearchChange}
              placeholder={searchPlaceholder}
            />
          </div>
        )}
        {filters.length > 0 && (
          <div className={styles.filters}>
            {filters.map((f) => (
              <Select
                key={f.id}
                label={f.label}
                value={f.value}
                onChange={(e) => {
                  setPage(1);
                  f.onChange(e.target.value);
                }}
                options={f.options}
              />
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <LoadingSpinner label="Loading..." />
      ) : total === 0 ? (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      ) : (
        <>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  {columns.map((c) => (
                    <th
                      key={c.key}
                      className={c.hideOnMobile ? styles.hideMobile : undefined}
                      style={c.width ? { width: c.width } : undefined}
                    >
                      {c.label}
                    </th>
                  ))}
                  {actions && <th aria-label="Actions" />}
                </tr>
              </thead>
              <tbody>
                {paged.map((row) => (
                  <tr key={keyFor(row)}>
                    {columns.map((c) => (
                      <td
                        key={c.key}
                        className={
                          c.hideOnMobile ? styles.hideMobile : undefined
                        }
                      >
                        {c.render(row)}
                      </td>
                    ))}
                    {actions && (
                      <td className={styles.actionsCell}>{actions(row)}</td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <span className={styles.pageInfo}>
                Page {page} of {totalPages} · {total} total
              </span>
              <div className={styles.pageButtons}>
                <button
                  className={styles.pageBtn}
                  onClick={() => goto(1)}
                  disabled={page === 1}
                >
                  «
                </button>
                <button
                  className={styles.pageBtn}
                  onClick={() => goto(page - 1)}
                  disabled={page === 1}
                >
                  ‹
                </button>
                <button
                  className={styles.pageBtn}
                  onClick={() => goto(page + 1)}
                  disabled={page === totalPages}
                >
                  ›
                </button>
                <button
                  className={styles.pageBtn}
                  onClick={() => goto(totalPages)}
                  disabled={page === totalPages}
                >
                  »
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
