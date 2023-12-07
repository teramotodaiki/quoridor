import { describe, expect, test, vi } from "vitest";
import { UIWall, createUIWalls } from "./ui-wall";

describe("UIWall", () => {
  test("new UIWall", () => {
    const onTap = () => {};
    const horizontal = new UIWall(1, 2, "horizontal", onTap);
    expect(horizontal.X).toBe(1);
    expect(horizontal.Y).toBe(2);
    expect(horizontal.direction).toBe("horizontal");
    expect(UIWall.get(1, 2, "horizontal")).toBe(horizontal);

    const vertical = new UIWall(3, 4, "vertical", onTap);
    expect(vertical.X).toBe(3);
    expect(vertical.Y).toBe(4);
    expect(vertical.direction).toBe("vertical");
    expect(UIWall.get(3, 4, "vertical")).toBe(vertical);
  });
});

describe("createUIWalls", () => {
  test("UIWallが作られること", () => {
    const uiWallContainer = createUIWalls({ onTap() {} });
    expect(uiWallContainer.children.length).toBe(128);
  });

  test("PCから操作する場合", () => {
    const onTap = vi.fn();
    createUIWalls({ onTap });
    const hori = UIWall.get(1, 1, "horizontal")!;
    const vert = UIWall.get(1, 1, "vertical")!;

    hori.onmouseenter();
    expect(hori.alpha).toBe(1);

    hori.onmouseleave();
    expect(hori.alpha).toBe(0);

    vert.onmouseenter();
    expect(vert.alpha).toBe(1);

    hori.onmouseenter();
    expect(vert.alpha).toBe(0);
    expect(hori.alpha).toBe(1);

    hori.onpointertap();
    expect(onTap).toHaveBeenCalledOnce();
    expect(onTap).toHaveBeenCalledWith(hori);
  });
});
