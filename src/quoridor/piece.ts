import { Container, Sprite, Texture } from "pixi.js";
import { SelectableTile } from "./selectable-tile";
import { Wall } from "./wall";

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
    loop: for (const [dx, dy] of dirs) {
      const X = this.X + dx;
      const Y = this.Y + dy;
      if (X < 0 || X >= 9 || Y < 0 || Y >= 9) {
        continue; // 盤外
      }

      //壁にぶつからないか
      const walls = Wall.collections;
      // 横方向の移動でぶつかるのはverticalの壁だけ
      if (dx) {
        for (const wall of walls) {
          if (
            wall.direction === "vertical" &&
            wall.X === this.X + (dx > 0 ? 1 : 0) && // X座標が同じなら壁は駒の左にある
            (wall.Y === Y || wall.Y === Y + 1)
          ) {
            continue loop;
          }
        }
      }
      // 縦方向の移動でぶつかるのはhorizontalの壁だけ
      if (dy) {
        for (const wall of walls) {
          if (
            wall.direction === "horizontal" &&
            wall.Y === this.Y + (dy > 0 ? 1 : 0) && // Y座標が同じなら壁は駒の上にある
            (wall.X === X || wall.X === X + 1)
          ) {
            continue loop;
          }
        }
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
