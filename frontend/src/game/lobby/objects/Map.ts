import type { GameObject, GameObjectType } from "../../base/GameObject";
import { Door } from "./Door";
import { Game, Player } from "@/game";
import imgLayer from "@/assets/images/lobby/layer_3.png";

export interface retanglulo {
  x: number;
  y: number;
  w: number;
  h: number;
}
export interface layer {
  image: any;
  opacity: number;
  objects: retanglulo[];
  colision(): retanglulo | undefined;
}

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
  protected isLoaded = false;
  public gameObjects: GameObject[] = [];
  public layer: CanvasRenderingContext2D;

  public layer_3: layer = {
    image: new Image(),
    opacity: 0.5,
    objects: [],
    colision(): retanglulo | undefined {
      return this.objects.find((obj) => obj.x <= Game.getPlayer().x && obj.x + obj.w >= Game.getPlayer().x && obj.y <= Game.getPlayer().y && obj.y + obj.h >= Game.getPlayer().y);
    },
  };

  constructor(data: any) {
    this.type = "map";
    this.layer_3.image.src = imgLayer;
    const canva = document.createElement("canvas") as HTMLCanvasElement;
    this.layer = canva.getContext("2d") as CanvasRenderingContext2D;
    this.layer_3.image.onload = () => {
      canva.width = this.layer_3.image.width;
      canva.height = this.layer_3.image.height;
    };
    this.setData(data);
  }

  draw(contex: CanvasRenderingContext2D): void {
    if (this.isLoaded === false) return;
    contex.strokeStyle = "blue";
    contex.drawImage(this.imagem, 0, 0, this.w, this.h);
  }

  drawLayer_3(contex: CanvasRenderingContext2D): void {
    const rect = this.layer_3.colision();
    // contex.fillStyle = `rgba(0, 0, 0, 0.5)`;
    this.layer.drawImage(this.layer_3.image, 0, 0);
    if (rect) {
      const imageData = this.layer.getImageData(0, 0, this.layer.canvas.width, this.layer.canvas.height);
      const data = imageData.data;
      // Percorrer os pixels e aplicar a opacidade desejada
      for (let row = rect.y; row < rect.y + rect.h; row++) {
        for (let col = rect.x; col < rect.x + rect.w; col++) {
          const index = (row * this.layer.canvas.width + col) * 4;
          const alpha = data[index + 3];

          // Aplicar a opacidade desejada (valor entre 0 e 255)
          const opacity = 128; // Opacidade de 50%
          data[index + 3] = (alpha * opacity) / 255;
        }
      }

      // Atualizar os dados da imagem no canvas
      this.layer.putImageData(imageData, 0, 0);
    }
    contex.drawImage(this.layer.canvas, 0, 0);
    //  else contex.drawImage(this.layer_3.image, 0, 0, this.w, this.h);
  }

  setData(data: any): void {
    this.w = data.width;
    this.h = data.height;
    this.imagem.src = data.img;
    this.grid = data.grid;
    this.imagem.onload = () => {
      this.w = this.imagem.width;
      this.h = this.imagem.height;
      console.log("Map: Imagem carregada");
      console.log("Map_: ", data.img);
      this.isLoaded = true;
    };
    this.imagem.onerror = () => {
      console.log("Map: Erro ao carregar a imagem");
    };

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
    const data = {
      grid: this.grid,
      width: this.w,
      height: this.h,
      size: Map.SIZE,
      img: "8c9c64e0b3fcf049435ca7adc5350507.png",
      start_position: { x: 0, y: 0 },
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
