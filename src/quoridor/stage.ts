import { Piece } from "./piece";
import { Wall } from "./wall";

interface IPoint {
  X: number;
  Y: number;
}

interface IWall extends IPoint {
  direction: "horizontal" | "vertical";
}

export interface IStage {
  players: IPoint[];
  walls: IWall[];
}

export function stageFromCollections() {
  const stage: IStage = {
    players: Piece.collections,
    walls: Wall.collections,
  };
  return stage;
}

export function getSelectables(self: IPoint, stage: IStage) {
  const selectables: { X: number; Y: number }[] = [];
  const dirs = [
    [0, -1],
    [0, 1],
    [-1, 0],
    [1, 0],
  ];
  const enemy = stage.players[1 - stage.players.indexOf(self)];
  // 相手の駒があれば飛び越える
  for (const [i, [dx, dy]] of [...dirs].entries()) {
    if (enemy.X === self.X + dx && enemy.Y === self.Y + dy) {
      dirs.splice(i, 1);
      dirs.push([dx * 2, dy * 2]);
    }
  }
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

    selectables.push({ X, Y });
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
