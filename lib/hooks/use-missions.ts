import { useState, useEffect } from "react";
import {
  getFirestore,
  collection,
  query,
  where,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import app from "@lib/firebase/config";
import { useUser } from "@/contexts/auth-context";
import type { Mission } from "@lib/types/mission";

export type MissionMode = "active" | "assigned" | "expired" | "completed";

interface UseMissionsResult {
  missions: Mission[];
  loading: boolean;
  error: string | null;
}

export function useMissions(mode: MissionMode): UseMissionsResult {
  const { user } = useUser();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const db = getFirestore(app);
    const now = Timestamp.now();

    const q =
      mode === "active" || mode === "completed"
        ? query(
            collection(db, "missions"),
            where("assignedTo", "==", user.uid),
            where("deadline", ">=", now),
          )
        : mode === "assigned"
          ? query(
              collection(db, "missions"),
              where("createdBy", "==", user.uid),
              where("deadline", ">=", now),
            )
          : query(collection(db, "missions"), where("deadline", "<", now));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        let results = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() }) as Mission,
        );
        if (mode === "active" || mode === "assigned") {
          results = results.filter((m) => m.finalStatus === null);
        } else if (mode === "completed") {
          results = results.filter((m) => m.finalStatus !== null);
        } else if (mode === "expired") {
          results = results.filter(
            (m) => m.createdBy === user.uid || m.assignedTo === user.uid,
          );
        }
        setMissions(results);
        setError(null);
        setLoading(false);
      },
      (err: Error) => {
        setError(err.message);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [mode, user]);

  if (!user) {
    return { missions: [], loading: false, error: null };
  }

  return { missions, loading, error };
}
