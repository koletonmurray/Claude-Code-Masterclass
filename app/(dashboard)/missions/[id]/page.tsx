"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import dayjs from "dayjs";
import { useUser } from "@/contexts/auth-context";
import { useMission } from "@lib/hooks/use-mission";
import { updateMissionStatus } from "@lib/firebase/firestore";
import DeadlineCountdown from "@/components/deadline-countdown";
import type { FinalStatus } from "@lib/types/mission";
import styles from "./mission-detail.module.css";

function formatDeadline(seconds: number): string {
  return dayjs.unix(seconds).format("MMM D, YYYY [at] h:mm A");
}

export default function MissionDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { user } = useUser();
  const { mission, loading, error, notFound } = useMission(id);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleMarkOutcome(status: FinalStatus) {
    setSubmitting(true);
    setSubmitError(null);
    try {
      await updateMissionStatus(id, status);
    } catch (err) {
      setSubmitError((err as Error).message ?? "Failed to update status.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main
        className={styles.page}
        aria-busy="true"
        aria-label="Loading mission details"
      >
        <div className={styles.skeletonHeader} />
        <div className={styles.skeletonCardTall} />
        <div className={styles.skeletonCard} />
        <div className={styles.skeletonCard} />
      </main>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <p className={styles.error}>{error}</p>
        <Link href="/missions" className={styles.backLink}>
          ← Mission Control
        </Link>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className={styles.page}>
        <div className={styles.notFound}>
          <span className={styles.notFoundLabel}>Mission Not Found</span>
          <Link href="/missions" className={styles.backLink}>
            ← Mission Control
          </Link>
        </div>
      </div>
    );
  }

  if (!mission) return null;

  const deadlineSecs = mission.deadline.seconds;
  const deadlineFormatted = formatDeadline(deadlineSecs);
  const isOverdue = dayjs.unix(deadlineSecs).isBefore(dayjs());
  const canMarkOutcome =
    (user?.uid === mission.createdBy || user?.uid === mission.assignedTo) &&
    mission.finalStatus === null;

  const statusBadgeClass =
    mission.finalStatus === "success"
      ? styles.badgeSuccess
      : mission.finalStatus === "failure"
        ? styles.badgeFailure
        : isOverdue
          ? styles.badgeExpired
          : styles.badgeInProgress;

  const statusLabel =
    mission.finalStatus === "success"
      ? "Mission Success"
      : mission.finalStatus === "failure"
        ? "Mission Failed"
        : isOverdue
          ? "Expired"
          : "In Progress";

  return (
    <main className={styles.page}>
      <div className={styles.backRow}>
        <Link href="/missions" className={styles.backLink}>
          ← Mission Control
        </Link>
      </div>

      <header
        className={`${styles.header} ${styles.fadeUp}`}
        style={{ animationDelay: "0ms" }}
      >
        <div className={styles.headerBadge}>
          <DeadlineCountdown seconds={deadlineSecs} />
        </div>
        <p className={styles.tagline}>Mission Briefing</p>
        <h1 className={styles.pageTitle}>{mission.title}</h1>
        <div className={`${styles.corner} ${styles.tl}`} />
        <div className={`${styles.corner} ${styles.tr}`} />
        <div className={`${styles.corner} ${styles.bl}`} />
        <div className={`${styles.corner} ${styles.br}`} />
      </header>

      <div
        className={`${styles.card} ${styles.fadeUp}`}
        style={{ animationDelay: "80ms" }}
      >
        <div className={styles.cardAccent} />
        <p className={styles.cardLabel}>Briefing</p>
        <p className={styles.cardBody}>{mission.description}</p>
      </div>

      <div
        className={`${styles.card} ${styles.fadeUp}`}
        style={{ animationDelay: "160ms" }}
      >
        <div className={styles.cardAccent} />
        <p className={styles.cardLabel}>Intel</p>
        <div className={styles.intelGrid}>
          <div className={styles.intelItem}>
            <span className={styles.intelLabel}>Created by</span>
            <span className={styles.intelValue}>
              {mission.createdByCodename}
              {mission.createdBy === user?.uid ? " (me)" : ""}
            </span>
          </div>
          <div className={styles.intelItem}>
            <span className={styles.intelLabel}>Assigned to</span>
            <span className={styles.intelValue}>
              {mission.assignedToCodename}
              {mission.assignedTo === user?.uid ? " (me)" : ""}
            </span>
          </div>
          <div className={styles.intelItem}>
            <span className={styles.intelLabel}>Deadline</span>
            <span className={styles.intelValue}>{deadlineFormatted}</span>
          </div>
        </div>
      </div>

      <div
        className={`${styles.card} ${styles.fadeUp}`}
        style={{ animationDelay: "240ms" }}
      >
        <div className={styles.cardAccent} />
        <p className={styles.cardLabel}>Mission Status</p>
        <span className={`${styles.statusBadge} ${statusBadgeClass}`}>
          {statusLabel}
        </span>
      </div>

      {canMarkOutcome && (
        <div
          className={`${styles.actions} ${styles.fadeUp}`}
          style={{ animationDelay: "320ms" }}
        >
          <p className={styles.actionsLabel}>Mark Outcome</p>
          <div className={styles.actionButtons}>
            <button
              className={styles.btnSuccess}
              disabled={submitting}
              onClick={() => handleMarkOutcome("success")}
            >
              {submitting ? "Updating…" : "Mark as Success"}
            </button>
            <button
              className={styles.btnFailure}
              disabled={submitting}
              onClick={() => handleMarkOutcome("failure")}
            >
              {submitting ? "Updating…" : "Mark as Failed"}
            </button>
          </div>
          {submitError && (
            <p className={styles.actionError} role="alert">
              {submitError}
            </p>
          )}
        </div>
      )}
    </main>
  );
}
