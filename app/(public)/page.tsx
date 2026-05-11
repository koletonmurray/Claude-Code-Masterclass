"use client";

import Link from "next/link";
import { Clock8 } from "lucide-react";
import { useUser } from "@/contexts/auth-context";
import styles from "./page.module.css";

export default function Home() {
  const { user, loading } = useUser();
  const isAuthenticated = !loading && !!user;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <section className={styles.hero}>
        <div className={styles.glowPrimary} />
        <div className={styles.glowSecondary} />
        <div className={styles.scanlines} />

        <div className={styles.inner}>
          <div className={styles.meta} style={{ animationDelay: "0ms" }}>
            <span className={styles.statusDot} />
            {isAuthenticated
              ? `AGENT: ${user?.displayName?.toUpperCase()}`
              : "OPERATION: POCKET MISSION // ACTIVE"}
          </div>

          <h1 className={styles.headline} style={{ animationDelay: "80ms" }}>
            P<Clock8 className={styles.clockLogo} strokeWidth={2} />
            cket
            <br />
            Mission
          </h1>

          <p className={styles.tagline} style={{ animationDelay: "160ms" }}>
            {isAuthenticated
              ? "// Your active missions await."
              : "// Tiny missions. Maximum mischief."}
          </p>

          <p className={styles.description} style={{ animationDelay: "240ms" }}>
            {isAuthenticated
              ? "You have active missions in progress. Check assignments, coordinate chaos, and make sure someone brings the donuts."
              : "Assign sneaky little tasks to your coworkers — water the plant, fix the printer, bring donuts. Track deadlines. Cause just enough chaos to keep things interesting."}
          </p>

          <div className={styles.actions} style={{ animationDelay: "320ms" }}>
            {isAuthenticated ? (
              <Link href="/missions" className={styles.ctaBtn}>
                Access Mission Files
              </Link>
            ) : (
              <>
                <Link href="/signup" className={styles.ctaBtn}>
                  Accept Mission
                </Link>
                <Link href="/login" className={styles.loginLink}>
                  Sign In →
                </Link>
              </>
            )}
          </div>
        </div>

        <div className={`${styles.corner} ${styles.tl}`} />
        <div className={`${styles.corner} ${styles.tr}`} />
        <div className={`${styles.corner} ${styles.bl}`} />
        <div className={`${styles.corner} ${styles.br}`} />
      </section>
    </div>
  );
}
