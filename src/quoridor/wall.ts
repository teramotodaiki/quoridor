import { Graphics } from "pixi.js";

export class Wall extends Graphics {
  static Width = 6;
  static Height = 64 * 2;

  constructor(x: number, y: number, direction: "horizontal" | "vertical") {
    super();
    // 回転の中心を中央にする
    this.pivot.x = Wall.Width / 2;
    this.pivot.y = Wall.Height / 2;

    this.beginFill();
    this.x = x * 64;
    this.y = y * 64;
    this.drawRect(0, 0, Wall.Width, Wall.Height);
    if (direction === "horizontal") {
      this.rotation = Math.PI / 2;
    }
    this.endFill();
  }
}
