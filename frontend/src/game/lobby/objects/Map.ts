import type { GameObject, GameObjectType } from "../../base/GameObject";
import map from "@/assets/images/lobby/8c9c64e0b3fcf049435ca7adc5350507.png";
import { Door } from "./Door";
import { Game } from "@/game";

export class Map implements GameObject {
  imagem: any = new Image();
  x: number = 0;
  y: number = 0;
  w: number = 0;
  h: number = 0;
  type: GameObjectType;
  isSelect: boolean = false;
  public static SIZE = 32;
  public grid: number[][] = [];
  objectId = 0;
  private isLoaded = false;
  public gameObjects: GameObject[] = [];

  // Definindo as configurações do grid
  numLinhas = 10; // Número de linhas do grid
  numColunas = 10; // Número de colunas do grid

  constructor(data: any) {
    this.type = "map";
    // this.imagem.src = map;
    // this.w = 544;
    // this.h = 672;
    this.setData(data);

    // this.grid = [];
    // for (let x = 0; x < this.w; x += Map.SIZE) {
    //   this.grid[Math.floor(x / Map.SIZE)] = [];
    //   for (let y = 0; y < this.h; y += Map.SIZE) {
    //     this.grid[Math.floor(x / Map.SIZE)][Math.floor(y / Map.SIZE)] = 0;
    //   }
    // }
  }

  draw(contex: CanvasRenderingContext2D): void {
    if (this.isLoaded === false) return;
    contex.strokeStyle = "blue";

    contex.drawImage(this.imagem, 0, 0, this.w, this.h);
    for (let x = 0; x < this.w; x += Map.SIZE) {
      for (let y = 0; y < this.h; y += Map.SIZE) {
        contex.fillStyle = "rgba(255, 0, 0, 0.5)";
        // contex.fillRect(x, y, Map.SIZE, Map.SIZE);
        if (this.grid[Math.floor(x / Map.SIZE)][Math.floor(y / Map.SIZE)] === 1) {
          contex.fillStyle = "rgba(255, 0, 0, 0.5)";
          contex.fillRect(x, y, Map.SIZE, Map.SIZE);
        }
      }
    }
    // this.gameObjects.forEach((gameObject) => {
    //   gameObject.draw(contex);
    // });
    // contex.fillRect(this.x, this.y, this.w, this.h);
  }

  setData(data: any): void {
    this.w = data.width;
    this.h = data.height;
    this.imagem.src = data.img;
    this.grid = data.grid;
    this.imagem.onload = () => {
      console.log("Map: Imagem carregada");
      this.isLoaded = true;
    };
    this.imagem.onerror = () => {
      console.log("Map: Erro ao carregar a imagem");
    };
    console.log("Map_: ", data.img);
    // this.grid = data.grid;
  }

  update(deltaTime: number): void {}

  pintarSelect(contex: CanvasRenderingContext2D, x: number, y: number) {
    contex.strokeStyle = "red";
    contex.strokeRect(x, y, Map.SIZE, Map.SIZE);
  }

  drawTile(contex: CanvasRenderingContext2D, x: number, y: number) {
    contex.drawImage(this.imagem, 576, 0, Map.SIZE, Map.SIZE, x, y, Map.SIZE, Map.SIZE);
  }

  mouseClick(x: number, y: number, button: number): void {
    x = Math.floor(x / Map.SIZE);
    y = Math.floor(y / Map.SIZE);
    if (button === 2) {
      // console.log("Map: ", x, y, button);
      // this.grid[x][y] = this.grid[x][y] ? 0 : 1;
      Game.instance.addGameObject(new Door({ x: x * Map.SIZE, y: y * Map.SIZE, objectId: this.objectId++, mapName: "mapa1", mapPosition: { x: 0, y: 0 } }));
      // this.gameObjects.push(new Door({ x: x * Map.SIZE, y: y * Map.SIZE, objectId: this.objectId++, mapName: "mapa1", mapPosition: { x: 0, y: 0 } }));
    }
    // console.log("Map: ", x, y, button);
  }

  async saveMap() {
    // const data = {
    //   grid: this.grid,
    //   width: this.w,
    //   height: this.h,
    //   size: Map.SIZE,
    //   img: "8c9c64e0b3fcf049435ca7adc5350507.png",
    //   start_position: { x: 0, y: 0 },
    // };
    // const jsonStr = JSON.stringify(data);
    // const blob = new Blob([jsonStr], { type: "application/json" });
    // const url = URL.createObjectURL(blob);

    // const link = document.createElement("a");
    // link.href = url;
    // link.download = "desenho.json";
    // link.click();
    console.log("Salvando mapa...\n", this.gameObjects);
  }
}
