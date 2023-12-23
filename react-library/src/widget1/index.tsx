import style from "./index.module.css";
import { useState } from "react";

const STATUS = {
  HOVERED: "hovered",
  NORMAL: "normal",
};

export default function Widget1() {
  const [status, setStatus] = useState(STATUS.NORMAL);
  const onMouseEnter = () => {
    setStatus(STATUS.HOVERED);
  };

  const onMouseLeave = () => {
    setStatus(STATUS.NORMAL);
  };
  const test = style.w1;
  return (
    <div
      className={`full,${test},${status}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <h3>Widget1</h3>
      <span>hello</span>
      <p>
        wowwwww!!
      </p>
    </div>
  );
}
