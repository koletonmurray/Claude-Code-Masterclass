import styles from "./SkeletonCard.module.css"

export default function SkeletonCard() {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.avatar} />
        <div className={styles.headerLines}>
          <div className={`${styles.line} w-2/3`} />
          <div className={`${styles.line} w-1/2`} />
        </div>
      </div>

      <div className={styles.body}>
        <div className={`${styles.line} w-full`} />
        <div className={`${styles.line} w-full`} />
        <div className={`${styles.line} w-3/5`} />
      </div>
    </div>
  )
}