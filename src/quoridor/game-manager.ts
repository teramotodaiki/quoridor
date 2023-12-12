import { Container } from "pixi.js";
import { Store } from "./base-store";
import { Piece } from "./piece";
import { UIWall } from "./ui-wall";
import { Wall } from "./wall";

interface IPoint {
  X: number;
  Y: number;
}

interface IWall extends IPoint {
  direction: "horizontal" | "vertical";
}

type IOperation =
  | {
      type: "wall";
      wall: IWall;
    }
  | {
      type: "piece";
      before: IPoint;
      after: IPoint;
    };

type OnSelect = (() => void) | undefined;

interface IOnline {
  user: "black" | "white";
}

export class GameManager extends Store {
  players: Piece[] = [];
  walls: Wall[] = [];
  operations: IOperation[] = [];
  board?: Container;

  get currentPlayer() {
    return this.operations.length % this.players.length;
  }
  get remainWallNums() {
    const nums = this.players.map(() => 10); // 最初は10枚ずつ
    for (let index = 0; index < this.operations.length; index++) {
      const element = this.operations[index];
      if (element.type === "wall") {
        const pIndex = index % this.players.length;
        nums[pIndex] -= 1;
      }
    }
    return nums;
  }

  selectableTilesContainer = new Container();

  static singleton: GameManager = new GameManager();

  static fromCopy(stage: GameManager) {
    const newStage = new GameManager();
    newStage.players = stage.players.slice();
    newStage.walls = stage.walls.slice();
    newStage.operations = stage.operations.slice();
    return newStage;
  }

  private _onSelect: OnSelect;
  get onSelect(): OnSelect {
    return this._onSelect;
  }
  set onSelect(func: () => void) {
    this._onSelect = () => {
      func();
      this._onSelect = undefined; // 一度呼んだらリセット
    };
    this.emit();
  }

  movePiece(X: number, Y: number) {
    const pIndex = this.operations.length % this.players.length;
    const player = this.players[pIndex];
    this.operations.push({
      type: "piece",
      before: { X: player.X, Y: player.Y },
      after: { X, Y },
    });
    player.X = X;
    player.Y = Y;
    this.updateUI();
    this.sync();
  }

  addWall(X: number, Y: number, direction: "horizontal" | "vertical") {
    const wall = new Wall(X, Y, direction);
    this.operations.push({
      type: "wall",
      wall: { X, Y, direction },
    });
    this.walls.push(wall);
    this.updateUI();

    this.sync();
    return wall;
  }

  /** 次のターンに進む */
  updateUI() {
    this.selectableTilesContainer.removeChildren();
    UIWall.hideAll();
    this.emit();

    if (this.isWaitingForOpponent) {
      return;
    }

    const player = this.players[this.currentPlayer];
    player.showSelectableTiles();
  }

  /** 最後の行動を１つ戻す */
  revert() {
    const last = this.operations.pop();
    if (!last) {
      return this;
    }
    const pIndex = this.operations.length % this.players.length;

    if (last.type === "piece") {
      const { before } = last;
      const player = this.players[pIndex];
      player.X = before.X;
      player.Y = before.Y;
    } else {
      const wall = this.walls.find(
        (w) =>
          last.wall.X === w.X &&
          last.wall.Y === w.Y &&
          last.wall.direction === w.direction
      );
      wall?.destroy();
      this.walls = this.walls.filter((w) => w !== wall);
    }

    this.updateUI();
  }

  online?: IOnline;
  private webSocket?: WebSocket;
  connect() {
    const webSocket = new WebSocket("ws://localhost:8787/");
    webSocket.onopen = () => {
      this.webSocket = webSocket;
    };
    webSocket.onmessage = (e) => {
      console.log(e.data);
      let operations: IOperation[];
      try {
        operations = JSON.parse(e.data);
      } catch (error) {
        console.info(e.data);
        return;
      }
      const last = operations[operations.length - 1]; // last
      if (!last) {
        return;
      }
      switch (last.type) {
        case "piece": {
          const { X, Y } = last.after;
          const pIndex = (operations.length - 1) % this.players.length;
          const player = this.players[pIndex];
          player.X = X;
          player.Y = Y;
          break;
        }
        case "wall": {
          const { X, Y, direction } = last.wall;
          const wall = new Wall(X, Y, direction);
          this.walls.push(wall);
          this.board?.addChild(wall);
          break;
        }
      }
      this.operations = operations;
      this.updateUI();
    };
    webSocket.onclose = () => {
      console.log("closed");
      this.webSocket = undefined;
      window.setTimeout(() => {
        this.connect(); // 再接続
      }, 5000);
    };
  }

  sync() {
    // とりあえず打った手を全部送れば同期できる
    this.webSocket?.send(JSON.stringify(this.operations));
  }

  /** オンライン対戦で、相手の操作を待っている状態 */
  get isWaitingForOpponent() {
    if (!this.online) {
      return false;
    }
    const playingUserIndex = this.online.user === "white" ? 0 : 1;
    return playingUserIndex !== this.currentPlayer;
  }
}

export function getSelectables(
  pIndex: number,
  self: IPoint,
  stage: GameManager
) {
  const selectables: { X: number; Y: number }[] = [];
  const dirs = [
    [0, -1],
    [0, 1],
    [-1, 0],
    [1, 0],
  ];
  const enemy = stage.players[1 - pIndex];

  for (const [dx, dy] of dirs) {
    const X = self.X + dx;
    const Y = self.Y + dy;
    if (X < 0 || X >= 9 || Y < 0 || Y >= 9) {
      continue; // 盤外
    }

    //壁にぶつからないか
    const walls = stage.walls;
    const isCollided = collided(walls, self, dx, dy);
    if (isCollided) {
      continue;
    }

    // 相手の駒があれば飛び越える
    if (enemy.X === X && enemy.Y === Y) {
      //壁にぶつからないか
      const isCollided = collided(stage.walls, { X, Y }, dx, dy);
      if (!isCollided) {
        // 飛び越える
        const jumpX = X + dx;
        const jumpY = Y + dy;
        if (jumpX < 0 || jumpX >= 9 || jumpY < 0 || jumpY >= 9) {
          continue; // 盤外
        }
        selectables.push({ X: X + dx, Y: Y + dy });
      } else {
        // 飛び越えた先に壁がある場合、左右に移動できる
        const dirs2 = dx
          ? [
              [0, -1],
              [0, 1],
            ]
          : [
              [-1, 0],
              [1, 0],
            ];
        for (const [jumpx, jumpy] of dirs2) {
          const jumpX = X + jumpx;
          const jumpY = Y + jumpy;
          if (jumpX < 0 || jumpX >= 9 || jumpY < 0 || jumpY >= 9) {
            continue; // 盤外
          }
          if (!collided(stage.walls, { X, Y }, jumpx, jumpy)) {
            selectables.push({ X: jumpX, Y: jumpY });
          }
        }
      }
    } else {
      selectables.push({ X, Y });
    }
  }
  return selectables;
}

export function collided(walls: IWall[], pos: IPoint, dx: number, dy: number) {
  if (Math.abs(dx) + Math.abs(dy) !== 1) {
    throw new Error(`(${dx}, ${dy}) is not base vector`);
  }
  const X = pos.X + dx;
  const Y = pos.Y + dy;

  // 横方向の移動でぶつかるのはverticalの壁だけ
  if (dx) {
    for (const wall of walls) {
      if (
        wall.direction === "vertical" &&
        wall.X === pos.X + (dx > 0 ? 1 : 0) && // X座標が同じなら壁は駒の左にある
        (wall.Y === Y || wall.Y === Y + 1)
      ) {
        return true;
      }
    }
  }
  // 縦方向の移動でぶつかるのはhorizontalの壁だけ
  if (dy) {
    for (const wall of walls) {
      if (
        wall.direction === "horizontal" &&
        wall.Y === pos.Y + (dy > 0 ? 1 : 0) && // Y座標が同じなら壁は駒の上にある
        (wall.X === X || wall.X === X + 1)
      ) {
        return true;
      }
    }
  }

  return false;
}

/**
 * 指定したプレイヤーがゴールにたどり着けるかどうか
 */
export function canReachGoal(pIndex: number, stage: GameManager) {
  const visited: boolean[][] = Array.from({ length: 9 }, () => []);
  const queue: [number, number][] = [];

  const start = stage.players[pIndex];
  const goalY = pIndex === 0 ? 8 : 0;
  queue.push([start.X, start.Y]);

  while (queue.length) {
    const [X, Y] = queue.shift()!;
    if (Y === goalY) {
      return true; // ゴールにたどり着けた
    }
    visited[X][Y] = true;

    const selectables = getSelectables(pIndex, { X, Y }, stage);
    for (const point of selectables) {
      if (!visited[point.X][point.Y]) {
        queue.push([point.X, point.Y]);
      }
    }
  }

  return false; // ゴールにたどり着けない
}

export function canPutWall(stage: GameManager, target: Wall) {
  // すでに置かれている場合や、隣り合うマスには置けない
  for (const wall of stage.walls) {
    const dx = Math.abs(wall.X - target.X);
    const dy = Math.abs(wall.Y - target.Y);
    const horizontal =
      target.direction === "horizontal" && wall.direction === "horizontal";
    const vertical =
      target.direction === "vertical" && wall.direction === "vertical";
    if (
      (wall.X === target.X && wall.Y === target.Y) ||
      (horizontal && dx === 1 && dy === 0) ||
      (vertical && dx === 0 && dy === 1)
    ) {
      return false;
    }
  }

  // ゴールへの道を完全に塞ぐ場合は置けない
  const nextStage = GameManager.fromCopy(stage);
  nextStage.walls = nextStage.walls.concat([target]);
  for (let pIndex = 0; pIndex < stage.players.length; pIndex++) {
    if (!canReachGoal(pIndex, nextStage)) {
      return false;
    }
  }

  return true;
}
