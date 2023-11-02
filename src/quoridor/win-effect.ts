import { Container, Text, TextStyle } from "pixi.js";

export class WinEffect extends Container {
  constructor(type: "black" | "white") {
    super();
    const style = new TextStyle({
      fontFamily: '"Lucida Sans Unicode", "Lucida Grande", sans-serif',
      fill: type === "black" ? 0x000000 : 0xffffff,
      stroke: type === "black" ? 0xffffff : 0x000000,
      fontSize: 64,
      strokeThickness: 4,
    });
    const message = `${type === "black" ? "Black" : "White"} Win!`;
    const text = new Text(message, style);
    text.x = 640 / 2;
    text.y = 640 / 2;
    text.anchor.set(0.5);
    this.addChild(text);
  }
}
