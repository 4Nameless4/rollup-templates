import src1 from "../src/src1";
import Demo from "./Demo";

const demo = new Demo();

const examples = document.createElement("div");

examples.innerText = "demo 2";

demo.root.appendChild(examples);

console.log(src1);
