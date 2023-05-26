import { Game } from "../base/Game";
import { type GameObject, type GameObjectType, type Rectangle } from "../base/GameObject";

export interface ElementUI {
  type?: string;
  rectangle: Rectangle;
  draw(contex: CanvasRenderingContext2D): void;
  onClick?(): void;
  parent?: ElementUI;
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
  private _background: ElementUI;
  private elements: ElementUI[] = [];
  private _onClose: () => void = () => {};
  public KeyClose: string = "";

  constructor(data?: { timeOut?: number; layer?: MenuLayer; onClose?: () => void; isFocus?: boolean; KeyClose?: string }) {
    this._background = {
      type: "background",
      rectangle: { x: "0%", y: "0%", w: "100%", h: "100%" },
      draw: (contex: CanvasRenderingContext2D) => {},
    };
    this.add(this._background);
    if (!data) return;
    if (data.isFocus) this.background.onClick = () => {};
    if (data.timeOut) {
      setTimeout(() => {
        Game.instance.removeMenu(this);
      }, data.timeOut);
    }
    if (data.layer) {
      this.layer = data.layer;
    }
    if (data.KeyClose) this.KeyClose = data.KeyClose;
  }

  draw(contex: CanvasRenderingContext2D): void {
    this.elements.forEach((element) => {
      element.draw(contex);
    });
  }

  mouseClick(x: number, y: number, button: number): boolean {
    for (let i = this.elements.length - 1; i >= 0; i--) {
      const element = this.elements[i];
      console.log("element: ", element, " isClick: ", x >= element.rectangle.x && x <= element.rectangle.x + element.rectangle.w && y >= element.rectangle.y && y <= element.rectangle.y + element.rectangle.h);
      if (element.onClick && x >= element.rectangle.x && x <= element.rectangle.x + element.rectangle.w && y >= element.rectangle.y && y <= element.rectangle.y + element.rectangle.h) {
        element.onClick();
        return true;
      }
    }
    return false;
  }

  setData(data: any) {}

  public add(...elements: ElementUI[]) {
    if (elements === null || elements === undefined) return;
    elements.forEach((element) => {
      (element as any)["resizing"] = { x: element.rectangle.x, y: element.rectangle.y, w: element.rectangle.w, h: element.rectangle.h };
      this.resizing(element, this.w, this.h);
      this.elements.push(element);
    });
  }

  public close() {
    Game.instance.removeMenu(this);
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

  get background(): ElementUI {
    return this._background;
  }

  onResize(width: number, height: number): void {
    this.elements.forEach((element) => {
      this.resizing(element, width, height);
    });
  }

  private resizing(element: ElementUI & any, width: number, height: number): void {
    // if (element.parent) {
    //   width = element.parent.rectangle.w;
    //   height = element.parent.rectangle.h;
    // }
    if (typeof element.resizing.x == "string" && element.resizing.x.includes("%")) element.rectangle.x = (parseFloat(element.resizing.x) * width) / 100;
    if (typeof element.resizing.y == "string" && element.resizing.y.includes("%")) element.rectangle.y = (parseFloat(element.resizing.y) * height) / 100;
    if (typeof element.resizing.w == "string" && element.resizing.w.includes("%")) element.rectangle.w = (parseFloat(element.resizing.w) * width) / 100;
    if (typeof element.resizing.h == "string" && element.resizing.h.includes("%")) element.rectangle.h = (parseFloat(element.resizing.h) * height) / 100;

    // if (element.parent) {
    //   element.rectangle.x += element.parent.rectangle.x;
    //   element.rectangle.y += element.parent.rectangle.y;
    // }
  }

  public get onClose(): () => void {
    return this._onClose;
  }

  public set onClose(value: () => void) {
    this._onClose = value;
  }
}
