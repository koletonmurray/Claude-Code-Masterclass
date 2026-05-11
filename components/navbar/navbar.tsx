"use client";

import { useRef, useState, useEffect } from "react";
import { Clock8, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { getAuth, signOut } from "firebase/auth";
import app from "@lib/firebase/config";
import { useUser } from "@/contexts/auth-context";
import Avatar from "@/components/avatar";
import styles from "./navbar.module.css";

function splitPascalCase(str: string) {
  return str.replace(/([A-Z])/g, " $1").trim();
}

export default function Navbar() {
  const { user, loading } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [showMenu, setShowMenu] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setShowMenu(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setShowMenu(false);
    }
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  async function handleLogout() {
    setShowMenu(false);
    try {
      await signOut(getAuth(app));
      router.push("/");
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className={styles.siteNav}>
      <nav className={styles.nav}>
        <div className={styles.brand}>
          <span className={styles.brandName}>
            <Link href="/" className={styles.brandLink}>
              P<Clock8 className={styles.logo} size={14} strokeWidth={2.5} />
              cket Mission
            </Link>
          </span>
          <span className={styles.tagline}>
            – Tiny missions. Big office mischief.
          </span>
        </div>

        <div className={styles.actions}>
          {!loading && user && (
            <Link href="/missions/create" className={styles.createBtn}>
              <Plus size={13} />
              Create Mission
            </Link>
          )}
          {!loading &&
            !user &&
            pathname !== "/login" &&
            pathname !== "/signup" && (
              <Link href="/login" className={styles.loginBtn}>
                Log In
              </Link>
            )}
          {!loading && user && (
            <div className={styles.avatarWrapper} ref={wrapperRef}>
              <button
                className={styles.avatarBtn}
                onClick={() => setShowMenu((v) => !v)}
                aria-label="User menu"
                aria-expanded={showMenu}
                aria-haspopup="true"
              >
                <Avatar name={user.displayName ?? "User"} />
              </button>
              {showMenu && (
                <div className={styles.menu} role="menu">
                  <p className={styles.menuName} role="none">
                    {splitPascalCase(user.displayName ?? "User")}
                  </p>
                  <Link
                    href="/missions"
                    className={styles.menuItem}
                    role="menuitem"
                    onClick={() => setShowMenu(false)}
                  >
                    View My Missions
                  </Link>
                  <button
                    className={styles.menuItem}
                    role="menuitem"
                    onClick={handleLogout}
                  >
                    Log Out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>
    </div>
  );
}
