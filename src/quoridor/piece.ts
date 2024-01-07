import { Sprite } from "pixi.js";
import { GameManager, getSelectables } from "./game-manager";
import { SelectableTile } from "./selectable-tile";

export class Piece extends Sprite {
  constructor(x: number, y: number) {
    super();
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
  showSelectableTiles() {
    const stage = GameManager.singleton;
    const pIndex = stage.players.indexOf(this);
    if (pIndex === -1) {
      throw new Error("player not found");
    }
    const enemy = stage.players[1 - pIndex];
    const selectables = getSelectables(stage, this, enemy);

    for (const { X, Y } of selectables) {
      const tile = new SelectableTile(X, Y);
      tile.on("pointertap", () => {
        stage.movePiece(X, Y);
      });
      stage.selectableTilesContainer.addChild(tile);
    }
  }
}
