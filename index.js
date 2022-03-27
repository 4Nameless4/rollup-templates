// import examples from "./dist/examples.json";

const root = document.querySelector("#root");
const list = document.querySelector(".list");
const content = document.querySelector(".content");

examples &&
  Array.isArray(examples) &&
  examples.forEach((es) => {
    const name = es.replace(/\.demo\.ts$/g, "");

    const item = document.createElement("div");
    const link = document.createElement("a");

    item.classList.add(es);

    link.classList.add("link");

    link.text = name;

    link.href = `/dist/${name}.html`;

    link.target = "demoContent";

    item.appendChild(link);
    list.appendChild(item);
  });
