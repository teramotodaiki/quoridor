import { describe, expect, test } from "vitest";

import { IStage, getSelectables } from "./stage";

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
  });

  test("a horizontal wall is by the white", () => {
    const stage = mockStage();
    stage.addWall(4, 1, "horizontal");

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

    // もう一方のプレイヤーは自由に動ける
    expect(stage.get(1)).toStrictEqual([
      [4, 7],
      [3, 8],
      [5, 8],
    ]);
  });
});
