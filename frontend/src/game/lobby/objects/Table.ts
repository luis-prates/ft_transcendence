import { Game, type GameObject, Map } from "@/game";
import type { GameObjectType } from "@/game/base/GameObject";
import table from "@/assets/images/lobby/table0.png";

interface TableOnline {
  objectId?: any;
  x: number;
  y: number;
  color: string;
  type?: string;
}

export class Table implements GameObject {
  type: GameObjectType = "table";
  imagem: any = new Image();
  w: number;
  h: number;
  isSelect: boolean;
  objectId: number = 0;
  private _data: TableOnline;

  constructor(data: TableOnline) {
    this._data = data;
    this.data.objectId = Game.getPlayer().objectId + "_" + Date.now();
    this.objectId = this.data.objectId;
    this.data.type = "type";
    this.w = 32;
    this.h = 64;
    this.isSelect = false;
    this.imagem.src = table;
    Game.Map.grid[this.x / Map.SIZE][this.y / Map.SIZE] = 1;
  }

  private pontoEvento = [
    { x: 13, y: 68, isFree: true },
    { x: 13, y: -5, isFree: true },
  ];

  draw(contex: CanvasRenderingContext2D): void {
    contex.fillStyle = this.data.color;
    contex.fillRect(this.x, this.y - 10, this.w - 1, this.h - 14);
    contex.drawImage(this.imagem, this.x, this.y - 10, this.w, this.h);
    // this.pontoEvento.forEach((ponto) => {
    //   contex.fillStyle = ponto.isFree ? "yellow" : "red";
    //   contex.fillRect(this.x + ponto.x, this.y + ponto.y, 6, 6);
    // });
  }

  setData(data: any): void {}

  update(deltaTime: number): void {}

  getPointEvent(): { x: number; y: number } {
    console.log("getPointEvent: ", this.pontoEvento);
    let _ponto = { x: this.x, y: this.y };

    for (let ponto of this.pontoEvento) {
      if (ponto.isFree && _ponto.x === this.x && _ponto.y === this.y) {
        ponto.isFree = false;
        console.log("ponto: ", ponto);
        _ponto = { x: this.x + ponto.x, y: this.y + ponto.y };
      } else ponto.isFree = true;
    }
    return _ponto;
  }

  get x(): number {
    return this.data.x;
  }

  get y(): number {
    return this.data.y;
  }

  public set data(data: TableOnline) {
    this._data = data;
  }

  public get data(): TableOnline {
    return this._data;
  }
}
