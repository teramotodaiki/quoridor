import { Container, Sprite, Texture } from "pixi.js";
import { SelectableTile } from "./selectable-tile";

export class Piece extends Sprite {
  constructor(texture: Texture, x: number, y: number) {
    super(texture);
    this.anchor.set(0.5);
    this.pivot.x = -32;
    this.pivot.y = -16;
    this.x = x * 64;
    this.y = y * 64;
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

  /**
   * 移動できる候補を表示する
   */
  showSelectableTiles(container: Container, callback: () => void) {
    const dirs = [
      [0, -1],
      [0, 1],
      [-1, 0],
      [1, 0],
    ];
    for (const dir of dirs) {
      const X = this.X + dir[0];
      const Y = this.Y + dir[1];
      if (X < 0 || X >= 9 || Y < 0 || Y >= 9) {
        continue; // 盤外
      }

      const tile = new SelectableTile(X, Y);
      tile.on("click", () => {
        this.X = X;
        this.Y = Y;
        container.removeChildren();
        callback();
      });
      container.addChild(tile);
    }
  }
}
