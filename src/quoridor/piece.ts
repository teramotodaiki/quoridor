import { Sprite, Texture } from "pixi.js";

export class Piece extends Sprite {
  constructor(texture: Texture, x: number, y: number) {
    super(texture);
    this.anchor.set(0.5);
    this.pivot.x = -32;
    this.pivot.y = -16;
    this.x = x * 64;
    this.y = y * 64;
  }
}
