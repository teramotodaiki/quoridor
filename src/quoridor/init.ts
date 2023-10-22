import { Application, Assets, Container, Graphics, Sprite } from "pixi.js";

export async function init(canvas: HTMLCanvasElement) {
  // The application will create a renderer using WebGL, if possible,
  // with a fallback to a canvas render. It will also setup the ticker
  // and the root stage PIXI.Container
  const app = new Application({
    width: 640,
    height: 640,
    view: canvas,
    background: 0xffffff,
  });

  // load the texture we need
  const textureWhite = await Assets.load("assets/piece_white.png");
  const textureBlack = await Assets.load("assets/piece_black.png");

  // 9x9マスの盤面を作る
  const board = new Container();
  board.x = 32;
  board.y = 32;
  for (let y = 0; y <= 9; y++) {
    const line = new Graphics();
    line.lineStyle(1, 0x000000, 1);
    line.moveTo(0, y * 64);
    line.lineTo(576, y * 64);
    board.addChild(line);
  }
  for (let x = 0; x <= 9; x++) {
    const line = new Graphics();
    line.lineStyle(1, 0x000000, 1);
    line.moveTo(x * 64, 0);
    line.lineTo(x * 64, 576);
    board.addChild(line);
  }
  app.stage.addChild(board);

  const pieceWhite = new Sprite(textureWhite);
  pieceWhite.x = 4 * 64;
  pieceWhite.y = 0 * 64;
  board.addChild(pieceWhite);

  const pieceBlack = new Sprite(textureBlack);
  pieceBlack.x = 4 * 64;
  pieceBlack.y = 8 * 64;
  board.addChild(pieceBlack);

  // 壁
  const wall = new Graphics();
  wall.beginFill();
  const width = 6;
  wall.drawRect(64 - width / 2, 0, width, 64 * 2);
  board.addChild(wall);

  app.ticker.add((delta) => {});
}
