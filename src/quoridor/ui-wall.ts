import { Container, Graphics } from "pixi.js";
import { GameManager, canPutWall } from "./game-manager";

export class UIWall extends Graphics {
  private static ref = new Map<string, UIWall>();
  static get(X: number, Y: number, direction: "horizontal" | "vertical") {
    return UIWall.ref.get(`${X}_${Y}_${direction}`);
  }

  static Width = 8;
  static Height = 64; // 重ならないようにする

  direction: "horizontal" | "vertical";
  onTap: (self: UIWall) => void;

  constructor(
    X: number,
    Y: number,
    direction: "horizontal" | "vertical",
    onTap: (self: UIWall) => void
  ) {
    super();
    UIWall.ref.set(`${X}_${Y}_${direction}`, this);

    // 回転の中心を中央にする
    this.pivot.x = UIWall.Width / 2;
    this.pivot.y = UIWall.Height / 2;
    this.X = X;
    this.Y = Y;
    this.direction = direction;

    this.eventMode = "static";
    this.alpha = 0;
    this.onTap = onTap;

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

  show() {
    this.alpha = 1;
  }

  hide() {
    this.alpha = 0;
  }

  static hideAll() {
    for (const uiWall of UIWall.ref.values()) {
      uiWall.hide();
    }
  }

  onpointerenter = () => {
    const stage = GameManager.singleton;
    if (stage.isWaitingForOpponent) {
      return;
    }
    UIWall.hideAll();
    this.show();
    // 決定ボタンを押したときに壁を置く
    stage.onSelect = () => {
      this.hide();
      if (!canPutWall(stage, this)) {
        alert("そこには置けません");
        return;
      }
      this.onTap(this);
    };
  };

  onmousedown = () => {
    // マウスの場合はクリックで決定できる
    const stage = GameManager.singleton;
    if (stage.isWaitingForOpponent) {
      return;
    }
    stage.onSelect?.();
  };
}

interface CreateUIWallsParams {
  onTap(self: UIWall): void;
}

export function createUIWalls(params: CreateUIWallsParams) {
  const uiWallContainer = new Container();
  for (let x = 1; x < 9; x++) {
    for (let y = 1; y < 9; y++) {
      for (const direction of ["horizontal", "vertical"] as const) {
        const uiWall = new UIWall(x, y, direction, params.onTap);
        uiWallContainer.addChild(uiWall);
      }
    }
  }
  return uiWallContainer;
}
