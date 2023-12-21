import { test2 } from "./index2";
export * as test2 from "./index2";

export function test(num: number) {
  let a = test2(num);
  if (process.env.NODE_ENV === "production") {
    a = 0;
  }
  return 1 + 1 + a + num;
}
