import { useEffect, useRef } from "react";
import "./App.css";
import { init } from "./quoridor/init"; // Dynamic importしてもいい

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }
    init(canvasRef.current);
  }, []);

  return (
    <>
      <h1>Quoridor</h1>
      <canvas id="game" ref={canvasRef}></canvas>
    </>
  );
}

export default App;
