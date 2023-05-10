import type { GameObject, GameObjectType } from "../../base/GameObject";
import titles from "@/assets/images/lobby/tiles.png";

export class Map implements GameObject {
  imagem: any = new Image();
  x: number = 0;
  y: number = 0;
  w: number = 0;
  h: number = 0;
  type: GameObjectType;
  isSelect: boolean = false;
  public static SIZE = 32;
  public static map: number[][] = [];

  // Definindo as configurações do grid
  numLinhas = 10; // Número de linhas do grid
  numColunas = 10; // Número de colunas do grid

  constructor() {
    this.type = "map";
    this.imagem.src = titles;
    this.w = 1000;
    this.h = 1000;
    const sw = this.w / Map.SIZE;
    const sh = this.h / Map.SIZE;
    Map.map = [];
    for (let i = 0; i < sh; i++) {
      Map.map[i] = [];
      for (let j = 0; j < sw; j++) {
        Map.map[i][j] = 0;
      }
    }
  }

  draw(contex: CanvasRenderingContext2D): void {
    contex.strokeStyle = "blue";
    for (let x = 0; x < this.w; x += Map.SIZE) {
      for (let y = 0; y < this.h; y += Map.SIZE) {
        contex.drawImage(this.imagem, 576, 0, Map.SIZE, Map.SIZE, x, y, Map.SIZE, Map.SIZE);
        contex.strokeRect(x, y, Map.SIZE, Map.SIZE);
        if (Map.map[Math.floor(x / Map.SIZE)][Math.floor(y / Map.SIZE)] === 1) {
          contex.fillStyle = "rgba(255, 0, 0, 0.5)";
          contex.fillRect(x, y, Map.SIZE, Map.SIZE);
        }
      }
    }
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
      console.log("Map: ", x, y, button);
      Map.map[x][y] = 1;
    }
    console.log("Map: ", x, y, button);
  }

  async saveMap() {
    const data = {
      map: Map.map,
      width: this.w,
      height: this.h,
      size: Map.SIZE,
    };
    // const jsonData = JSON.stringify(this.data, null, 2);
    // await fs.writeJson("output.json", data, { spaces: 2 });
    // fs.writeFileSync("output.json", jsonData);
  }
}
