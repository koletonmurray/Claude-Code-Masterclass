"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import { useUser } from "@/contexts/auth-context";
import { getUsers, createMission } from "@lib/firebase/firestore";
import type { User } from "@lib/types/user";
import styles from "./create-mission-form.module.css";

interface FormErrors {
  title?: string;
  description?: string;
  deadline?: string;
  assignedTo?: string;
}

export default function CreateMissionForm() {
  const router = useRouter();
  const { user } = useUser();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState(
    dayjs()
      .add(1, "day")
      .hour(12)
      .minute(0)
      .second(0)
      .format("YYYY-MM-DDTHH:mm"),
  );
  const [assignedTo, setAssignedTo] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    getUsers()
      .then(setUsers)
      .catch(() => setFormError("Failed to load users. Please refresh."))
      .finally(() => setUsersLoading(false));
  }, []);

  function deadlineHint(): string | null {
    if (!deadline) return null;
    const target = dayjs(deadline);
    if (!target.isValid()) return null;
    const daysDiff = target.startOf("day").diff(dayjs().startOf("day"), "day");
    const time = target.format("h:mm A");
    if (daysDiff < 0) return null;
    if (daysDiff === 0) return `Today @ ${time}`;
    if (daysDiff === 1) return `Tomorrow @ ${time}`;
    return `${daysDiff} days @ ${time}`;
  }

  function validate(): FormErrors {
    const next: FormErrors = {};
    if (!title.trim()) next.title = "Title is required";
    if (!description.trim()) next.description = "Description is required";
    if (!deadline) {
      next.deadline = "Deadline is required";
    } else if (new Date(deadline) <= new Date()) {
      next.deadline = "Deadline must be in the future";
    }
    if (!assignedTo)
      next.assignedTo = "You must assign this mission to someone";
    return next;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    setFormError(null);
    try {
      await createMission({
        title: title.trim(),
        description: description.trim(),
        deadline: new Date(deadline),
        assignedTo: assignedTo!.id,
        assignedToCodename: assignedTo!.codename,
        createdBy: user!.uid,
        createdByCodename: user!.displayName ?? "",
      });
      router.push("/missions");
    } catch {
      setFormError("Failed to create mission. Please try again.");
      setSubmitting(false);
    }
  }

  const isDisabled = usersLoading || submitting;

  return (
    <form onSubmit={handleSubmit} className={styles.form} noValidate>
      <h1 className="form-title">Create a New Mission</h1>

      <div className={styles.field}>
        <label htmlFor="title" className={styles.label}>
          Title
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={styles.input}
          disabled={isDisabled}
          aria-describedby={errors.title ? "title-error" : undefined}
          aria-invalid={!!errors.title}
        />
        {errors.title && (
          <p id="title-error" className={styles.error} role="alert">
            {errors.title}
          </p>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="description" className={styles.label}>
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={styles.textarea}
          rows={4}
          disabled={isDisabled}
          aria-describedby={
            errors.description ? "description-error" : undefined
          }
          aria-invalid={!!errors.description}
        />
        {errors.description && (
          <p id="description-error" className={styles.error} role="alert">
            {errors.description}
          </p>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="deadline" className={styles.label}>
          Deadline
        </label>
        <input
          id="deadline"
          type="datetime-local"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className={styles.input}
          disabled={isDisabled}
          aria-describedby={errors.deadline ? "deadline-error" : undefined}
          aria-invalid={!!errors.deadline}
        />
        {!errors.deadline &&
          (() => {
            const hint = deadlineHint();
            return hint ? <p className={styles.hint}>{hint}</p> : null;
          })()}
        {errors.deadline && (
          <p id="deadline-error" className={styles.error} role="alert">
            {errors.deadline}
          </p>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="assignedTo" className={styles.label}>
          Assign to
        </label>
        <select
          id="assignedTo"
          value={assignedTo?.id ?? ""}
          onChange={(e) => {
            const selected = users.find((u) => u.id === e.target.value) ?? null;
            setAssignedTo(selected);
          }}
          className={styles.select}
          disabled={isDisabled}
          aria-describedby={errors.assignedTo ? "assignedTo-error" : undefined}
          aria-invalid={!!errors.assignedTo}
        >
          <option value="">
            {usersLoading ? "Loading agents…" : "Select an agent"}
          </option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.codename}
              {u.id === user?.uid ? " (me)" : ""}
            </option>
          ))}
        </select>
        {errors.assignedTo && (
          <p id="assignedTo-error" className={styles.error} role="alert">
            {errors.assignedTo}
          </p>
        )}
      </div>

      {formError && (
        <p className={styles.formError} role="alert">
          {formError}
        </p>
      )}

      <button type="submit" className="btn-gradient" disabled={isDisabled}>
        {submitting ? "Creating…" : "Create Mission"}
      </button>
    </form>
  );
}
