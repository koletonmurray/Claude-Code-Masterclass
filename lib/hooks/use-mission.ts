import { useState, useEffect } from "react";
import { getFirestore, doc, onSnapshot } from "firebase/firestore";
import app from "@lib/firebase/config";
import { useUser } from "@/contexts/auth-context";
import type { Mission } from "@lib/types/mission";

interface UseMissionResult {
  mission: Mission | null;
  loading: boolean;
  error: string | null;
  notFound: boolean;
}

export function useMission(id: string): UseMissionResult {
  const { user } = useUser();
  const [mission, setMission] = useState<Mission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!user) return;

    const db = getFirestore(app);

    const unsubscribe = onSnapshot(
      doc(db, "missions", id),
      (snapshot) => {
        if (!snapshot.exists()) {
          setNotFound(true);
          setMission(null);
          setLoading(false);
          return;
        }
        setMission({ id: snapshot.id, ...snapshot.data() } as Mission);
        setNotFound(false);
        setError(null);
        setLoading(false);
      },
      (err: Error) => {
        setError(err.message);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [id, user]);

  if (!user) {
    return { mission: null, loading: false, error: null, notFound: false };
  }

  return { mission, loading, error, notFound };
}
