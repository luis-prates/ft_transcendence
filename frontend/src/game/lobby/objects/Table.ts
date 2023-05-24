import { Game, type GameObject, Map } from "@/game";
import type { GameObjectType } from "@/game/base/GameObject";
import table from "@/assets/images/lobby/table0.png";
import Router from "@/router";

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
  objectId: string;
  private _data: TableOnline;

  constructor(data: TableOnline) {
    this._data = data;
    this.data.objectId = data.objectId;
    this.objectId = this.data.objectId;
    this.data.type = "type";
    this.w = 32;
    this.h = 64;
    this.isSelect = false;
    this.imagem.src = table;
    Game.grid[this.x / Map.SIZE][this.y / Map.SIZE] = 1;
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

  destroy(): void {
    Game.grid[this.x / Map.SIZE][this.y / Map.SIZE] = 0;
  }

  setData(data: any): void {}

  getPointEvent(): { x: number; y: number } {
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

  interaction(gameObject: GameObject): void {
    Router.push(
      `/game?objectId=${this.objectId}&maxScore=3&table=green&bot=true&avatar=https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/bc9ffd43-db87-475c-a8f0-0e57fc3d5c43/d7piatk-383ae681-e8c5-4580-a77a-96e856cd1c3c.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcL2JjOWZmZDQzLWRiODctNDc1Yy1hOGYwLTBlNTdmYzNkNWM0M1wvZDdwaWF0ay0zODNhZTY4MS1lOGM1LTQ1ODAtYTc3YS05NmU4NTZjZDFjM2MucG5nIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.poDHxDZ5KSHu4L-CsyOcCoR_m3krSLS_otv-VgXLvMM&nickname=rteles&color=blue&skinPlayer=mario`
    );
  }
}
