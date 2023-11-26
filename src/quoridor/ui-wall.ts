import { Container, Graphics } from "pixi.js";

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

  remove() {
    this.eventMode = "none";
    this.visible = false;
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

  onmouseenter = () => {
    UIWall.hideAll();
    this.show();
  };

  onmouseleave = () => {
    this.hide();
  };

  onpointertap = () => {
    // mouseenter or 一度タップしてから、もう一度押すと壁を置く
    if (this.alpha === 0) {
      UIWall.hideAll();
      this.show();
    } else {
      const { X, Y, direction } = this;

      // このマスと隣のマスにはもう置けない
      UIWall.get(X, Y, direction)?.remove();
      if (direction === "horizontal") {
        UIWall.get(X, Y, "vertical")?.remove();
        UIWall.get(X - 1, Y, direction)?.remove();
        UIWall.get(X + 1, Y, direction)?.remove();
      } else {
        UIWall.get(X, Y, "horizontal")?.remove();
        UIWall.get(X, Y - 1, direction)?.remove();
        UIWall.get(X, Y + 1, direction)?.remove();
      }

      this.onTap(this);
    }
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
