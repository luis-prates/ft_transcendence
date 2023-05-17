import { Camera, Player, type GameObject, Map, listClass } from "@/game";
import socket from "@/socket/Socket";

export class Game {
  public static instance: Game;
  canvas = document.createElement("canvas") as HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  gameObjets: GameObject[] = [];
  private static lastFrameTime = performance.now();
  public static deltaTime: number = 0;
  private mouseEvents: any[] = [];
  private static gameObjectSelected: GameObject | undefined;
  private camera: Camera;
  protected map: Map;
  protected player: Player;

  constructor(map: Map, player: Player) {
    this.camera = new Camera(player, map);
    this.canvas.width = 2000;
    this.canvas.height = 2000;
    this.map = map;
    this.player = player;
    this.addGameObject(map);
    this.addGameObject(player);
    this.context = this.canvas.getContext("2d") as CanvasRenderingContext2D;
    this.canvas.addEventListener("click", this.mouseClick.bind(this));
    this.canvas.addEventListener("contextmenu", this.mouseClick.bind(this));
    Game.instance = this;

    // Adicione os event listeners para os eventos de drag e drop
    this.canvas.addEventListener("dragover", (event) => event.preventDefault());
    this.canvas.addEventListener("drop", (event) => {
      if (event.dataTransfer && event.dataTransfer.types.includes("text/uri-list")) {
        // Get the ID of the dragged component
        const componentId = event.dataTransfer.getData("text/uri-list");
        const color = componentId.includes("assets/images/lobby/table_") ? "#" + componentId.substring(componentId.indexOf("_") + 1, componentId.indexOf(".")) : "green";
        const rect = this.canvas.getBoundingClientRect();
        const data = { className: "Table", color, x: Math.floor((event.clientX - rect.left + this.camera.x) / Map.SIZE) * Map.SIZE, y: Math.floor((event.clientY - rect.top + this.camera.y) / Map.SIZE) * Map.SIZE };
        socket.emit("new_table", data);
      }
      event.preventDefault();
    });
  }

  private mouseClick(event: MouseEvent) {
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left + this.camera.x;
    const mouseY = event.clientY - rect.top + this.camera.y;
    this.mouseEvents.forEach((action: any) => action(mouseX, mouseY, event.button));
  }

  draw() {
    this.camera.update();
    this.camera.render(this.context, this.gameObjets);
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

  addGameObjectData(data: any): GameObject {
    return this.addGameObject(new listClass[data.className](data));
  }

  removeGameObject(gameObject: GameObject) {
    this.gameObjets = this.gameObjets.filter((obj) => obj != gameObject);
    if (gameObject.mouseClick) this.mouseEvents = this.mouseEvents.filter((action) => action != gameObject.mouseClick);
  }

  destructor() {
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

  public static get Map(): Map {
    return Game.instance.map;
  }

  public static getPlayer(): Player {
    return Game.instance.player;
  }
}
