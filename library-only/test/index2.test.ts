import { describe, expect, test } from "@jest/globals";
import { run2 } from "../src/index2";

describe("sum module", () => {
  test("adds 2 + 2 * 3 to equal 8", () => {
    expect(run2(3)).toBe(8);
  });
});
