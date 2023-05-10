import { Camera, Player, type GameObject, Map } from "@/game";

// type eventkeydown = (keys: string[]) => void;
// type eventkeyup = (keys: string[]) => void;

export class Game {
  public static instance: Game;

  canvas = document.createElement("canvas") as HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  gameObjets: GameObject[] = [];
  private static lastFrameTime = performance.now();
  public static deltaTime: number = 0;
  private mouseEvents: any[] = [];
  private static gameObjectSelected: GameObject | undefined;
  private camera: Camera = new Camera();
  private map: Map;

  constructor(map: Map) {
    this.canvas.width = 2000;
    this.canvas.height = 2000;
    this.map = map;
    this.context = this.canvas.getContext("2d") as CanvasRenderingContext2D;
    this.canvas.addEventListener("click", this.mouseClick.bind(this));
    this.canvas.addEventListener("contextmenu", this.mouseClick.bind(this));
    Game.instance = this;
  }

  private mouseClick(event: MouseEvent) {
    // Obtendo as coordenadas do mouse relativas ao canvas
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    this.mouseEvents.forEach((action: any) => action(mouseX, mouseY, event.button));
  }

  draw() {
    if (this.camera) {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      const width = this.camera.w + this.camera.x;
      const height = this.camera.h + this.camera.y;
      for (let x = this.camera.x; x < width; x += Map.SIZE) {
        for (let y = this.camera.y; y < height; y += Map.SIZE) {
          this.map.drawTile(this.context, x, y);
        }
      }
      this.gameObjets = this.gameObjets.sort((gameObject1: GameObject, gameObjec2: GameObject) => gameObject1.y - gameObjec2.y);
      this.gameObjets.forEach((obj) => {
        if (this.isColision(this.camera, obj)) obj.draw(this.context);
      });
      // this.camera.draw(this.context);
    } else {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.gameObjets = this.gameObjets.sort((gameObject1: GameObject, gameObjec2: GameObject) => gameObject1.y - gameObjec2.y);
      this.gameObjets.forEach((obj) => obj.draw(this.context));
    }
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
    if (gameObject instanceof Player) this.camera.setPlayer(gameObject as Player);
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

  public static MouseColision(x: number, y: number): GameObject | undefined {
    if (Game.gameObjectSelected && Game.gameObjectSelected.onDeselected) Game.gameObjectSelected.onDeselected();
    for (let gameObject of Game.instance.gameObjets) {
      if (gameObject.type != "map" && x >= gameObject.x && x <= gameObject.x + gameObject.w && y >= gameObject.y && y <= gameObject.y + gameObject.h) {
        Game.gameObjectSelected = gameObject;
        if (Game.gameObjectSelected.onSelected) Game.gameObjectSelected.onSelected();
        return gameObject;
      }
    }
    Game.gameObjectSelected = undefined;
    return undefined;
  }

  public isColision(gameObject1: GameObject, gameObjec2: GameObject): boolean {
    if (gameObject1.x + gameObject1.w < gameObjec2.x) return false;
    if (gameObject1.x > gameObjec2.x + gameObjec2.w) return false;
    if (gameObject1.y + gameObject1.h < gameObjec2.y) return false;
    if (gameObject1.y > gameObjec2.y + gameObjec2.h) return false;
    return true;
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
