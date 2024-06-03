import { describe, expect, test } from "@jest/globals";
import { testFn } from "../src/index";

describe("test module", () => {
  test("test", () => {
    expect(testFn(" a")).toBe("test template package a");
  });
});
