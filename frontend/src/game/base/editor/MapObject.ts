import { Game, Map, type GameObject, type Rectangle, Npc } from "@/game";

import { ref } from "vue";

export class MapObject extends Map {
  public static action = ref(0);
  public static typefont = ref(0);
  public static selection: Rectangle | null = null;
  public static debugView = ref(true);
  public static datas: { gamaObject: GameObject; data: any }[] = [];
  public static file: File | null = null;
  private gameObjetSelect: GameObject | null = null;

  public static startPossition: { x: number; y: number } = { x: 153, y: 738 };
  constructor(data?: any) {
    super(data);
    this.createLayers();
  }

  async createLayers() {
    // const layer_1 = await Game.loadImage(`@/assets/images/lobby/8c9c64e0b3fcf049435ca7adc5350507.png`);
    // if (layer_1) this.layers.push(layer_1);
    // const layer_2 = await Game.loadImage(`@/assets/images/lobby/8c9c64e0b3fcf049435ca7adc5350507.png`);
    // if (layer_2) this.layers.push(layer_2);
    // const layer_3 = await Game.loadImage(`@/assets/images/lobby/8c9c64e0b3fcf049435ca7adc5350507.png`);
    // if (layer_3) this.layers.push(layer_3);
  }

  setData(data: any): any {
    this.isLoaded = false;
    MapObject.datas = [];
    return super.setData(data).then(() => {
      console.log(data.start_position);
      if (data.start_position) MapObject.startPossition = data.start_position;
      // this.setStartPossition(MapObject.startPossition.x, MapObject.startPossition.y);
    });
  }

  draw(context: CanvasRenderingContext2D): void {
    if (!this.isLoaded) return;
    super.draw(context);

    if (MapObject.debugView.value) {
      for (let x = 0; x < this.w; x += Map.SIZE) {
        for (let y = 0; y < this.h; y += Map.SIZE) {
          context.fillStyle = "rgba(255, 0, 0, 0.5)";
          if (this.layer_2.grid[Math.floor(x / Map.SIZE)][Math.floor(y / Map.SIZE)] === 1) {
            context.fillStyle = "rgba(255, 0, 0, 0.5)";
            context.fillRect(x, y, Map.SIZE, Map.SIZE);
          }
        }
      }
      context.fillStyle = "blue";
      context.beginPath();
      context.arc(MapObject.startPossition.x + 16, MapObject.startPossition.y + 30, 16, 0, Math.PI * 2);
      context.fill();
    }
  }

  drawLayer_3(context: CanvasRenderingContext2D): void {
    super.drawLayer_3(context);
    if (MapObject.debugView.value) {
      const objColison = this.layer_3.colision();
      this.layer_3.objects.forEach((obj) => {
        if (obj != objColison) {
          context.fillStyle = `rgba(0, 0, 255, 0.5)`;
          context.fillRect(obj.x, obj.y, obj.w, obj.h);
        }
      });
    }
  }

  keydown(key: string): void {
    key = key.toUpperCase();
    if (this.gameObjetSelect && this.gameObjetSelect instanceof Npc) {
      let x = this.gameObjetSelect.x + (key == "A" ? -1 : key == "D" ? 1 : 0);
      let y = this.gameObjetSelect.y + (key == "W" ? -1 : key == "S" ? 1 : 0);
      (this.gameObjetSelect as Npc).setLookAt({ x, y } as any);
      const data = MapObject.datas.find((data) => data.gamaObject == this.gameObjetSelect);
      if (data) data.data["animation"] = this.gameObjetSelect.animation;
    }
  }

  mouseClick(x: number, y: number, button: number): void {
    this.gameObjetSelect = null;
    console.log("event.offsetX, event.offsetY, event.button");
    if (MapObject.action.value === 0 || MapObject.action.value === 5) {
      if (MapObject.selection === null) MapObject.selection = { x: x, y: y, w: Map.SIZE, h: Map.SIZE };
      MapObject.selection.w = MapObject.selection?.w == 0 ? Map.SIZE : MapObject.selection?.w;
      MapObject.selection.h = MapObject.selection?.h == 0 ? Map.SIZE : MapObject.selection?.h;

      if (MapObject.action.value === 0) {
        for (let x = MapObject.selection.x; x < MapObject.selection.x + MapObject.selection.w; x += Map.SIZE) {
          for (let y = MapObject.selection.y; y < MapObject.selection.y + MapObject.selection.h; y += Map.SIZE) {
            this.layer_2.grid[Math.floor(x / Map.SIZE)][Math.floor(y / Map.SIZE)] = button === 0 ? 1 : 0;
          }
        }
      } else {
        if (button === 0) this.layer_3.objects.push({ x: MapObject.selection.x, y: MapObject.selection.y, w: MapObject.selection.w, h: MapObject.selection.h });
        else if (button === 2) {
          this.layer_3.objects = this.layer_3.objects.filter((obj) => !(x >= obj.x && x <= obj.x + obj.w && y >= obj.y && y <= obj.y + obj.h));
        }
      }
    } else if (MapObject.action.value == 1) {
      this.setStartPossition(x, y);
      console.log(MapObject.startPossition);
    } else if (MapObject.action.value == 3) {
      this.setGameObjects(x, y, button, { className: "Tree" });
    } else if (MapObject.action.value == 4) {
      this.setGameObjectss(Math.floor(x / Map.SIZE) * Map.SIZE, Math.floor(y / Map.SIZE) * Map.SIZE, button);
    } else if (MapObject.action.value == 6) {
      const mapName = this.checkColision(x, y) ? "" : window.prompt("Map:");
      if (!mapName) return;
      this.setGameObjects(x, y, button, { className: "Door", mapName: mapName });
    } else if (MapObject.action.value == 7) {
      const nickname = this.checkColision(x, y) ? "NULL" : window.prompt("nickname:");
      if (!nickname) return;
      const typeNpc = this.checkColision(x, y) ? "NULL" : window.prompt("type:");
      this.setGameObjects(x, y, button, { className: "Npc", nickname, typeNpc }, (gameObject: Npc) => {
        const avatar = gameObject.avatar + 1;
        gameObject.setData({ avatar: avatar > 7 ? 0 : avatar });
        const data = MapObject.datas.find((data) => data.gamaObject == gameObject);
        if (data) data.data["avatar"] = gameObject.avatar;
        console.log(gameObject);
      });
    }
  }

  public setGameObjects(x: number, y: number, button: number, data: any, selection?: (gameObject: GameObject) => void) {
    x = Math.floor(x / Map.SIZE) * Map.SIZE;
    y = Math.floor(y / Map.SIZE) * Map.SIZE;
    data.x = x;
    data.y = y;
    const gameObject = Game.MouseColision(x, y);
    if (button == 0) {
      if (gameObject && (this.gameObjetSelect = gameObject) && selection) selection(gameObject);
      else if (!gameObject) Game.instance.addGameObjectData(data);
    } else if (button == 2) {
      if (gameObject && gameObject.type != "player") Game.instance.removeGameObject(gameObject);
    }
  }

  checkColision(x: number, y: number): boolean {
    x = Math.floor(x / Map.SIZE) * Map.SIZE;
    y = Math.floor(y / Map.SIZE) * Map.SIZE;
    return Game.MouseColision(x, y) ? true : false;
  }

  public setGameObjectss(x: number, y: number, button: number) {
    const font_1: any[] = [
      {
        x: x,
        y: y,
        w: 96,
        h: 64,
        sx: -32,
        sy: -32,
        frames: [
          { x: 0, y: 0 },
          { x: 1, y: 0 },
          { x: 2, y: 0 },
        ],
      },
      {
        x: x,
        y: y,
        w: 64,
        h: 96,
        sx: 0,
        sy: -32,
        frames: [
          { x: 0, y: 0 },
          { x: 1, y: 0 },
          { x: 2, y: 0 },
        ],
        aimation_sx: 0,
        aimation_sy: 65,
      },
    ];

    const type: number = MapObject.typefont.value;
    if (button == 0 && type < font_1.length) Game.instance.addGameObjectData({ className: "WaterFont", ...font_1[type] });
    else if (button == 2) {
      const gameObject = Game.instance.gameObjets.find((obj) => obj.x == x && obj.y == y);
      if (gameObject && gameObject.type != "player") Game.instance.removeGameObject(gameObject);
    }
  }

  private setStartPossition(x: number, y: number) {
    MapObject.startPossition = { x: x, y: y };
    Game.getPlayer().x = x;
    Game.getPlayer().y = y;
    Game.getPlayer().clearPath();
  }

  async saveMap() {
    const data = {
      grid: this.layer_2.grid,
      layer_1: {
        image: this.layer_1.image.src,
        opacity: this.layer_1.opacity,
      },
      layer_2: {
        image: this.layer_2.image.src,
        opacity: this.layer_2.opacity,
      },
      layer_3: {
        image: this.layer_3.image.src,
        opacity: this.layer_3.opacity,
        objects: this.layer_3.objects,
      },
      width: this.w,
      height: this.h,
      size: Map.SIZE,
      start_position: MapObject.startPossition,
      datas: MapObject.datas.map((data) => {
        return { className: data.gamaObject.constructor.name, ...data.data };
      }),
    };
    const jsonStr = JSON.stringify(data);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "desenho.json";
    link.click();
    console.log("Salvando mapa...\n");
  }
}
