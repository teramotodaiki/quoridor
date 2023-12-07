import { Container, Sprite, Texture } from "pixi.js";
import { SelectableTile } from "./selectable-tile";
import { GameManager, getSelectables } from "./game-manager";

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
    const stage = GameManager.singleton;
    const pIndex = stage.players.indexOf(this);
    const selectables = getSelectables(pIndex, this, stage);

    for (const { X, Y } of selectables) {
      const tile = new SelectableTile(X, Y);
      tile.on("pointertap", () => {
        this.X = X;
        this.Y = Y;
        container.removeChildren();
        callback();
      });
      container.addChild(tile);
    }
  }
}
