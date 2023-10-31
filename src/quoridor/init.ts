import { Application, Assets, Container, Graphics, Sprite } from "pixi.js";
import { Wall } from "./wall";
import { Piece } from "./piece";

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

  const board = new Container();

  // 盤をクリックして壁を配置する
  const wallArea = new Sprite();
  wallArea.width = 576;
  wallArea.height = 576;
  wallArea.eventMode = "static";
  board.addChild(wallArea);
  wallArea.on("click", (event) => {
    const boardPosition = board.toLocal(event.global);
    const mouseX = Math.floor(boardPosition.x / 64);
    const mouseY = Math.floor(boardPosition.y / 64);
    const wall = new Wall(mouseX, mouseY, "horizontal"); // 適当
    board.addChild(wall);
    nextPlayer();
  });

  const selectableTileContainer = new Container();
  board.addChild(selectableTileContainer);

  // 9x9マスの盤面を作る
  board.x = 32;
  board.y = 32;
  for (let y = 1; y < 9; y++) {
    const line = new Graphics();
    line.lineStyle(1, "#2e0f01", 1);
    line.moveTo(0, y * 64);
    line.lineTo(576, y * 64);
    board.addChild(line);
  }
  for (let x = 1; x < 9; x++) {
    const line = new Graphics();
    line.lineStyle(1, "#2e0f01", 1);
    line.moveTo(x * 64, 0);
    line.lineTo(x * 64, 576);
    board.addChild(line);
  }

  // プレイヤーの駒
  const pieceWhite = new Piece(textureWhite, 4, 0);
  board.addChild(pieceWhite);
  const pieceBlack = new Piece(textureBlack, 4, 8);
  board.addChild(pieceBlack);

  // 壁
  const wall1 = new Wall(2, 2, "vertical");
  board.addChild(wall1);

  const wall2 = new Wall(5, 1, "horizontal");
  board.addChild(wall2);

  const background = new Sprite(await Assets.load("assets/background.png"));
  background.pivot.x = 512;
  background.pivot.y = 512;
  background.width = 1024 * 1.05;
  background.height = 1024 * 1.05;
  background.x = 320 + 4;
  background.y = 320 + 42;
  app.stage.addChild(background);

  app.stage.addChild(board);

  const players = [pieceWhite, pieceBlack];
  let currentPlayer = 0;
  let beginTurn = true;

  function nextPlayer() {
    selectableTileContainer.removeChildren();
    currentPlayer = (currentPlayer + 1) % players.length;
    beginTurn = true;
  }

  app.ticker.add((delta) => {
    if (beginTurn) {
      const piece = players[currentPlayer];
      piece.showSelectableTiles(selectableTileContainer, nextPlayer);
      beginTurn = false;
    }
  });
}
