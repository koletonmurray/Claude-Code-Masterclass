import dayjs from "dayjs";
import styles from "./deadline-countdown.module.css";

interface DeadlineCountdownProps {
  seconds: number;
}

export default function DeadlineCountdown({ seconds }: DeadlineCountdownProps) {
  const now = dayjs();
  const end = dayjs.unix(seconds);
  const diffMin = end.diff(now, "minute");

  let text: string;
  let variantClass: string;

  if (diffMin <= 0) {
    text = "Overdue";
    variantClass = styles.critical;
  } else if (diffMin < 60) {
    text = `${diffMin}m left`;
    variantClass = styles.urgent;
  } else {
    const hours = end.diff(now, "hour");
    if (hours < 24) {
      text = `${hours}h left`;
      variantClass = styles.urgent;
    } else {
      const days = end.diff(now, "day");
      text = `${days}d left`;
      variantClass = days <= 3 ? styles.urgent : styles.normal;
    }
  }

  return <span className={`${styles.base} ${variantClass}`}>{text}</span>;
}
