import { describe, expect, test } from "vitest";
import { UIWall } from "./ui-wall";

describe("UIWAll", () => {
  test("new UIWall", () => {
    const horizontal = new UIWall(1, 2, "horizontal");
    expect(horizontal.X).toBe(1);
    expect(horizontal.Y).toBe(2);
    expect(horizontal.direction).toBe("horizontal");

    const vertical = new UIWall(3, 4, "vertical");
    expect(vertical.X).toBe(3);
    expect(vertical.Y).toBe(4);
    expect(vertical.direction).toBe("vertical");
  });
});
