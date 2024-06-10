import './index.css'
import './index.module.css'

const div = document.createElement("div");
div.id = "root";

const span = document.createElement("span");
span.innerText = "Hello world! ^.^";

div.appendChild(span);
document.body.appendChild(div);
