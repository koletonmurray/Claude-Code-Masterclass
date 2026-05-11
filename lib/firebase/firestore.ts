import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import app from "@lib/firebase/config";
import type { User } from "@lib/types/user";
import type {
  CreateMissionInput,
  FinalStatus,
  Mission,
} from "@lib/types/mission";

const db = getFirestore(app);

export async function getUsers(): Promise<User[]> {
  const snapshot = await getDocs(collection(db, "users"));
  return snapshot.docs.map((doc) => doc.data() as User);
}

export async function createMission(
  data: CreateMissionInput & { deadline: Date },
): Promise<string> {
  const { deadline, ...rest } = data;
  const payload: Omit<Mission, "id"> = {
    ...rest,
    deadline: Timestamp.fromDate(deadline),
    finalStatus: null,
  };
  const ref = await addDoc(collection(db, "missions"), payload);
  return ref.id;
}

export async function updateMissionStatus(
  id: string,
  status: FinalStatus,
): Promise<void> {
  await updateDoc(doc(db, "missions", id), { finalStatus: status });
}
