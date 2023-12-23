import { run2 } from "./index2";
export * as index2 from "./index2";

export function run1(num: number) {
  const a = run2(num);
  
  return 1 + 1 + a + num;
}
