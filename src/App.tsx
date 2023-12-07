import { createStore, useAtom } from "jotai";
import { useEffect, useRef, useState } from "react";
import "./App.css";
import { init } from "./quoridor/init"; // Dynamic importしてもいい
import { remainWallNumsAtom } from "./quoridor/store";

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [store] = useState(createStore);
  const [remainWallNums] = useAtom(remainWallNumsAtom, { store });

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }
    init({ canvas: canvasRef.current, store });
  }, []);

  const handleRevert = () => {
  };

  return (
    <>
      {/* {<h1>Quoridor</h1>} */}
      <div className="player player-white">
        <span>White: {remainWallNums[0]}</span>
      </div>
      <canvas id="game" ref={canvasRef}></canvas>
      <div className="player player-black">
        <span>Black: {remainWallNums[1]}</span>
      </div>
      <div className="fixed-menu">
        <button className="revert-button" onClick={handleRevert}>
          もどす
        </button>
      </div>
    </>
  );
}

export default App;
