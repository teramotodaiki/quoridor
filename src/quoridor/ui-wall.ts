import { Container, Graphics } from "pixi.js";
import { Wall } from "./wall";

export class UIWall extends Graphics {
  private static ref = new Map<string, UIWall>();
  static get(X: number, Y: number, direction: "horizontal" | "vertical") {
    return UIWall.ref.get(`${X}_${Y}_${direction}`);
  }

  static Width = 8;
  static Height = 64; // 重ならないようにする

  direction: "horizontal" | "vertical";

  constructor(X: number, Y: number, direction: "horizontal" | "vertical") {
    super();
    UIWall.ref.set(`${X}_${Y}_${direction}`, this);

    // 回転の中心を中央にする
    this.pivot.x = UIWall.Width / 2;
    this.pivot.y = UIWall.Height / 2;
    this.X = X;
    this.Y = Y;
    this.direction = direction;

    this.beginFill("0x8a2be2");
    this.drawRect(0, 0, UIWall.Width, UIWall.Height);

    if (direction === "horizontal") {
      this.rotation = Math.PI / 2;
      this.scale.y = -1; // 左上から光が当たっている感じを出す
    }
    this.endFill();
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

  remove() {
    this.eventMode = "none";
    this.visible = false;
  }
}

interface CreateUIWallsParams {
  nextPlayer: () => void;
  board: Container;
}

export function createUIWalls(params: CreateUIWallsParams) {
  const uiWallContainer = new Container();
  let _showingUIWall: UIWall | null = null;
  const showUIWall = (uiWall: UIWall) => {
    if (_showingUIWall) {
      _showingUIWall.alpha = 0;
    }
    uiWall.alpha = 1;
    _showingUIWall = uiWall;
  };
  for (let x = 1; x < 9; x++) {
    for (let y = 1; y < 9; y++) {
      for (const direction of ["horizontal", "vertical"] as const) {
        const uiWall = new UIWall(x, y, direction);
        uiWall.eventMode = "static";
        uiWall.alpha = 0;
        uiWall.on("mouseenter", () => {
          showUIWall(uiWall);
        });
        uiWall.on("mouseleave", () => {
          uiWall.alpha = 0;
        });
        uiWall.on("pointertap", () => {
          // mouseenter or 一度タップしてから、もう一度押すと壁を置く
          if (uiWall.alpha === 0) {
            showUIWall(uiWall);
          } else {
            const wall = new Wall(x, y, direction);
            params.board.addChild(wall);
            params.nextPlayer();

            // このマスと隣のマスにはもう置けない
            UIWall.get(x, y, direction)?.remove();
            if (direction === "horizontal") {
              UIWall.get(x, y, "vertical")?.remove();
              UIWall.get(x - 1, y, direction)?.remove();
              UIWall.get(x + 1, y, direction)?.remove();
            } else {
              UIWall.get(x, y, "horizontal")?.remove();
              UIWall.get(x, y - 1, direction)?.remove();
              UIWall.get(x, y + 1, direction)?.remove();
            }
          }
        });
        uiWallContainer.addChild(uiWall);
      }
    }
  }
  return uiWallContainer;
}
