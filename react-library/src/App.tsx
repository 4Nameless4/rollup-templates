"use strict";
import style from "./App.module.css";
import Widget1 from "./widget1";

export default function App() {
  return (
    <>
      <header></header>
      <main className={style.app}>
        <Widget1 />
      </main>
      <footer></footer>
    </>
  );
}
