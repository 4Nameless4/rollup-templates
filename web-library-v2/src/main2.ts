import "./style2.css";
import style from "./style2.module.css";

const div = document.createElement("div");
div.classList.add("notModule2");
const span = document.createElement("span");
span.classList.add(style.text2);
span.textContent = "22222222222222222222222";

div.appendChild(span);
document.body.appendChild(div);
