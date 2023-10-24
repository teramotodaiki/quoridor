import { Sprite, Texture } from "pixi.js";

export class Piece extends Sprite {
  constructor(texture: Texture, x: number, y: number) {
    super(texture);
    this.pivot.x = texture.width / 2;
    this.pivot.y = texture.height / 2;
    this.x = x * 64 + 32;
    this.y = y * 64 + 16;
  }
}
