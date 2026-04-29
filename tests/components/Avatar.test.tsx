import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import Avatar from "@/components/Avatar"

describe("Avatar", () => {
  it("renders the first letter of a simple name", () => {
    render(<Avatar name="alice" />)
    expect(screen.getByText("A")).toBeInTheDocument()
  })

  it("renders the first two uppercase letters for a PascalCase name", () => {
    render(<Avatar name="JohnDoe" />)
    expect(screen.getByText("JD")).toBeInTheDocument()
  })

  it("renders only one letter when name has a single word", () => {
    render(<Avatar name="Taylor" />)
    expect(screen.getByText("T")).toBeInTheDocument()
  })
})
