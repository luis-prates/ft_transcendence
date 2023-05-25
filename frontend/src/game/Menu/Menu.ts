import { Game } from "..";
import { type GameObject, type GameObjectType, type Rectangle } from "../base/GameObject";

export interface ElementUI {
  type?: string;
  retanglulo: Rectangle;
  draw(contex: CanvasRenderingContext2D): void;
  onClick?(): void;
}

export type ElementUIType = "button" | "text" | "image";
export type MenuLayer = "Local" | "Global";

export class Menu implements GameObject {
  type: GameObjectType = "menu";
  layer: MenuLayer = "Local";
  imagem: any;
  x: number = 0;
  y: number = 0;
  objectId: any;
  isSelect: boolean = false;
  private elements: ElementUI[] = [];
  private _onClose: () => void = () => {};

  constructor(data?: { timeOut?: number; layer?: MenuLayer }) {
    if (!data) return;
    if (data.timeOut) {
      setTimeout(() => {
        Game.instance.removeMenu(this);
      }, data.timeOut);
    }
    if (data.layer) {
      this.layer = data.layer;
    }
  }

  draw(contex: CanvasRenderingContext2D): void {
    this.elements.forEach((element) => {
      element.draw(contex);
    });
  }

  mouseClick(x: number, y: number, button: number): boolean {
    const select: ElementUI = this.elements.find(
      (element) => element.onClick && x >= element.retanglulo.x && x <= element.retanglulo.x + element.retanglulo.w && y >= element.retanglulo.y && y <= element.retanglulo.y + element.retanglulo.h
    ) as ElementUI;
    if (select && select.onClick) select.onClick();
    return select ? true : false;
  }

  setData(data: any) {}

  public add(...elements: ElementUI[]) {
    if (elements === null || elements === undefined) return;
    elements.forEach((element) => {
      (element as any)["resizing"] = { x: element.retanglulo.x, y: element.retanglulo.y, w: element.retanglulo.w, h: element.retanglulo.h };
      console.log("element: ", element);
      this.resizing(element, this.w, this.h);
      this.elements.push(element);
    });
  }

  public remove(element: ElementUI): boolean {
    const size = this.elements.length;
    this.elements = this.elements.filter((e) => e !== element);
    return size !== this.elements.length;
  }

  get w() {
    return window.innerWidth;
  }

  get h() {
    return window.innerHeight;
  }

  onResize(width: number, height: number): void {
    this.elements.forEach((element) => {
      this.resizing(element, width, height);
    });
  }

  private resizing(element: ElementUI & any, width: number, height: number): void {
    if (typeof element.resizing.x == "string" && element.resizing.x.includes("%")) element.retanglulo.x = (parseFloat(element.resizing.x) * width) / 100;
    if (typeof element.resizing.y == "string" && element.resizing.y.includes("%")) element.retanglulo.y = (parseFloat(element.resizing.y) * height) / 100;
    if (typeof element.resizing.w == "string" && element.resizing.w.includes("%")) element.retanglulo.w = (parseFloat(element.resizing.w) * width) / 100;
    if (typeof element.resizing.h == "string" && element.resizing.h.includes("%")) element.retanglulo.h = (parseFloat(element.resizing.h) * height) / 100;
    console.log("element: ", element);
  }

  public get onClose(): () => void {
    return this._onClose;
  }

  public set onClose(value: () => void) {
    this._onClose = value;
  }
}
