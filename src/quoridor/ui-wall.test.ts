import { Container } from "pixi.js";
import { describe, expect, test } from "vitest";
import { UIWall, createUIWalls } from "./ui-wall";

describe("UIWAll", () => {
  test("new UIWall", () => {
    const horizontal = new UIWall(1, 2, "horizontal");
    expect(horizontal.X).toBe(1);
    expect(horizontal.Y).toBe(2);
    expect(horizontal.direction).toBe("horizontal");
    expect(UIWall.get(1, 2, "horizontal")).toBe(horizontal);

    const vertical = new UIWall(3, 4, "vertical");
    expect(vertical.X).toBe(3);
    expect(vertical.Y).toBe(4);
    expect(vertical.direction).toBe("vertical");
    expect(UIWall.get(3, 4, "vertical")).toBe(vertical);
  });
});

describe("createUIWalls", () => {
  test("UIWallが作られること", () => {
    const nextPlayer = () => {};
    const board = new Container();
    const uiWallContainer = createUIWalls({ nextPlayer, board });
    expect(uiWallContainer.children.length).toBe(128);
  });
});
