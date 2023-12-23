import { describe, expect, test, it } from "@jest/globals";
import renderer from "react-test-renderer";
import Widget1 from "../src/widget1";
import com from "../src/com";

describe("widget1 module", () => {
  test("test2", () => {
    expect({ a: 1 }).toEqual({ a: 1 });
  });

  test("widget1 module render 1 to equal {entry:1}", () => {
    expect(com({ entry: "1" })).toBe(
      JSON.stringify({ entry: "1" })
    );
  });
});

it("changes the class when hovered", () => {
  const component = renderer.create(<Widget1></Widget1>);
  let tree: any = component.toJSON();
  expect(tree).toMatchSnapshot();
  if (tree) {
    // manually trigger the callback
    renderer.act(() => {
      tree.props.onMouseEnter();
    });
    // re-rendering
    tree = component.toJSON();
    expect(tree).toMatchSnapshot();

    // manually trigger the callback
    renderer.act(() => {
      tree.props.onMouseLeave();
    });
    // re-rendering
    tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  }
});
