import { Container } from "pixi.js";
import { Wall } from "./wall";
import { Piece } from "./piece";

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
      wall: Wall;
    }
  | {
      type: "piece";
      before: IPoint;
      after: IPoint;
    };

export class GameManager {
  players: Piece[] = [];
  walls: Wall[] = [];
  operations: IOperation[] = [];

  get currentPlayer() {
    return this.operations.length % this.players.length;
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

  constructor() {}

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
  }

  addWall(X: number, Y: number, direction: "horizontal" | "vertical") {
    const wall = new Wall(X, Y, direction);
    this.operations.push({
      type: "wall",
      wall,
    });
    this.walls.push(wall);
    this.updateUI();
    return wall;
  }

  /** 次のターンに進む */
  updateUI() {
    this.selectableTilesContainer.removeChildren();

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
      const { wall } = last;
      wall.destroy();
      this.walls = this.walls.filter((w) => w !== wall);
    }

    this.updateUI();
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
        for (const [mX, mY] of dirs2) {
          if (!collided(stage.walls, { X, Y }, mX, mY)) {
            selectables.push({ X: X + mX, Y: Y + mY });
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
