import Src0 from "./src0";

export default class Src1 extends Src0 {
  constructor() {
    super();
    console.log("Src1 new");
  }

  set() {
    super.set();
    console.log("Src1 set");
  }
}
