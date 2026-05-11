import styles from "./skeleton-card.module.css";

export default function SkeletonCard() {
  return <div className={styles.card} aria-hidden="true" />;
}
