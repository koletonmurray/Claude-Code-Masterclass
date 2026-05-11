import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

const {
  mockGetFirestore,
  mockCollection,
  mockQuery,
  mockWhere,
  mockOnSnapshot,
  mockTimestampNow,
  mockUseUser,
  mockUnsubscribe,
} = vi.hoisted(() => ({
  mockGetFirestore: vi.fn(),
  mockCollection: vi.fn(),
  mockQuery: vi.fn(),
  mockWhere: vi.fn(),
  mockOnSnapshot: vi.fn(),
  mockTimestampNow: vi.fn(),
  mockUseUser: vi.fn(),
  mockUnsubscribe: vi.fn(),
}));

vi.mock("firebase/firestore", () => ({
  getFirestore: mockGetFirestore,
  collection: mockCollection,
  query: mockQuery,
  where: mockWhere,
  onSnapshot: mockOnSnapshot,
  Timestamp: { now: mockTimestampNow },
}));

vi.mock("@lib/firebase/config", () => ({ default: {} }));

vi.mock("@/contexts/auth-context", () => ({
  useUser: mockUseUser,
}));

import { useMissions } from "@lib/hooks/use-missions";

const fakeUser = { uid: "u1", displayName: "SilverQuietFox" };

const fakeMissionData = {
  id: "h1",
  title: "Night Job",
  description: "Steal the diamond",
  createdBy: "u2",
  createdByCodename: "NeonBoldShark",
  assignedTo: "u1",
  assignedToCodename: "SilverQuietFox",
  deadline: { seconds: 9999999999 },
  finalStatus: null,
};

function makeSnapshot(items: (typeof fakeMissionData)[]) {
  return {
    docs: items.map(({ id, ...rest }) => ({
      id,
      data: () => rest,
    })),
  };
}

describe("useMissions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetFirestore.mockReturnValue({});
    mockCollection.mockReturnValue({});
    mockQuery.mockReturnValue({});
    mockWhere.mockReturnValue({});
    mockTimestampNow.mockReturnValue({ seconds: 1000000 });
    mockUseUser.mockReturnValue({ user: fakeUser, loading: false });
    mockOnSnapshot.mockImplementation((_q, onSuccess) => {
      onSuccess(makeSnapshot([fakeMissionData]));
      return mockUnsubscribe;
    });
  });

  it("returns loading: false and missions after snapshot fires", () => {
    const { result } = renderHook(() => useMissions("active"));
    expect(result.current.loading).toBe(false);
    expect(result.current.missions).toHaveLength(1);
    expect(result.current.missions[0].title).toBe("Night Job");
    expect(result.current.missions[0].id).toBe("h1");
  });

  it("active mode queries by assignedTo and future deadline", () => {
    renderHook(() => useMissions("active"));
    expect(mockWhere).toHaveBeenCalledWith("assignedTo", "==", "u1");
    expect(mockWhere).toHaveBeenCalledWith("deadline", ">=", expect.anything());
  });

  it("assigned mode queries by createdBy and future deadline", () => {
    renderHook(() => useMissions("assigned"));
    expect(mockWhere).toHaveBeenCalledWith("createdBy", "==", "u1");
    expect(mockWhere).toHaveBeenCalledWith("deadline", ">=", expect.anything());
  });

  it("expired mode queries by past deadline and client-filters by createdBy or assignedTo", () => {
    // h1: assignedTo === user.uid → included
    const ownAssigned = {
      ...fakeMissionData,
      id: "h1",
      assignedTo: "u1",
      createdBy: "u2",
    };
    // h2: createdBy === user.uid → included
    const ownCreated = {
      ...fakeMissionData,
      id: "h2",
      assignedTo: "u3",
      createdBy: "u1",
    };
    // h3: neither createdBy nor assignedTo matches → excluded
    const unrelated = {
      ...fakeMissionData,
      id: "h3",
      assignedTo: "u3",
      createdBy: "u2",
    };

    mockOnSnapshot.mockImplementation((_q, onSuccess) => {
      onSuccess(makeSnapshot([ownAssigned, ownCreated, unrelated]));
      return mockUnsubscribe;
    });

    const { result } = renderHook(() => useMissions("expired"));

    expect(mockWhere).toHaveBeenCalledWith("deadline", "<", expect.anything());
    expect(result.current.missions).toHaveLength(2);
    expect(result.current.missions.map((m) => m.id)).toEqual(
      expect.arrayContaining(["h1", "h2"]),
    );
  });

  it("sets error and loading: false when onSnapshot errors", () => {
    mockOnSnapshot.mockImplementation((_q, _onSuccess, onError) => {
      onError(new Error("permission-denied"));
      return mockUnsubscribe;
    });

    const { result } = renderHook(() => useMissions("active"));

    expect(result.current.error).toBe("permission-denied");
    expect(result.current.loading).toBe(false);
    expect(result.current.missions).toHaveLength(0);
  });

  it("calls unsubscribe on unmount", () => {
    const { unmount } = renderHook(() => useMissions("active"));
    unmount();
    expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
  });

  it("returns empty array and skips onSnapshot when user is null", () => {
    mockUseUser.mockReturnValue({ user: null, loading: false });

    const { result } = renderHook(() => useMissions("active"));

    expect(result.current.missions).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(mockOnSnapshot).not.toHaveBeenCalled();
  });
});
