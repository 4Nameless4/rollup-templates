// import "../style.module.css";

export default function render(props: { entry: string }): string {
  console.warn("test");
  return JSON.stringify(props);
}

console.warn("222");
