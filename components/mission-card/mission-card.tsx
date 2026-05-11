"use client";

import Link from "next/link";
import dayjs from "dayjs";
import { useUser } from "@/contexts/auth-context";
import DeadlineCountdown from "@/components/deadline-countdown";
import type { MissionMode } from "@lib/hooks/use-missions";
import type { Mission } from "@lib/types/mission";
import styles from "./mission-card.module.css";

function statusInfo(mission: Mission): { label: string; className: string } {
  if (mission.finalStatus === "success")
    return { label: "Success", className: styles.badgeSuccess };
  if (mission.finalStatus === "failure")
    return { label: "Failed", className: styles.badgeFailure };
  if (dayjs().isAfter(dayjs.unix(mission.deadline.seconds)))
    return { label: "Expired", className: styles.badgeExpired };
  return { label: "In Progress", className: styles.badgeInProgress };
}

interface MissionCardProps {
  mission: Mission;
  mode: MissionMode;
}

export default function MissionCard({ mission, mode }: MissionCardProps) {
  const { user } = useUser();
  const status = statusInfo(mission);
  const isActive =
    (mode === "active" || mode === "assigned") && mission.finalStatus === null;
  const date = dayjs.unix(mission.deadline.seconds).format("MMM D, YYYY");

  return (
    <Link
      href={`/missions/${mission.id}`}
      className={styles.card}
      aria-label={`View mission: ${mission.title}`}
    >
      <div className={styles.cardTop}>
        <span className={status.className}>{status.label}</span>
        {isActive ? (
          <DeadlineCountdown seconds={mission.deadline.seconds} />
        ) : (
          <span className={styles.cardDate}>{date}</span>
        )}
      </div>

      <p className={styles.cardTitle}>{mission.title}</p>
      <p className={styles.cardDesc}>{mission.description}</p>

      <div className={styles.cardMeta}>
        {(mode === "active" || mode === "completed") && (
          <>
            <span className={styles.metaLabel}>Assigned by</span>
            <span className={styles.metaValue}>
              {mission.createdByCodename}
              {mission.createdBy === user?.uid ? " (me)" : ""}
            </span>
          </>
        )}
        {(mode === "assigned" || mode === "expired") && (
          <>
            <span className={styles.metaLabel}>Assigned to</span>
            <span className={styles.metaValue}>
              {mission.assignedToCodename}
              {mission.assignedTo === user?.uid ? " (me)" : ""}
            </span>
          </>
        )}
      </div>
    </Link>
  );
}
