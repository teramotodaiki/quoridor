import { useAtom } from "jotai";
import { useEffect, useRef } from "react";
import "./App.css";
import { init } from "./quoridor/init"; // Dynamic importしてもいい
import { remainWallNumsAtom } from "./quoridor/store";

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [remainWallNums] = useAtom(remainWallNumsAtom);

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }
    init(canvasRef.current);
  }, []);

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
    </>
  );
}

export default App;
