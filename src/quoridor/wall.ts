import { Graphics } from "pixi.js";

export class Wall extends Graphics {
  static Width = 8;
  static Height = 64 * 2 - 8; // 少し短くすることで視認性を上げる

  constructor(x: number, y: number, direction: "horizontal" | "vertical") {
    super();
    // 回転の中心を中央にする
    this.pivot.x = Wall.Width / 2;
    this.pivot.y = Wall.Height / 2;
    this.x = x * 64;
    this.y = y * 64;

    // 光沢
    this.beginFill("#2e0f01");
    this.drawRect(0, 0, Wall.Width, Wall.Height);

    if (direction === "horizontal") {
      this.rotation = Math.PI / 2;
      this.scale.y = -1; // 左上から光が当たっている感じを出す
    }
    this.endFill();
  }
}
