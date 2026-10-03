import { describe, expect, it } from "vitest";
import { formatPageNumbers } from "@app/utils/formatPageNumbers";

describe("formatPageNumbers", () => {
  it("returns empty for no pages", () => {
    expect(formatPageNumbers([])).toBe("");
  });

  it("formats singles and ranges", () => {
    expect(formatPageNumbers([1, 2, 3, 5, 8, 9])).toBe("1-3,5,8-9");
  });

  it("dedupes and sorts", () => {
    expect(formatPageNumbers([5, 1, 1, 3, 2])).toBe("1-3,5");
  });
});
