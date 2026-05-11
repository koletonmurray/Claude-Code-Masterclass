import { describe, it, expect } from "vitest";
import {
  generateCodename,
  colorWords,
  adjectiveWords,
  animalWords,
} from "@lib/codename";

describe("generateCodename", () => {
  it("returns a non-empty string", () => {
    expect(typeof generateCodename()).toBe("string");
    expect(generateCodename().length).toBeGreaterThan(0);
  });

  it("output is three PascalCase words joined together", () => {
    expect(generateCodename()).toMatch(/^[A-Z][a-z]+[A-Z][a-z]+[A-Z][a-z]+$/);
  });

  it("word sets are disjoint (no word appears in more than one set)", () => {
    const allWords = [...colorWords, ...adjectiveWords, ...animalWords];
    const unique = new Set(allWords);
    expect(unique.size).toBe(allWords.length);
  });

  it("produces varied results across multiple calls", () => {
    const results = new Set(Array.from({ length: 50 }, generateCodename));
    expect(results.size).toBeGreaterThan(1);
  });
});
