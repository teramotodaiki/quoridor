import { atom, createStore } from "jotai";

export type Store = ReturnType<typeof createStore>;

export const remainWallNumsAtom = atom([10, 10]);
