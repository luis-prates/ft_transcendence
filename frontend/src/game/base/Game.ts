import { Camera, Player, Menu, type GameObject, Map, listClass } from "@/game";
import { socketClass } from "@/socket/SocketClass";
import { userStore } from "@/stores/userStore";
import { CreateGame } from "../Menu/CreateGame";
import { YourMenu } from "../Menu/YourMenu";
import type { Socket } from "socket.io-client";

export class Game {
  public static instance: Game;
  public canvas = document.createElement("canvas") as HTMLCanvasElement;
  protected context: CanvasRenderingContext2D;
  private bufferCanvas = document.createElement("canvas");
  protected buffer: CanvasRenderingContext2D;
  gameObjets: GameObject[] = [];
  private menusLocal: Menu[] = [];
  private menusGlobal: Menu[] = [];
  private gameObjetsUpdate: GameObject[] = [];
  private static lastFrameTime = performance.now();
  public static deltaTime: number = 0;
  private mouseEvents: any[] = [];
  private static gameObjectSelected: GameObject | undefined;
  protected camera: Camera;
  protected map: Map;
  protected player: Player;
  //public your_menu;
  public isRunning;
  public socket: Socket;
  private boundUpdate: any;

  constructor(map: Map, player: Player) {
    //For What?
    this.boundUpdate = this.update.bind(this);
    this.socket = socketClass.getGameSocket();
    console.log("Map: ", map.w, " / ", map.h);
    this.camera = new Camera(player, map);
    this.canvas.width = map.w;
    this.canvas.height = map.h;
    this.bufferCanvas.width = map.w;
    this.bufferCanvas.height = map.h;
    this.map = map;
    this.player = player;
    this.addGameObject(map);
    this.addGameObject(player);
    this.context = this.canvas.getContext("2d") as CanvasRenderingContext2D;
    this.buffer = this.bufferCanvas.getContext("2d", { willReadFrequently: true }) as CanvasRenderingContext2D;
    this.canvas.addEventListener("click", this.mouseClick.bind(this));
    this.canvas.addEventListener("contextmenu", this.mouseClick.bind(this));
    Game.instance = this;
    //Your Menu
    //this.your_menu = new YourMenu();
    //Game.instance.addMenu(this.your_menu.menu);
    // Adicione os event listeners para os eventos de drag e drop
    this.canvas.addEventListener("dragover", (event) => event.preventDefault());
    this.canvas.addEventListener("drop", (event) => {
      if (event.dataTransfer && event.dataTransfer.types.includes("text/uri-list")) {
        console.log("Drop");
        // Get the ID of the dragged component
        const componentId = event.dataTransfer.getData("text/uri-list");
        const color = componentId.includes("assets/images/lobby/table_") ? "#" + componentId.substring(componentId.indexOf("_") + 1, componentId.indexOf(".")) : "green";
        const rect = this.canvas.getBoundingClientRect();
        const data = {
          className: "Table",
          objectId: "gametest_" + userStore().user.nickname,
          color,
          x: Math.floor((event.clientX - rect.left + this.camera.x) / Map.SIZE) * Map.SIZE,
          y: Math.floor((event.clientY - rect.top + this.camera.y) / Map.SIZE) * Map.SIZE,
        };
        Game.instance.addMenu(new CreateGame(data).menu);
      }
      event.preventDefault();
    });
    map.datas.forEach((data: any) => Game.instance.addGameObjectData(data));
    map.datas = [];
    this.isRunning = true;
    window.addEventListener("resize", this.onResize.bind(this));
    window.addEventListener("keyup", this.keyUp.bind(this));
  }

  public keyUp(event: KeyboardEvent) {
    this.menusGlobal.forEach((menu) => {
      if (menu.KeyClose && menu.KeyClose == event.key) this.removeMenu(menu);
    });
  }

  public addMenu(menu: Menu) {
    if (menu.layer == "Local") this.menusLocal.push(menu);
    else this.menusGlobal.push(menu);
  }

  public removeMenu(menu: Menu) {
    if (menu.layer == "Local") this.menusLocal.splice(this.menusLocal.indexOf(menu), 1);
    else this.menusGlobal.splice(this.menusGlobal.indexOf(menu), 1);
    if (menu.onClose) menu.onClose();
  }

  protected onResize() {
    this.menusLocal.forEach((menu) => menu.onResize(window.innerWidth, window.innerHeight));
    this.menusGlobal.forEach((menu) => menu.onResize(window.innerWidth, window.innerHeight));
  }

  protected async mouseClick(event: MouseEvent) {
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left + this.camera.x;
    const mouseY = event.clientY - rect.top + this.camera.y;
    for (let i = this.menusGlobal.length - 1; i >= 0; i--) {
      if (this.menusGlobal[i].mouseClick(event.clientX, event.clientY, event.button)) return;
    }
    for (let i = this.menusLocal.length - 1; i >= 0; i--) {
      if (this.menusLocal[i].mouseClick(event.clientX, event.clientY, event.button)) return;
    }
    this.mouseEvents.forEach((action: any) => action(mouseX, mouseY, event.button));
  }

  draw() {
    this.camera.update();
    this.camera.render(this.buffer, this.gameObjets);
    this.menusGlobal.forEach((menu) => menu.draw(this.buffer));
    this.context.drawImage(this.bufferCanvas, 0, 0);
  }

  public drawMenuLocal(context: CanvasRenderingContext2D) {
    this.menusLocal.forEach((menu) => menu.draw(context));
  }

  update() {
    if (this.isRunning) {
      const currentTime = performance.now();
      Game.deltaTime = (currentTime - Game.lastFrameTime) / 1000;
      this.gameObjetsUpdate.forEach((obj: any) => {
        obj.update(Game.deltaTime);
      });
      this.draw();
      Game.lastFrameTime = currentTime;
      requestAnimationFrame(this.boundUpdate);
    } else {
      this.gameObjets = [];
      this.gameObjetsUpdate = [];
      this.mouseEvents = [];
    }
  }

  addGameObject(gameObject: GameObject): GameObject {
    this.gameObjets.push(gameObject);
    if (gameObject.type == "character" || gameObject.type == "player") console.log("Add: ", gameObject);
    if (gameObject.mouseClick) this.mouseEvents.push(gameObject.mouseClick.bind(gameObject));
    if (gameObject.update) this.gameObjetsUpdate.push(gameObject);
    return gameObject;
  }

  addGameObjectData(data: any): GameObject {
    return this.addGameObject(new listClass[data.className](data));
  }

  removeGameObject(gameObject: GameObject) {
    this.gameObjets = this.gameObjets.filter((obj) => obj != gameObject);
    if (gameObject.mouseClick) this.mouseEvents = this.mouseEvents.filter((action) => action != gameObject.mouseClick);
    if (gameObject.update) this.gameObjetsUpdate = this.gameObjetsUpdate.filter((obj) => obj != gameObject);
    if (gameObject.destroy) gameObject.destroy();
  }

  destructor() {
    this.isRunning = false;
    this.canvas.remove();
    window.removeEventListener("resize", this.onResize);
    window.removeEventListener("keyup", this.keyUp);
  }

  //TODO NOTIFICATION
  public gameNotification() {
    const user = userStore().user;
    const numberOfFriendRequest = user.friendsRequests.filter((friendship) => friendship.requesteeId === user.id).length;
    //this.your_menu.notification = numberOfFriendRequest == 0 ? "" : numberOfFriendRequest <= 99 ? numberOfFriendRequest.toString() : "99";
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

  public static isColision(gameObject1: GameObject, gameObjec2: GameObject): boolean {
    if (gameObject1.isCollision && gameObjec2.isCollision) return gameObject1.isCollision(gameObjec2) || gameObjec2.isCollision(gameObject1);
    if (gameObject1.isCollision) return gameObject1.isCollision(gameObjec2);
    if (gameObjec2.isCollision) return gameObjec2.isCollision(gameObject1);
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

  public static get grid(): number[][] {
    return Game.Map.layer_2.grid;
  }

  public static async loadImage(url: any) {
    // const ur = await import(url);
    // const image = new Image();
    // if (ur && ur.default) {
    //   image.src = ur.default;
    //   return image;
    // }
    return null;
  }

  public static addMenu(menu: Menu) {
    Game.instance.addMenu(menu);
  }

  public static removeMenu(menu: Menu) {
    Game.instance.removeMenu(menu);
  }

  public static updateNotifications() {
    Game.instance.gameNotification();
  }
}
