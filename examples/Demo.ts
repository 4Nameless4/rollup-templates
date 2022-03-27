export default class Demo {
  root: HTMLElement;

  constructor() {
    this.root =
      document.querySelector("#root") || document.createElement("div");
  }

  set() {}

  get() {}

  draw() {}

  destroy() {}
}
