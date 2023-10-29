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
  loop: for (const [dx, dy] of dirs) {
    const X = self.X + dx;
    const Y = self.Y + dy;
    if (X < 0 || X >= 9 || Y < 0 || Y >= 9) {
      continue; // 盤外
    }

    //壁にぶつからないか
    const walls = stage.walls;
    // 横方向の移動でぶつかるのはverticalの壁だけ
    if (dx) {
      for (const wall of walls) {
        if (
          wall.direction === "vertical" &&
          wall.X === self.X + (dx > 0 ? 1 : 0) && // X座標が同じなら壁は駒の左にある
          (wall.Y === Y || wall.Y === Y + 1)
        ) {
          continue loop;
        }
      }
    }
    // 縦方向の移動でぶつかるのはhorizontalの壁だけ
    if (dy) {
      for (const wall of walls) {
        if (
          wall.direction === "horizontal" &&
          wall.Y === self.Y + (dy > 0 ? 1 : 0) && // Y座標が同じなら壁は駒の上にある
          (wall.X === X || wall.X === X + 1)
        ) {
          continue loop;
        }
      }
    }

    selectables.push({ X, Y });
  }
  return selectables;
}
