import { Game } from "../base/Game";
import { type GameObject, type GameObjectType, type Rectangle } from "../base/GameObject";

export interface ElementUI {
  type?: string;
  rectangle: Rectangle;
  draw(contex: CanvasRenderingContext2D): void;
  onClick?(): void;
  parent?: ElementUI;
  children?: ElementUI[];
  enable?: boolean;
  visible?: boolean;
}

export type ElementUIType = "button" | "text" | "image";
export type MenuLayer = "Local" | "Global";

export class Menu implements GameObject {
  public type: GameObjectType = "menu";
  public layer: MenuLayer = "Local";
  public imagem: any;
  public x: number = 0;
  public y: number = 0;
  public objectId: any;
  public visible: boolean = true;
  public enable: boolean = true;
  public isSelect: boolean = false;
  private _background: ElementUI;
  private elements: ElementUI[] = [];
  private _onClose: () => void = () => {};
  public KeyClose: string = "";

  constructor(data?: { timeOut?: number; layer?: MenuLayer; onClose?: () => void; isFocus?: boolean; KeyClose?: string; enable?: boolean; visible?: boolean }) {
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
    if (data.enable) this.enable = data.enable;
    if (data.visible) this.visible = data.visible;
    if (data.KeyClose) this.KeyClose = data.KeyClose;
  }

  draw(contex: CanvasRenderingContext2D): void {
    if (!this.visible) return;
    this.elements.forEach((element) => {
      if (element.visible) element.draw(contex);
    });
  }

  mouseClick(x: number, y: number, button: number): boolean {
    if (!this.enable) return false;
    for (let i = this.elements.length - 1; i >= 0; i--) {
      const element = this.elements[i];
      if (
        element.enable &&
        element.visible &&
        element.onClick &&
        x >= element.rectangle.x &&
        x <= element.rectangle.x + element.rectangle.w &&
        y >= element.rectangle.y &&
        y <= element.rectangle.y + element.rectangle.h
      ) {
        element.onClick();
        return true;
      }
    }
    return false;
  }

  setData(data: any) {}

  public add(parent?: ElementUI, ...elements: ElementUI[]) {
    if (parent && (elements === null || elements === undefined || elements.length === 0)) {
      elements = parent ? [parent] : [];
      parent = undefined;
    }
    if (elements === null || elements === undefined) return;
    elements.forEach((element: any) => {
      if (element.enable === undefined) element.enable = true;
      if (element.visible === undefined) element.visible = true;
      element.parent = parent;
      if (parent) {
        element.visible = parent.visible;
        element.enable = parent.enable;
        if (!parent.children) parent.children = [];
        parent.children?.push(element);
      }
      element["_visible"] = element.visible;
      Object.defineProperty(element, "visible", {
        get() {
          return element._visible;
        },
        set(value: string) {
          element.children?.forEach((e: any) => (e.visible = value));
          element._visible = value;
        },
        enumerable: true,
        configurable: true,
      });
      element["_enable"] = element.enable;
      Object.defineProperty(element, "enable", {
        get() {
          return element._enable;
        },
        set(value: string) {
          element.children?.forEach((e: any) => (e.enable = value));
          element._enable = value;
        },
        enumerable: true,
        configurable: true,
      });
      (element as any)["resizing"] = { x: element.rectangle.x, y: element.rectangle.y, w: element.rectangle.w, h: element.rectangle.h };
      this.resizing(element, this.w, this.h);
      this.elements.push(element);
    });
  }

  public close() {
    Game.instance.removeMenu(this);
  }

  public remove(...elements: ElementUI[]): boolean {
    const size = this.elements.length;
    if (elements === null || elements === undefined) return false;
    elements.forEach((element) => {
      this.elements = this.elements.filter((e) => e !== element);
    });
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
