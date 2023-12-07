import { Graphics } from "pixi.js";

export class Wall extends Graphics {
  static Width = 8;
  static Height = 64 * 2 - 8; // 少し短くすることで視認性を上げる

  direction: "horizontal" | "vertical";

  constructor(X: number, Y: number, direction: "horizontal" | "vertical") {
    super();
    // 回転の中心を中央にする
    this.pivot.x = Wall.Width / 2;
    this.pivot.y = Wall.Height / 2;
    this.X = X;
    this.Y = Y;
    this.direction = direction;

    // 光沢
    this.beginFill("#2e0f01");
    this.drawRect(0, 0, Wall.Width, Wall.Height);

    if (direction === "horizontal") {
      this.rotation = Math.PI / 2;
      this.scale.y = -1; // 左上から光が当たっている感じを出す
    }
    this.endFill();
  }

  get X() {
    return Math.floor(this.x / 64);
  }
  set X(x: number) {
    this.x = x * 64;
  }
  get Y() {
    return Math.floor(this.y / 64);
  }
  set Y(y: number) {
    this.y = y * 64;
  }
}
