import { Game, Map, Tree } from "@/game";

import { Player } from "..";
import { ref } from "vue";

export class MapObject extends Map {
  public static action = ref(0);
  public static startPossition: { x: number; y: number } = { x: 153, y: 738 };
  constructor(data: any) {
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

  setData(data: any): void {
    this.w = data?.image?.width || data.w;
    this.h = data?.image?.height || data.h;
    if (data?.image?.width) this.imagem = data.image;
    if (data.start_position) MapObject.startPossition = data.start_position;
    if (data.grid) this.grid = data.grid;
    else {
      this.grid = [];
      for (let x = 0; x < this.w; x += Map.SIZE) {
        this.grid[Math.floor(x / Map.SIZE)] = [];
        for (let y = 0; y < this.h; y += Map.SIZE) {
          this.grid[Math.floor(x / Map.SIZE)][Math.floor(y / Map.SIZE)] = 0;
        }
      }
    }
    if (data?.start_position) this.setStartPossition(data.start_position.x, data.start_position.y);
    this.isLoaded = true;
  }

  draw(contex: CanvasRenderingContext2D): void {
    super.draw(contex);
    contex.fillStyle = "blue";
    contex.beginPath();
    contex.arc(MapObject.startPossition.x + 16, MapObject.startPossition.y + 30, 16, 0, Math.PI * 2);
    contex.fill();
  }

  mouseClick(x: number, y: number, button: number): void {
    if (MapObject.action.value === 0) {
      if (button === 0) {
        this.grid[Math.floor(x / Map.SIZE)][Math.floor(y / Map.SIZE)] = 1;
      } else if (button === 2) {
        this.grid[Math.floor(x / Map.SIZE)][Math.floor(y / Map.SIZE)] = 0;
      }
    } else if (MapObject.action.value === 1) {
      this.setStartPossition(x, y);
      console.log(MapObject.startPossition);
    } else if (MapObject.action.value === 3) {
      this.setGameObjects(Math.floor(x / Map.SIZE) * Map.SIZE, Math.floor(y / Map.SIZE) * Map.SIZE, button);
    }
  }

  public setGameObjects(x: number, y: number, button: number) {
    if (button == 0) Game.instance.addGameObject(new Tree({ x: x, y: y }));
    else if (button == 2) {
      console.log("x: ", x, "y: ", y);
      console.log(Game.instance.gameObjets);
      const gameObject = Game.instance.gameObjets.find((obj) => obj.x == x && obj.y == y);
      console.log(gameObject);
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
      grid: this.grid,
      w: this.w,
      h: this.h,
      size: Map.SIZE,
      img: "8c9c64e0b3fcf049435ca7adc5350507.png",
      start_position: MapObject.startPossition,
    };
    const jsonStr = JSON.stringify(data);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "desenho.json";
    link.click();
    console.log("Salvando mapa...\n", this.gameObjects);
  }
}

export class MapEdit extends Game {
  constructor(image: any) {
    super(new MapObject({ image: image }), new Player(ref(undefined), MapObject.startPossition));
    this.canvas.addEventListener("keydown", (e) => {});
  }

  draw(): void {
    super.draw();
    // this.map.draw(this.context);
  }

  protected mouseClick(event: MouseEvent) {
    if (MapObject.action.value == 2) super.mouseClick(event);
    else Game.Map.mouseClick(event.offsetX, event.offsetY, event.button);
    // this.map.mouseClick(event.offsetX, event.offsetY, event.button);
  }
}
