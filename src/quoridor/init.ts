import { Application, Assets, Container, Graphics, Sprite } from "pixi.js";

export async function init(canvas: HTMLCanvasElement) {
  // The application will create a renderer using WebGL, if possible,
  // with a fallback to a canvas render. It will also setup the ticker
  // and the root stage PIXI.Container
  const app = new Application({
    width: 640,
    height: 640,
    view: canvas,
    background: 0xffffff,
  });

  // load the texture we need
  const texture = await Assets.load("assets/sample.png");

  // This creates a texture from a 'bunny.png' image
  const bunny = new Sprite(texture);
  console.log(bunny);

  // Setup the position of the bunny
  bunny.x = app.renderer.width / 2;
  bunny.y = app.renderer.height / 2;

  // Rotate around the center
  bunny.anchor.x = 0.5;
  bunny.anchor.y = 0.5;

  // 9x9マスの盤面を作る
  const board = new Container();
  board.x = 32;
  board.y = 32;
  for (let y = 0; y <= 9; y++) {
    const line = new Graphics();
    line.lineStyle(1, 0x000000, 1);
    line.moveTo(0, y * 64);
    line.lineTo(576, y * 64);
    board.addChild(line);
  }
  for (let x = 0; x <= 9; x++) {
    const line = new Graphics();
    line.lineStyle(1, 0x000000, 1);
    line.moveTo(x * 64, 0);
    line.lineTo(x * 64, 576);
    board.addChild(line);
  }
  app.stage.addChild(board);

  // Add the bunny to the scene we are building
  app.stage.addChild(bunny);

  // // Listen for frame updates
  // app.ticker.add(() => {
  //   // each frame we spin the bunny around a bit
  //   bunny.rotation += 0.01;
  // });
  // Add a variable to count up the seconds our demo has been running
  let elapsed = 0.0;
  // Tell our application's ticker to run a new callback every frame, passing
  // in the amount of time that has passed since the last tick
  app.ticker.add((delta) => {
    // Add the time to our total elapsed time
    elapsed += delta;
    // Update the sprite's X position based on the cosine of our elapsed time.  We divide
    // by 50 to slow the animation down a bit...
    bunny.x = 100.0 + Math.cos(elapsed / 50.0) * 100.0;
  });
}
