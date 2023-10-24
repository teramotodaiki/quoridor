import { Graphics } from "pixi.js";

export class SelectableTile extends Graphics {
  constructor(X: number, Y: number) {
    super();

    this.X = X;
    this.Y = Y;

    this.beginFill(0x0000ff);
    this.drawRect(0, 0, 64, 64);
    this.endFill();
    this.alpha = 0.5;
    this.width = 64;
    this.height = 64;

    this.eventMode = "static";
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
