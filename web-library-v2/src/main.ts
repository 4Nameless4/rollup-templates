import "./style.css";
import style from "./style.module.css";

const div = document.createElement("div");
div.classList.add("notModule");
const span = document.createElement("span");
span.classList.add(style.text);
span.textContent = "1111111111111111111";

div.appendChild(span);
document.body.appendChild(div);
