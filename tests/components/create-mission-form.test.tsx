import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockGetUsers, mockCreateMission, mockPush, mockUseUser } = vi.hoisted(
  () => ({
    mockGetUsers: vi.fn(),
    mockCreateMission: vi.fn(),
    mockPush: vi.fn(),
    mockUseUser: vi.fn(),
  }),
);

vi.mock("@lib/firebase/firestore", () => ({
  getUsers: mockGetUsers,
  createMission: mockCreateMission,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("@/contexts/auth-context", () => ({
  useUser: mockUseUser,
}));

vi.mock("@lib/firebase/config", () => ({ default: {} }));

import CreateMissionForm from "@/components/create-mission-form";

const fakeUser = { uid: "u1", displayName: "SilverQuietFox" };
const fakeUsers = [
  { id: "u1", codename: "SilverQuietFox" },
  { id: "u2", codename: "NeonBoldShark" },
];

describe("CreateMissionForm", () => {
  beforeEach(() => {
    mockUseUser.mockReturnValue({ user: fakeUser, loading: false });
    mockGetUsers.mockResolvedValue(fakeUsers);
    mockCreateMission.mockResolvedValue("new-mission-id");
    mockPush.mockReset();
  });

  it("renders all form fields", async () => {
    render(<CreateMissionForm />);
    await waitFor(() =>
      expect(
        screen.getByRole("option", { name: /SilverQuietFox/ }),
      ).toBeInTheDocument(),
    );
    expect(screen.getByLabelText("Title")).toBeInTheDocument();
    expect(screen.getByLabelText("Description")).toBeInTheDocument();
    expect(screen.getByLabelText("Deadline")).toBeInTheDocument();
    expect(screen.getByLabelText("Assign to")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Create Mission" }),
    ).toBeInTheDocument();
  });

  it("populates Assign to dropdown with user codenames", async () => {
    render(<CreateMissionForm />);
    await waitFor(() =>
      expect(
        screen.getByRole("option", { name: /SilverQuietFox/ }),
      ).toBeInTheDocument(),
    );
    expect(
      screen.getByRole("option", { name: "NeonBoldShark" }),
    ).toBeInTheDocument();
  });

  it("submit button is disabled while users are loading", () => {
    mockGetUsers.mockReturnValue(new Promise(() => {}));
    render(<CreateMissionForm />);
    expect(
      screen.getByRole("button", { name: "Create Mission" }),
    ).toBeDisabled();
  });

  it("shows validation errors when submitting an empty form", async () => {
    const user = userEvent.setup();
    render(<CreateMissionForm />);
    await waitFor(() =>
      expect(
        screen.getByRole("option", { name: /SilverQuietFox/ }),
      ).toBeInTheDocument(),
    );

    fireEvent.change(screen.getByLabelText("Deadline"), {
      target: { value: "" },
    });
    await user.click(screen.getByRole("button", { name: "Create Mission" }));

    expect(screen.getByText("Title is required")).toBeInTheDocument();
    expect(screen.getByText("Description is required")).toBeInTheDocument();
    expect(screen.getByText("Deadline is required")).toBeInTheDocument();
    expect(
      screen.getByText("You must assign this mission to someone"),
    ).toBeInTheDocument();
  });

  it("shows a validation error when deadline is in the past", async () => {
    const user = userEvent.setup();
    render(<CreateMissionForm />);
    await waitFor(() =>
      expect(
        screen.getByRole("option", { name: /SilverQuietFox/ }),
      ).toBeInTheDocument(),
    );

    await user.type(screen.getByLabelText("Title"), "Night Job");
    await user.type(screen.getByLabelText("Description"), "Details");
    fireEvent.change(screen.getByLabelText("Deadline"), {
      target: { value: "2000-01-01T00:00" },
    });
    await user.click(screen.getByRole("button", { name: "Create Mission" }));

    expect(
      screen.getByText("Deadline must be in the future"),
    ).toBeInTheDocument();
  });

  it("calls createMission with correct payload and navigates to /missions on success", async () => {
    const user = userEvent.setup();
    render(<CreateMissionForm />);
    await waitFor(() =>
      expect(
        screen.getByRole("option", { name: /SilverQuietFox/ }),
      ).toBeInTheDocument(),
    );

    await user.type(screen.getByLabelText("Title"), "Night Job");
    await user.type(screen.getByLabelText("Description"), "Steal the diamond");
    fireEvent.change(screen.getByLabelText("Deadline"), {
      target: { value: "2099-12-31T23:59" },
    });
    await user.selectOptions(screen.getByLabelText("Assign to"), "u2");
    await user.click(screen.getByRole("button", { name: "Create Mission" }));

    await waitFor(() =>
      expect(mockCreateMission).toHaveBeenCalledWith({
        title: "Night Job",
        description: "Steal the diamond",
        deadline: new Date("2099-12-31T23:59"),
        assignedTo: "u2",
        assignedToCodename: "NeonBoldShark",
        createdBy: "u1",
        createdByCodename: "SilverQuietFox",
      }),
    );
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/missions"));
  });

  it("shows a form error and does not navigate when createMission fails", async () => {
    mockCreateMission.mockRejectedValue(new Error("Firestore error"));
    const user = userEvent.setup();
    render(<CreateMissionForm />);
    await waitFor(() =>
      expect(
        screen.getByRole("option", { name: /SilverQuietFox/ }),
      ).toBeInTheDocument(),
    );

    await user.type(screen.getByLabelText("Title"), "Night Job");
    await user.type(screen.getByLabelText("Description"), "Steal the diamond");
    fireEvent.change(screen.getByLabelText("Deadline"), {
      target: { value: "2099-12-31T23:59" },
    });
    await user.selectOptions(screen.getByLabelText("Assign to"), "u2");
    await user.click(screen.getByRole("button", { name: "Create Mission" }));

    await waitFor(() =>
      expect(screen.getByText(/failed to create mission/i)).toBeInTheDocument(),
    );
    expect(mockPush).not.toHaveBeenCalled();
  });
});
