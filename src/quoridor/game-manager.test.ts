import { describe, expect, test } from "vitest";

import { Texture } from "pixi.js";
import {
  GameManager,
  canPutWall,
  canReachGoal,
  collided,
  getSelectables,
} from "./game-manager";
import { Wall } from "./wall";
import { Piece } from "./piece";

// テストしやすいフォーマットに加工する
function tuple(positions: { X: number; Y: number }[]) {
  const sorted = [...positions].sort((a, b) => a.Y - b.Y + 0.01 * (a.X - b.X));
  const tuples = sorted.map((v) => [v.X, v.Y]);
  return tuples;
}

function p(X: number, Y: number) {
  return new Piece(Texture.EMPTY, X, Y);
}

// テスト用の使いやすい関数
function mockStage() {
  const stage = (GameManager.singleton = new GameManager());
  stage.players = [p(4, 0), p(4, 8)];

  return {
    stage,
    get(player: number) {
      const target = stage.players[player];
      const selectables = getSelectables(player, target, stage);
      return tuple(selectables);
    },
  };
}

describe("movePiece", () => {
  test("move pieces", () => {
    const { stage } = mockStage();
    stage.movePiece(4, 1);
    expect(stage.players[0]).toContain({ X: 4, Y: 1 });
    expect(stage.players[1]).toContain({ X: 4, Y: 8 });
    stage.movePiece(4, 7);
    expect(stage.players[0]).toContain({ X: 4, Y: 1 });
    expect(stage.players[1]).toContain({ X: 4, Y: 7 });
  });
});

describe("addWall", () => {
  test("add walls", () => {
    const { stage } = mockStage();
    stage.addWall(1, 2, "horizontal");
    expect(stage.walls[0]).toContain({ X: 1, Y: 2, direction: "horizontal" });
    stage.addWall(3, 4, "vertical");
    expect(stage.walls[1]).toContain({ X: 3, Y: 4, direction: "vertical" });
    expect(stage.walls.length).toBe(2);
  });
});

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
    const { stage, get } = mockStage();
    // 白の前に壁を置く
    stage.addWall(4, 1, "horizontal");
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
    const { stage, get } = mockStage();
    // 黒の前も壁を置く
    stage.addWall(4, 8, "horizontal");
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
    const { stage, get } = mockStage();
    // 白の左に壁を置く
    stage.addWall(4, 1, "vertical");
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
    const { stage, get } = mockStage();
    // 黒の左に壁を置く
    stage.addWall(4, 8, "vertical");
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
    stage.players[0] = p(4, 4);
    stage.players[1] = p(4, 5);

    expect(get(0)).toStrictEqual([
      [4, 3],
      [3, 4],
      [5, 4],
      [4, 6],
    ]);
  });

  // 飛び越えた先に壁があれば左右に移動できる
  test("jump over the other piece and there is a wall", () => {
    const { stage, get } = mockStage();
    stage.players[0] = p(4, 4);
    stage.players[1] = p(4, 5);
    stage.addWall(4, 6, "horizontal");

    expect(get(0)).toStrictEqual([
      [4, 3],
      [3, 4],
      [5, 4],
      [3, 5],
      [5, 5],
    ]);

    // ただし、壁の向こう側には移動できない
    stage.players[0] = p(0, 4);
    stage.players[1] = p(0, 5);
    stage.addWall(1, 6, "horizontal");
    expect(get(0)).toStrictEqual([
      [0, 3],
      [1, 4],
      [1, 5],
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
    const { stage } = mockStage();
    stage.addWall(1, 4, "horizontal");
    stage.addWall(3, 4, "horizontal");
    stage.addWall(5, 4, "horizontal");
    stage.addWall(7, 4, "horizontal");
    stage.addWall(8, 4, "vertical");
    stage.addWall(8, 5, "horizontal");
    // 両方ともゴールにたどり着けない
    expect(canReachGoal(0, stage)).toBe(false);
    expect(canReachGoal(1, stage)).toBe(false);
    // 壁の向こう側にいればゴールにたどり着ける
    stage.players[0] = p(4, 6);
    expect(canReachGoal(0, stage)).toBe(true);
    stage.players[1] = p(4, 2);
    expect(canReachGoal(1, stage)).toBe(true);
  });

  test("Can jump over the opponent", () => {
    const { stage } = mockStage();
    stage.players[0] = p(4, 3);
    stage.players[1] = p(4, 4);
    stage.addWall(1, 4, "horizontal");
    stage.addWall(3, 4, "horizontal");
    stage.addWall(6, 4, "horizontal");
    stage.addWall(8, 4, "horizontal");
    // 相手を飛び越えればゴールにたどり着ける
    expect(canReachGoal(0, stage)).toBe(true);
    expect(canReachGoal(1, stage)).toBe(true);
  });
});

describe("canPutWall", () => {
  test("initialized", () => {
    const { stage } = mockStage();
    expect(canPutWall(stage, new Wall(1, 2, "horizontal"))).toBe(true);
    expect(canPutWall(stage, new Wall(3, 4, "vertical"))).toBe(true);
  });

  test("put walls by the other wall", () => {
    const { stage } = mockStage();
    stage.addWall(1, 2, "horizontal");
    expect(canPutWall(stage, new Wall(1, 2, "horizontal"))).toBe(false);
    expect(canPutWall(stage, new Wall(2, 2, "horizontal"))).toBe(false);
    expect(canPutWall(stage, new Wall(1, 2, "vertical"))).toBe(false);
    // 向きが違えば隣にも置ける
    expect(canPutWall(stage, new Wall(2, 2, "vertical"))).toBe(true);
    // ひとつ上のマスには置ける
    expect(canPutWall(stage, new Wall(1, 1, "horizontal"))).toBe(true);

    stage.addWall(2, 2, "vertical");
    expect(canPutWall(stage, new Wall(2, 2, "horizontal"))).toBe(false);
    expect(canPutWall(stage, new Wall(3, 2, "horizontal"))).toBe(true);
  });

  test("謎のバグ", () => {
    const { stage } = mockStage();
    stage.players[0] = p(0, 2);
    stage.players[1] = p(0, 7);
    expect(canPutWall(stage, new Wall(1, 1, "horizontal"))).toBe(true);
  });
});

describe("revert", () => {
  test("initialized", () => {
    const { stage } = mockStage();
    stage.revert();
    expect(stage.players).toBe(stage.players);
    expect(stage.walls).toBe(stage.walls);
    expect(stage.operations).toBe(stage.operations);
  });

  test("revert white piece movement", () => {
    const { stage } = mockStage();
    stage.movePiece(4, 1);
    stage.revert();
    expect(stage.players[0]).toContain({ X: 4, Y: 0 });
  });

  test("revert black piece movement", () => {
    const { stage } = mockStage();
    stage.movePiece(4, 1);
    stage.movePiece(4, 7);
    stage.revert();
    expect(stage.players[0]).toContain({ X: 4, Y: 1 });
    expect(stage.players[1]).toContain({ X: 4, Y: 8 });
  });

  test("revert wall placement", () => {
    const { stage } = mockStage();
    stage.addWall(1, 2, "horizontal");
    stage.addWall(3, 4, "vertical");
    stage.revert();
    expect(stage.walls.length).toBe(1);
    expect(stage.walls[0]).toContain({
      X: 1,
      Y: 2,
      direction: "horizontal",
    });
  });
});

describe("currentPlayer", () => {
  test("initialized", () => {
    const { stage } = mockStage();
    expect(stage.currentPlayer).toBe(0);
  });

  test("move pieces", () => {
    const { stage } = mockStage();
    stage.movePiece(4, 1);
    expect(stage.currentPlayer).toBe(1);
    stage.movePiece(4, 7);
    expect(stage.currentPlayer).toBe(0);
  });

  test("put walls", () => {
    const { stage } = mockStage();
    stage.addWall(1, 2, "horizontal");
    expect(stage.currentPlayer).toBe(1);
    stage.addWall(3, 4, "vertical");
    expect(stage.currentPlayer).toBe(0);
  });
});
