import { describe, expect, test } from "vitest";

import { IStage, collided, getSelectables } from "./stage";

// テストしやすいフォーマットに加工する
function tuple(positions: { X: number; Y: number }[]) {
  const sorted = [...positions].sort((a, b) => a.Y - b.Y + 0.01 * (a.X - b.X));
  const tuples = sorted.map((v) => [v.X, v.Y]);
  return tuples;
}

// テスト用の使いやすい関数
function mockStage() {
  const stage: IStage = {
    players: [
      { X: 4, Y: 0 },
      { X: 4, Y: 8 },
    ],
    walls: [],
  };

  return {
    ...stage,
    get(player: number) {
      const target = stage.players[player];
      const selectables = getSelectables(target, stage);
      return tuple(selectables);
    },
    addWall(X: number, Y: number, direction: "horizontal" | "vertical") {
      stage.walls.push({ X, Y, direction });
    },
  };
}

describe("getSelectables", () => {
  test("initialized", () => {
    const stage = mockStage();
    expect(stage.get(0)).toStrictEqual([
      [3, 0],
      [5, 0],
      [4, 1],
    ]);
    expect(stage.get(1)).toStrictEqual([
      [4, 7],
      [3, 8],
      [5, 8],
    ]);
  });

  test("a horizontal wall is by the white", () => {
    const stage = mockStage();
    // 白の前に壁を置く
    stage.addWall(4, 1, "horizontal");
    // 横にだけ移動できる
    expect(stage.get(0)).toStrictEqual([
      [3, 0],
      [5, 0],
    ]);
    // ひとつ右のマスにおいても結果は同じ
    stage.walls[0].X = 5;
    expect(stage.get(0)).toStrictEqual([
      [3, 0],
      [5, 0],
    ]);
    // 黒は自由に動ける
    expect(stage.get(1)).toStrictEqual([
      [4, 7],
      [3, 8],
      [5, 8],
    ]);
  });

  test("a horizontal wall is by the black", () => {
    const stage = mockStage();
    // 黒の前も壁を置く
    stage.addWall(4, 8, "horizontal");
    // 横にだけ移動できる
    expect(stage.get(1)).toStrictEqual([
      [3, 8],
      [5, 8],
    ]);
    // ひとつ右のマスにおいても結果は同じ
    stage.walls[0].X = 5;
    expect(stage.get(1)).toStrictEqual([
      [3, 8],
      [5, 8],
    ]);
    // 白は自由に動ける
    expect(stage.get(0)).toStrictEqual([
      [3, 0],
      [5, 0],
      [4, 1],
    ]);
  });

  test("a vertical wall is by the white", () => {
    const stage = mockStage();
    // 白の左に壁を置く
    stage.addWall(4, 1, "vertical");
    // 下と右にだけ移動できる
    expect(stage.get(0)).toStrictEqual([
      [5, 0],
      [4, 1],
    ]);
    // ひとつ右のマスにおいた場合、下と左に移動できる
    stage.walls[0].X = 5;
    expect(stage.get(0)).toStrictEqual([
      [3, 0],
      [4, 1],
    ]);
  });

  test("a vertical wall is by the black", () => {
    const stage = mockStage();
    // 黒の左に壁を置く
    stage.addWall(4, 8, "vertical");
    // 上と右にだけ移動できる
    expect(stage.get(1)).toStrictEqual([
      [4, 7],
      [5, 8],
    ]);
    // ひとつ右のマスにおいた場合、上と左に移動できる
    stage.walls[0].X = 5;
    expect(stage.get(1)).toStrictEqual([
      [4, 7],
      [3, 8],
    ]);
  });

  // 相手の駒を飛び越える
  test("jump over the other piece", () => {
    const stage = mockStage();
    stage.players[0] = { X: 4, Y: 4 };
    stage.players[1] = { X: 4, Y: 5 };

    expect(stage.get(0)).toStrictEqual([
      [4, 3],
      [3, 4],
      [5, 4],
      [4, 6],
    ]);
  });

  // 飛び越えた先に壁があれば左右に移動できる
  test("jump over the other piece and there is a wall", () => {
    const stage = mockStage();
    stage.players[0] = { X: 4, Y: 4 };
    stage.players[1] = { X: 4, Y: 5 };
    stage.addWall(4, 6, "horizontal");

    expect(stage.get(0)).toStrictEqual([
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
