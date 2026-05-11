import { Timestamp } from "firebase/firestore";

export type FinalStatus = "success" | "failure";

export interface Mission {
  id: string;
  title: string;
  description: string;
  createdBy: string;
  createdByCodename: string;
  assignedTo: string;
  assignedToCodename: string;
  deadline: Timestamp;
  finalStatus: FinalStatus | null;
}

export type CreateMissionInput = Omit<
  Mission,
  "id" | "deadline" | "finalStatus"
>;
