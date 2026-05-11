import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

const {
  mockGetFirestore,
  mockDoc,
  mockOnSnapshot,
  mockUseUser,
  mockUnsubscribe,
} = vi.hoisted(() => ({
  mockGetFirestore: vi.fn(),
  mockDoc: vi.fn(),
  mockOnSnapshot: vi.fn(),
  mockUseUser: vi.fn(),
  mockUnsubscribe: vi.fn(),
}));

vi.mock("firebase/firestore", () => ({
  getFirestore: mockGetFirestore,
  doc: mockDoc,
  onSnapshot: mockOnSnapshot,
}));

vi.mock("@lib/firebase/config", () => ({ default: {} }));

vi.mock("@/contexts/auth-context", () => ({
  useUser: mockUseUser,
}));

import { useMission } from "@lib/hooks/use-mission";

const fakeUser = { uid: "u1", displayName: "SilverQuietFox" };

const fakeMissionData = {
  title: "Night Job",
  description: "Steal the diamond",
  createdBy: "u2",
  createdByCodename: "NeonBoldShark",
  assignedTo: "u1",
  assignedToCodename: "SilverQuietFox",
  deadline: { seconds: 9999999999 },
  finalStatus: null,
};

function makeDocSnapshot(exists: boolean, id = "h1", data = fakeMissionData) {
  return { exists: () => exists, id, data: () => data };
}

describe("useMission", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetFirestore.mockReturnValue({});
    mockDoc.mockReturnValue({});
    mockUseUser.mockReturnValue({ user: fakeUser, loading: false });
    mockOnSnapshot.mockImplementation((_ref, onSuccess) => {
      onSuccess(makeDocSnapshot(true));
      return mockUnsubscribe;
    });
  });

  it("returns loading: false and mission after snapshot fires", () => {
    const { result } = renderHook(() => useMission("h1"));
    expect(result.current.loading).toBe(false);
    expect(result.current.mission).not.toBeNull();
    expect(result.current.mission?.title).toBe("Night Job");
    expect(result.current.mission?.id).toBe("h1");
  });

  it("maps snapshot.id to mission.id and spreads all fields", () => {
    mockOnSnapshot.mockImplementation((_ref, onSuccess) => {
      onSuccess(makeDocSnapshot(true, "abc123"));
      return mockUnsubscribe;
    });
    const { result } = renderHook(() => useMission("abc123"));
    expect(result.current.mission?.id).toBe("abc123");
    expect(result.current.mission?.createdBy).toBe("u2");
  });

  it("sets notFound: true when doc does not exist", () => {
    mockOnSnapshot.mockImplementation((_ref, onSuccess) => {
      onSuccess(makeDocSnapshot(false));
      return mockUnsubscribe;
    });
    const { result } = renderHook(() => useMission("missing"));
    expect(result.current.notFound).toBe(true);
    expect(result.current.mission).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it("sets error and loading: false when onSnapshot errors", () => {
    mockOnSnapshot.mockImplementation((_ref, _onSuccess, onError) => {
      onError(new Error("permission-denied"));
      return mockUnsubscribe;
    });
    const { result } = renderHook(() => useMission("h1"));
    expect(result.current.error).toBe("permission-denied");
    expect(result.current.loading).toBe(false);
    expect(result.current.mission).toBeNull();
  });

  it("calls unsubscribe on unmount", () => {
    const { unmount } = renderHook(() => useMission("h1"));
    unmount();
    expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
  });

  it("returns empty result and skips onSnapshot when user is null", () => {
    mockUseUser.mockReturnValue({ user: null, loading: false });
    const { result } = renderHook(() => useMission("h1"));
    expect(result.current.mission).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.notFound).toBe(false);
    expect(mockOnSnapshot).not.toHaveBeenCalled();
  });

  it("returns loading: true before snapshot fires", () => {
    mockOnSnapshot.mockImplementation(() => mockUnsubscribe);
    const { result } = renderHook(() => useMission("h1"));
    expect(result.current.loading).toBe(true);
  });
});
