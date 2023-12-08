import { Application, Assets, Container, Graphics, Sprite } from "pixi.js";
import { Piece } from "./piece";
import { Store, remainWallNumsAtom } from "./store";
import { createUIWalls } from "./ui-wall";
import { WinEffect } from "./win-effect";
import { GameManager } from "./game-manager";

interface InitParams {
  canvas: HTMLCanvasElement;
  store: Store;
}

export async function init({ canvas, store }: InitParams) {
  // The application will create a renderer using WebGL, if possible,
  // with a fallback to a canvas render. It will also setup the ticker
  // and the root stage PIXI.Container
  const app = new Application({
    width: 640,
    height: 640,
    view: canvas,
    background: 0xffffff,
  });

  // PIXI.jsは自動的にcanvasに[touch-action="none"]属性を付与する
  // それだとピンチイン出来なくて不便なので、"auto"に戻す
  if (app.view.style) {
    app.view.style.touchAction = "auto";
  }

  const stage = GameManager.singleton;

  // load the texture we need
  const textureWhite = await Assets.load("assets/piece_white.png");
  const textureBlack = await Assets.load("assets/piece_black.png");

  const board = new Container();

  // 選択可能な壁を表示する
  const uiWallContainer = createUIWalls({
    onTap({ X, Y, direction }) {
      store.set(remainWallNumsAtom, (remainWallNums) => {
        return remainWallNums.map((num, i) =>
          i === stage.currentPlayer ? num - 1 : num
        );
      });

      const wall = stage.addWall(X, Y, direction);
      board.addChild(wall);
    },
  });
  board.addChild(uiWallContainer);

  board.addChild(stage.selectableTilesContainer);

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
  stage.players = [pieceWhite, pieceBlack];

  const background = new Sprite(await Assets.load("assets/background.png"));
  background.pivot.x = 512;
  background.pivot.y = 512;
  background.width = 1024 * 1.05;
  background.height = 1024 * 1.05;
  background.x = 320 + 4;
  background.y = 320 + 42;
  app.stage.addChild(background);

  app.stage.addChild(board);

  let isPlaying = true;
  app.ticker.add(() => {
    if (isPlaying) {
      // 勝敗判定
      const winner =
        pieceBlack.Y === 0 ? "black" : pieceWhite.Y === 8 ? "white" : null;
      if (winner) {
        const winEffect = new WinEffect(winner);
        app.stage.addChild(winEffect);
        isPlaying = false;
      }
    }
  });

  stage.updateUI(); // 最初のターン

  return GameManager.singleton;
}
