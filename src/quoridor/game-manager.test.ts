import { describe, expect, test } from "vitest";

import {
  GameManager,
  canPutWall,
  canReachGoal,
  collided,
  getSelectables,
} from "./game-manager";

// テストしやすいフォーマットに加工する
function tuple(positions: { X: number; Y: number }[]) {
  const sorted = [...positions].sort((a, b) => a.Y - b.Y + 0.01 * (a.X - b.X));
  const tuples = sorted.map((v) => [v.X, v.Y]);
  return tuples;
}

// テスト用の使いやすい関数
function mockStage() {
  const stage = new GameManager();
  stage.players = [
    { X: 4, Y: 0 },
    { X: 4, Y: 8 },
  ];

  return {
    stage,
    get(player: number) {
      const target = stage.players[player];
      const selectables = getSelectables(player, target, stage);
      return tuple(selectables);
    },
    addWall(X: number, Y: number, direction: "horizontal" | "vertical") {
      stage.walls.push({ X, Y, direction });
    },
  };
}

describe("getSelectables", () => {
  test("initialized", () => {
    const { get } = mockStage();

    expect(get(0)).toStrictEqual([
      [3, 0],
      [5, 0],
      [4, 1],
    ]);
    expect(get(1)).toStrictEqual([
      [4, 7],
      [3, 8],
      [5, 8],
    ]);
  });

  test("a horizontal wall is by the white", () => {
    const { stage, get, addWall } = mockStage();
    // 白の前に壁を置く
    addWall(4, 1, "horizontal");
    // 横にだけ移動できる
    expect(get(0)).toStrictEqual([
      [3, 0],
      [5, 0],
    ]);
    // ひとつ右のマスにおいても結果は同じ
    stage.walls[0].X = 5;
    expect(get(0)).toStrictEqual([
      [3, 0],
      [5, 0],
    ]);
    // 黒は自由に動ける
    expect(get(1)).toStrictEqual([
      [4, 7],
      [3, 8],
      [5, 8],
    ]);
  });

  test("a horizontal wall is by the black", () => {
    const { stage, get, addWall } = mockStage();
    // 黒の前も壁を置く
    addWall(4, 8, "horizontal");
    // 横にだけ移動できる
    expect(get(1)).toStrictEqual([
      [3, 8],
      [5, 8],
    ]);
    // ひとつ右のマスにおいても結果は同じ
    stage.walls[0].X = 5;
    expect(get(1)).toStrictEqual([
      [3, 8],
      [5, 8],
    ]);
    // 白は自由に動ける
    expect(get(0)).toStrictEqual([
      [3, 0],
      [5, 0],
      [4, 1],
    ]);
  });

  test("a vertical wall is by the white", () => {
    const { stage, get, addWall } = mockStage();
    // 白の左に壁を置く
    addWall(4, 1, "vertical");
    // 下と右にだけ移動できる
    expect(get(0)).toStrictEqual([
      [5, 0],
      [4, 1],
    ]);
    // ひとつ右のマスにおいた場合、下と左に移動できる
    stage.walls[0].X = 5;
    expect(get(0)).toStrictEqual([
      [3, 0],
      [4, 1],
    ]);
  });

  test("a vertical wall is by the black", () => {
    const { stage, get, addWall } = mockStage();
    // 黒の左に壁を置く
    addWall(4, 8, "vertical");
    // 上と右にだけ移動できる
    expect(get(1)).toStrictEqual([
      [4, 7],
      [5, 8],
    ]);
    // ひとつ右のマスにおいた場合、上と左に移動できる
    stage.walls[0].X = 5;
    expect(get(1)).toStrictEqual([
      [4, 7],
      [3, 8],
    ]);
  });

  // 相手の駒を飛び越える
  test("jump over the other piece", () => {
    const { stage, get } = mockStage();
    stage.players[0] = { X: 4, Y: 4 };
    stage.players[1] = { X: 4, Y: 5 };

    expect(get(0)).toStrictEqual([
      [4, 3],
      [3, 4],
      [5, 4],
      [4, 6],
    ]);
  });

  // 飛び越えた先に壁があれば左右に移動できる
  test("jump over the other piece and there is a wall", () => {
    const { stage, get, addWall } = mockStage();
    stage.players[0] = { X: 4, Y: 4 };
    stage.players[1] = { X: 4, Y: 5 };
    addWall(4, 6, "horizontal");

    expect(get(0)).toStrictEqual([
      [4, 3],
      [3, 4],
      [5, 4],
      [3, 5],
      [5, 5],
    ]);
  });
});

describe("collided", () => {
  test("collide horizontal", () => {
    const pos = { X: 4, Y: 3 };
    const wall = { X: 4, Y: 4, direction: "horizontal" } as const;
    const actual = collided([wall], pos, 0, 1);
    expect(actual).toBe(true);
  });

  test("not accept invalid direction vector", () => {
    const pos = { X: 4, Y: 3 };
    expect(() => collided([], pos, 0, 0)).toThrow();
    expect(() => collided([], pos, 2, 0)).toThrow();
    expect(() => collided([], pos, -2, 0)).toThrow();
    expect(() => collided([], pos, 1, 1)).toThrow();
    expect(() => collided([], pos, 1, -1)).toThrow();
  });
});

describe("canReachGoal", () => {
  test("No walls", () => {
    const { stage } = mockStage();
    // 両方ともゴールにたどり着ける
    expect(canReachGoal(0, stage)).toBe(true);
    expect(canReachGoal(1, stage)).toBe(true);
  });

  test("Across the wall", () => {
    const { stage, addWall } = mockStage();
    addWall(1, 4, "horizontal");
    addWall(3, 4, "horizontal");
    addWall(5, 4, "horizontal");
    addWall(7, 4, "horizontal");
    addWall(8, 4, "vertical");
    addWall(8, 5, "horizontal");
    // 両方ともゴールにたどり着けない
    expect(canReachGoal(0, stage)).toBe(false);
    expect(canReachGoal(1, stage)).toBe(false);
    // 壁の向こう側にいればゴールにたどり着ける
    stage.players[0] = { X: 4, Y: 6 };
    expect(canReachGoal(0, stage)).toBe(true);
    stage.players[1] = { X: 4, Y: 2 };
    expect(canReachGoal(1, stage)).toBe(true);
  });

  test("Can jump over the opponent", () => {
    const { stage, addWall } = mockStage();
    stage.players[0] = { X: 4, Y: 3 };
    stage.players[1] = { X: 4, Y: 4 };
    addWall(1, 4, "horizontal");
    addWall(3, 4, "horizontal");
    addWall(6, 4, "horizontal");
    addWall(8, 4, "horizontal");
    // 相手を飛び越えればゴールにたどり着ける
    expect(canReachGoal(0, stage)).toBe(true);
    expect(canReachGoal(1, stage)).toBe(true);
  });
});

describe("canPutWall", () => {
  test("initialized", () => {
    const { stage } = mockStage();
    expect(canPutWall(stage, { X: 1, Y: 2, direction: "horizontal" })).toBe(
      true
    );
    expect(canPutWall(stage, { X: 3, Y: 4, direction: "vertical" })).toBe(true);
  });

  test("put a wall by the other wall", () => {
    const { stage, addWall } = mockStage();
    addWall(1, 2, "horizontal");
    expect(canPutWall(stage, { X: 1, Y: 2, direction: "horizontal" })).toBe(
      false
    );
    expect(canPutWall(stage, { X: 2, Y: 2, direction: "horizontal" })).toBe(
      false
    );
    expect(canPutWall(stage, { X: 1, Y: 2, direction: "vertical" })).toBe(
      false
    );
    // 向きが違えば隣にも置ける
    expect(canPutWall(stage, { X: 2, Y: 2, direction: "vertical" })).toBe(true);
    // ひとつ上のマスには置ける
    expect(canPutWall(stage, { X: 1, Y: 1, direction: "horizontal" })).toBe(
      true
    );
  });
});
