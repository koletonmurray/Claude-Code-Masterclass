"use client";

import { useMissions } from "@lib/hooks/use-missions";
import type { MissionMode } from "@lib/hooks/use-missions";
import MissionCard from "@/components/mission-card";
import SkeletonCard from "@/components/skeleton-card";
import styles from "./missions.module.css";

function MissionSection({
  title,
  mode,
  accent,
  emptyText,
}: {
  title: string;
  mode: MissionMode;
  accent: string;
  emptyText: string;
}) {
  const { missions, loading, error } = useMissions(mode);

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionAccent} style={{ background: accent }} />
        <h2 className={styles.sectionTitle}>{title}</h2>
        {!loading && <span className={styles.count}>{missions.length}</span>}
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <div
        className={styles.grid}
        aria-busy={loading}
        aria-label={loading ? `Loading ${title.toLowerCase()}` : undefined}
      >
        {loading && [0, 1, 2].map((i) => <SkeletonCard key={i} />)}
        {!loading && !error && missions.length === 0 && (
          <div className={styles.empty}>
            <span className={styles.emptyLabel}>{emptyText}</span>
          </div>
        )}
        {!loading &&
          !error &&
          missions.map((m) => (
            <MissionCard key={m.id} mission={m} mode={mode} />
          ))}
      </div>
    </section>
  );
}

export default function MissionsPage() {
  return (
    <main className={styles.page}>
      <header className={styles.pageHeader}>
        <p className={styles.pageTagline}>// Comand Center</p>
        <h1 className={styles.pageTitle}>Mission Control</h1>
      </header>

      <MissionSection
        title="Your Active Missions"
        mode="active"
        accent="linear-gradient(to bottom, var(--color-primary), var(--color-secondary))"
        emptyText="No active operations"
      />
      <MissionSection
        title="Resolved Missions"
        mode="completed"
        accent="linear-gradient(to bottom, #FCD34D, #F97316)"
        emptyText="No resolved operations"
      />
      <MissionSection
        title="Missions You've Assigned"
        mode="assigned"
        accent="linear-gradient(to bottom, var(--color-secondary), var(--color-primary))"
        emptyText="No assigned operations"
      />
      <MissionSection
        title="All Expired Missions"
        mode="expired"
        accent="linear-gradient(to bottom, #4B5563, #99A1AF)"
        emptyText="No expired operations"
      />
    </main>
  );
}
