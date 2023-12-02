import { Piece } from "./piece";
import { Wall } from "./wall";

interface IPoint {
  X: number;
  Y: number;
}

interface IWall extends IPoint {
  direction: "horizontal" | "vertical";
}

export class GameManager {
  players: IPoint[];
  walls: IWall[];

  static fromCollections() {
    const stage = new GameManager();
    stage.players = Piece.collections;
    stage.walls = Wall.collections;
    return stage;
  }

  constructor() {
    this.players = [];
    this.walls = [];
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
