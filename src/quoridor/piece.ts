import { Container, Graphics, Sprite, Texture } from "pixi.js";

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
  showSelectableTiles(board: Container) {
    const dirs = [
      [0, -1],
      [0, 1],
      [-1, 0],
      [1, 0],
    ];
    const tiles: Graphics[] = [];
    for (const dir of dirs) {
      const X = this.X + dir[0];
      const Y = this.Y + dir[1];
      if (X < 0 || X >= 9 || Y < 0 || Y >= 9) {
        continue; // 盤外
      }

      const tile = new Graphics();
      tile.beginFill(0x0000ff);
      tile.drawRect(0, 0, 64, 64);
      tile.endFill();
      tile.alpha = 0.5;
      tile.width = 64;
      tile.height = 64;
      tile.x = X * 64;
      tile.y = Y * 64;
      tile.on("click", () => {
        this.X = X;
        this.Y = Y;
        tiles.forEach((tile) => {
          board.removeChild(tile);
        });
        // 動作確認のため、続けて入力を受け付ける
        this.showSelectableTiles(board);
      });
      tile.eventMode = "static";
      board.addChild(tile);
      tiles.push(tile);
    }
  }
}
