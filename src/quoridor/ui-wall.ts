import { Graphics } from "pixi.js";

export class UIWall extends Graphics {
  private static ref = new Map<string, UIWall>();
  static get(X: number, Y: number, direction: "horizontal" | "vertical") {
    return UIWall.ref.get(`${X}_${Y}_${direction}`);
  }

  static Width = 8;
  static Height = 64; // 重ならないようにする

  direction: "horizontal" | "vertical";

  constructor(X: number, Y: number, direction: "horizontal" | "vertical") {
    super();
    UIWall.ref.set(`${X}_${Y}_${direction}`, this);

    // 回転の中心を中央にする
    this.pivot.x = UIWall.Width / 2;
    this.pivot.y = UIWall.Height / 2;
    this.X = X;
    this.Y = Y;
    this.direction = direction;

    this.beginFill("0x8a2be2");
    this.drawRect(0, 0, UIWall.Width, UIWall.Height);

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

  remove() {
    this.eventMode = "none";
    this.visible = false;
  }
}
