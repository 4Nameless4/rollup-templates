import widget1 from "../src/widget1";

describe("widget1 module", () => {
  test("widget1 module render 1 to equal {entry:1}", () => {
    expect(widget1({ entry: "1" })).toBe(
      JSON.stringify({ entry: "1" })
    );
  });
  test("test2", () => {
    expect({ a: 1 }).toEqual({ a: 1 });
  });
});
