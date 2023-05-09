import type { GameObject } from "./GameObject";

// type eventkeydown = (keys: string[]) => void;
// type eventkeyup = (keys: string[]) => void;

export class Game {
  canvas = document.createElement("canvas") as HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  gameObjets: GameObject[] = [];
  private static lastFrameTime = performance.now();
  public static deltaTime: number = 0;
  private mouseEvents: any[] = [];

  constructor() {
    this.canvas.width = 2000;
    this.canvas.height = 2000;
    this.context = this.canvas.getContext("2d") as CanvasRenderingContext2D;
    this.canvas.addEventListener("click", this.mouseClick.bind(this));
    this.canvas.addEventListener("contextmenu", this.mouseClick.bind(this));
  }

  private mouseClick(event: MouseEvent) {
    // Obtendo as coordenadas do mouse relativas ao canvas
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    this.mouseEvents.forEach((action: any) => action(mouseX, mouseY, event.button));
  }

  draw() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.gameObjets = this.gameObjets.sort((gameObject1: GameObject, gameObjec2: GameObject) => gameObject1.y - gameObjec2.y);
    this.gameObjets.forEach((obj) => obj.draw(this.context));
  }

  update() {
    const currentTime = performance.now();
    Game.deltaTime = (currentTime - Game.lastFrameTime) / 1000;
    this.gameObjets.forEach((obj) => obj.update(Game.deltaTime));
    this.draw();
    Game.lastFrameTime = currentTime;
    requestAnimationFrame(this.update.bind(this));
  }

  addGameObject(gameObject: GameObject): GameObject {
    this.gameObjets.push(gameObject);
    if (gameObject.mouseClick) this.mouseEvents.push(gameObject.mouseClick.bind(gameObject));
    return gameObject;
  }

  removeGameObject(gameObject: GameObject) {
    this.gameObjets = this.gameObjets.filter((obj) => obj != gameObject);
    if (gameObject.mouseClick) this.mouseEvents = this.mouseEvents.filter((action) => action != gameObject.mouseClick);
  }

  destructor() {
    // Lógica de limpeza ou liberação de recursos
    console.log("Executando o destrutor da classe");
  }
}

// export class Inputhandler {
//   keys: string[] = [];

//   eventDown: eventkeydown[] = [];
//   eventUp: eventkeyup[] = [];

//   constructor() {
//     window.addEventListener("keydown", (e: KeyboardEvent) => {
//       if (this.keys.indexOf(e.key) === -1) {
//         this.keys.push(e.key);
//       }
//       this.eventUp.forEach((event) => event(this.keys));
//     });
//     // window.addEventListener("keypress", (e: KeyboardEvent) => {
//     //   if (this.keys.indexOf(e.key) === -1) {
//     //     this.keys.push(e.key);
//     //   }
//     // });

//     window.addEventListener("keyup", (e) => {
//       this.keys.splice(this.keys.indexOf(e.key), 1);
//       this.eventUp.forEach((event) => event(this.keys));
//     });
//   }
// }
