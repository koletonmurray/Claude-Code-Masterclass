import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import type { Timestamp } from "firebase/firestore";
import MissionCard from "@/components/mission-card";
import type { Mission } from "@lib/types/mission";

vi.mock("@/contexts/auth-context", () => ({
  useUser: () => ({ user: { uid: "user-1" }, loading: false }),
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// 2030-01-01 UTC — safely in the future
const futureDeadline = { seconds: 1893456000, nanoseconds: 0 } as Timestamp;
// 2000-01-01 UTC — safely in the past
const pastDeadline = { seconds: 946684800, nanoseconds: 0 } as Timestamp;

const base: Mission = {
  id: "m1",
  title: "Steal the donuts",
  description: "Take donuts from the 3rd floor kitchen",
  createdBy: "user-2",
  createdByCodename: "Agent Fox",
  assignedTo: "user-1",
  assignedToCodename: "Agent Wolf",
  deadline: futureDeadline,
  finalStatus: null,
};

describe("MissionCard", () => {
  it("shows In Progress badge for a pending mission with a future deadline", () => {
    render(<MissionCard mission={base} mode="active" />);
    expect(screen.getByText("In Progress")).toBeInTheDocument();
  });

  it("shows Expired badge for a pending mission with a past deadline", () => {
    render(
      <MissionCard
        mission={{ ...base, deadline: pastDeadline }}
        mode="expired"
      />,
    );
    expect(screen.getByText("Expired")).toBeInTheDocument();
  });

  it("shows Success badge when finalStatus is success", () => {
    render(
      <MissionCard
        mission={{ ...base, finalStatus: "success" }}
        mode="completed"
      />,
    );
    expect(screen.getByText("Success")).toBeInTheDocument();
  });

  it("shows Failed badge when finalStatus is failure", () => {
    render(
      <MissionCard
        mission={{ ...base, finalStatus: "failure" }}
        mode="completed"
      />,
    );
    expect(screen.getByText("Failed")).toBeInTheDocument();
  });

  it("renders the formatted deadline date for non-active modes", () => {
    render(
      <MissionCard
        mission={{ ...base, finalStatus: "success" }}
        mode="completed"
      />,
    );
    expect(screen.getByText("Dec 31, 2029")).toBeInTheDocument();
  });

  it("renders a countdown for active missions", () => {
    render(<MissionCard mission={base} mode="active" />);
    expect(screen.getByText(/\d+d left/)).toBeInTheDocument();
  });

  it("renders the mission title and description", () => {
    render(<MissionCard mission={base} mode="active" />);
    expect(screen.getByText("Steal the donuts")).toBeInTheDocument();
    expect(
      screen.getByText("Take donuts from the 3rd floor kitchen"),
    ).toBeInTheDocument();
  });

  it("links to the mission detail page", () => {
    render(<MissionCard mission={base} mode="active" />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/missions/m1");
  });

  it("shows Assigned by meta for active mode", () => {
    render(<MissionCard mission={base} mode="active" />);
    expect(screen.getByText("Assigned by")).toBeInTheDocument();
    expect(screen.getByText("Agent Fox")).toBeInTheDocument();
  });

  it("shows Assigned by meta for completed mode", () => {
    render(
      <MissionCard
        mission={{ ...base, finalStatus: "success" }}
        mode="completed"
      />,
    );
    expect(screen.getByText("Assigned by")).toBeInTheDocument();
  });

  it("shows Assigned to meta for assigned mode", () => {
    render(<MissionCard mission={base} mode="assigned" />);
    expect(screen.getByText("Assigned to")).toBeInTheDocument();
    expect(screen.getByText(/Agent Wolf/)).toBeInTheDocument();
  });

  it("shows Assigned to meta for expired mode", () => {
    render(
      <MissionCard
        mission={{ ...base, deadline: pastDeadline }}
        mode="expired"
      />,
    );
    expect(screen.getByText("Assigned to")).toBeInTheDocument();
  });

  it("appends (me) to creator name when current user is the creator", () => {
    render(
      <MissionCard mission={{ ...base, createdBy: "user-1" }} mode="active" />,
    );
    expect(screen.getByText(/Agent Fox.*\(me\)/)).toBeInTheDocument();
  });

  it("appends (me) to assignee name when current user is the assignee", () => {
    render(<MissionCard mission={base} mode="assigned" />);
    expect(screen.getByText(/Agent Wolf.*\(me\)/)).toBeInTheDocument();
  });
});
