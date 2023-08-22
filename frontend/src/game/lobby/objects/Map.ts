import type { GameObject, GameObjectType } from "../../base/GameObject";
import { Game, Lobby, type Rectangle } from "@/game";

export interface layer_1 {
  image: HTMLImageElement;
  opacity: number;
}

export interface layer_2 {
  image: HTMLImageElement;
  opacity: number;
  grid: number[][];
}

export interface layer_3 {
  image: HTMLImageElement;
  opacity: number;
  objects: Rectangle[];
  context: CanvasRenderingContext2D;
  colision(): Rectangle | undefined;
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
  objectId = 0;
  protected isLoaded = false;
  public layer_1: layer_1 = { image: new Image(), opacity: 1 };
  public layer_2: layer_2 = { image: new Image(), opacity: 1, grid: [] };
  public layer_3: layer_3;
  public datas: any[] = [];

  private cachedLayer3: HTMLCanvasElement | null = null;
  private cachedLayer3Context: CanvasRenderingContext2D | null = null;
  private cachedMapObjs: HTMLCanvasElement | null = null;
  private cachedMapObjsContext: CanvasRenderingContext2D | null = null;

  public paintedOnce = false;

  constructor(data?: any) {
    this.type = "map";
    const canva = document.createElement("canvas") as HTMLCanvasElement;
    this.layer_3 = {
      image: new Image(),
      opacity: 0.5,
      objects: [],
      context: canva.getContext("2d", { willReadFrequently: true }) as CanvasRenderingContext2D,
      colision(): Rectangle | undefined {
        return this.objects.find((obj) => obj.x <= Game.getPlayer().x && obj.x + obj.w >= Game.getPlayer().x && obj.y <= Game.getPlayer().y && obj.y + obj.h >= Game.getPlayer().y);
      },
    };
    if (data) this.setData(data);
  }

  setData(data: any) {
    this.isLoaded = false;
    Lobby.mapObjectId = data?.objectId;
    return new Promise((resolve) => {
      console.log(data);
      this.datas = data?.datas || [];
      this.layer_1.image.src = data.layer_1.image;
      this.layer_1.opacity = data.layer_1.opacity;
      this.layer_2.image.src = data.layer_2.image;
      this.layer_2.opacity = data.layer_2.opacity;
      this.layer_3.image.src = data.layer_3.image;
      this.layer_3.opacity = data.layer_3.opacity;
      this.layer_3.objects = data.layer_3.objects;
      // this.layer_1.image.onerror = () => console.log("error 1 ", data.layer_1.image);
      // this.layer_2.image.onerror = () => console.log("error 2 ", data.layer_2.image);
      // this.layer_3.image.onerror = () => console.log("error 3 ", data.layer_3.image);
      // this.layer_3.image.onload = () => console.log("layer_3");
      // this.layer_2.image.onload = () => console.log("layer_2");
      this.layer_1.image.onload = () => {
        this.w = data?.width || this.layer_1.image.width;
        this.h = data?.height || this.layer_1.image.height;
        this.layer_3.context.canvas.width = this.w;
        this.layer_3.context.canvas.height = this.h;
        if (data?.grid) this.layer_2.grid = data.grid;
        else {
          for (let i = 0; i < this.w / Map.SIZE; i++) {
            this.layer_2.grid[i] = [];
            for (let j = 0; j < this.h / Map.SIZE; j++) {
              this.layer_2.grid[i][j] = 0;
            }
          }
        }
        setTimeout(() => {
          this.isLoaded = true;
          resolve(this.isLoaded);
        }, 1000);
      };
    });
  }

  keydown(key: string): void { }

  draw(contex: CanvasRenderingContext2D): void {

    contex.strokeStyle = "rgb(30, 39, 210)";
    contex.strokeRect(this.x, this.y, this.w, this.h);
    if (this.isLoaded) {

      // If the cached canvas doesn't exist or the layer's size has changed, create a new cached canvas
      if (!this.cachedMapObjs || this.cachedMapObjs.width !== this.w || this.cachedMapObjs.height !== this.h) {
        this.cachedMapObjs = document.createElement("canvas");
        this.cachedMapObjs.width = this.w;
        this.cachedMapObjs.height = this.h;
        this.cachedMapObjsContext = this.cachedMapObjs.getContext("2d");
      }

      // Now, instead of drawing directly to the main context, you're doing so on the cached context
      if (this.layer_1.image.complete && this.cachedMapObjsContext) {
        this.cachedMapObjsContext.strokeStyle = "blue";
        this.cachedMapObjsContext.drawImage(this.layer_1.image, 0, 0, this.w, this.h);
      }

      if (this.cachedMapObjs) {
        contex.drawImage(this.cachedMapObjs, 0, 0);
      }
    }
    if (Game.isDragover) {
      const rec: Rectangle = Game.getPlayer().getRetanguloTable();
      // verde opaco
      contex.fillStyle = "rgba(0, 255, 0, 0.5)";
      contex.fillRect(rec.x, rec.y, rec.w, rec.h);
      // borda verde
      contex.strokeStyle = "green";
      contex.strokeRect(rec.x, rec.y, rec.w, rec.h);
    }
  }

  drawLayer_3(contex: CanvasRenderingContext2D): void {
    if (!this.paintedOnce) {
      // If the cached canvas doesn't exist or the layer's size has changed, create a new cached canvas
      if (!this.cachedLayer3 || this.cachedLayer3.width !== this.layer_3.context.canvas.width || this.cachedLayer3.height !== this.layer_3.context.canvas.height) {
        this.cachedLayer3 = document.createElement("canvas");
        this.cachedLayer3.width = this.layer_3.context.canvas.width;
        this.cachedLayer3.height = this.layer_3.context.canvas.height;
        this.cachedLayer3Context = this.cachedLayer3.getContext("2d");
      }

      if (this.layer_3.image.complete && this.cachedLayer3Context) {
        this.cachedLayer3Context.clearRect(0, 0, this.cachedLayer3.width, this.cachedLayer3.height);
        //   this.cachedLayer3Context.drawImage(this.layer_3.image, 0, 0);
        this.layer_3.context.drawImage(this.layer_3.image, 0, 0);
        const imageData = this.layer_3.context.getImageData(0, 0, this.layer_3.image.width, this.layer_3.image.height);
        const data = imageData.data;
        const opacityFactor = 128 / 255; // Opacidade de 50%
        // Modify the copied data
        for (let i = 3; i < data.length; i += 4) {
          data[i] = data[i] * opacityFactor;
        }
        this.cachedLayer3Context.putImageData(imageData, 0, 0);
      }
      this.paintedOnce = true;
    }
    if (this.cachedLayer3) {
      contex.drawImage(this.cachedLayer3, 0, 0);
    }
  }

  mouseClick(x: number, y: number, button: number): void { }

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
      start_position: { x: 0, y: 0 },
      objectId: this.objectId.toString(),
    };
    const jsonStr = JSON.stringify(data);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "map.json";
    link.click();

    console.log("Salvando mapa...\n");
  }

  public isCollision(gameObject: GameObject): boolean {
    const x = Math.floor(gameObject.x / Map.SIZE);
    const y = Math.floor(gameObject.y / Map.SIZE);
    const w = Math.floor(gameObject.w / Map.SIZE);
    const h = Math.floor(gameObject.h / Map.SIZE);
    console.log("map: isCollision: x: " + x + " y: " + y + " w: " + w + " h: " + h);
    for (let j = y; j < y + h; j++) {
      for (let i = x; i < x + w; i++) {
        console.log("map: isCollision: i: " + i + " j: " + j, "grid: " + Game.grid[i][j]);
        if (Game.grid[i][j] == 1) {
          return true;
        }
      }
    }
    return false;
  }
}
