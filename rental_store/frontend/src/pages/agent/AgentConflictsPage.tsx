import { useAuth } from "../../hooks/useAuth";
import { useAgentConflicts } from "../../hooks/useConflicts";
import { PageHeader } from "../../components/layout/PageHeader";
import { ConflictCard } from "../../components/marketplace/ConflictCard";
import { Skeleton } from "../../components/common/Skeleton";
import { EmptyState } from "../../components/common/EmptyState";
import styles from "./AgentConflictsPage.module.css";

export default function AgentConflictsPage() {
  const { user } = useAuth();
  const { data, loading } = useAgentConflicts(user?.id ?? "");

  return (
    <div className={styles.wrap}>
      <PageHeader
        title="Conflicts"
        subtitle="Issues reported by students. Admins resolve them."
      />
      {loading ? (
        <Skeleton height={200} radius="var(--radius-lg)" />
      ) : data.length === 0 ? (
        <EmptyState
          title="No conflicts reported"
          description="Issues reported by students will show up here."
        />
      ) : (
        <div className={styles.grid}>
          {data.map((c) => (
            <ConflictCard key={c.id} conflict={c} />
          ))}
        </div>
      )}
    </div>
  );
}
