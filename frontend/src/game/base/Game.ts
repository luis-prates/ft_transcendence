import type { GameObject } from "./GameObject";

type eventkeydown = (keys: string[]) => void;
type eventkeyup = (keys: string[]) => void;

export class Game {
  canvas = document.createElement("canvas") as HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  gameObjets: GameObject[] = [];
  private inputHandler = new Inputhandler();
  private static lastFrameTime = performance.now();
  public static deltaTime: number = 0;
  
  constructor() {
    this.canvas.width = 2000;
    this.canvas.height = 2000;
    this.context = this.canvas.getContext("2d") as CanvasRenderingContext2D;
  }

  draw() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.gameObjets = this.gameObjets.sort((gameObject1: GameObject, gameObjec2: GameObject)=> (gameObject1.y - gameObjec2.y));
    this.gameObjets.forEach((obj) => obj.draw(this.context));
  }

  update() {
    const currentTime = performance.now();
    Game.deltaTime = (currentTime - Game.lastFrameTime) / 1000;
    if (this.inputHandler.keys.length > 0)
      this.inputHandler.eventDown.forEach((event) => event(this.inputHandler.keys));
    this.gameObjets.forEach((obj) => obj.update(Game.deltaTime));
    this.draw();
    Game.lastFrameTime = currentTime;
    requestAnimationFrame(this.update.bind(this));
  }

  addGameObject(gameObject: GameObject): GameObject {
    this.gameObjets.push(gameObject);
    if (gameObject.keyDown) this.inputHandler.eventDown.push(gameObject.keyDown.bind(gameObject));
    if (gameObject.keyUp) this.inputHandler.eventUp.push(gameObject.keyUp.bind(gameObject));
    return gameObject;
  }

  removeGameObject(gameObject: GameObject) {
    this.gameObjets = this.gameObjets.filter((obj) => obj != gameObject);
    if (gameObject.keyDown)
      this.inputHandler.eventDown = this.inputHandler.eventDown.filter((event) => event != gameObject.keyDown);
    if (gameObject.keyUp)
      this.inputHandler.eventUp = this.inputHandler.eventUp.filter((event) => event != gameObject.keyUp);
  }
}

export class Inputhandler {
  keys: string[] = [];

  eventDown: eventkeydown[] = [];
  eventUp: eventkeyup[] = [];

  constructor() {

    window.addEventListener("keydown", (e: KeyboardEvent) => {
      if (this.keys.indexOf(e.key) === -1) {
        this.keys.push(e.key);

      }
      this.eventUp.forEach((event) => event(this.keys));
    });
    // window.addEventListener("keypress", (e: KeyboardEvent) => {
    //   if (this.keys.indexOf(e.key) === -1) {
    //     this.keys.push(e.key);
    //   }
    // });

    window.addEventListener("keyup", (e) => {
      this.keys.splice(this.keys.indexOf(e.key), 1);
      this.eventUp.forEach((event) => event(this.keys));
    });
  }
}
