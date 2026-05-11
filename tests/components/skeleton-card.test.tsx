import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import SkeletonCard from "@/components/skeleton-card";

describe("SkeletonCard", () => {
  it("renders a single div", () => {
    const { container } = render(<SkeletonCard />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("is hidden from assistive technology", () => {
    const { container } = render(<SkeletonCard />);
    expect(container.firstChild).toHaveAttribute("aria-hidden", "true");
  });
});
