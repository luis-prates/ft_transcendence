export type GameObjectType = "map" | "character" | "npc" | "item" | "player" | "camera" | "table" | "door" | "tree" | "water_font";

export interface GameObject {
  type: GameObjectType;
  imagem: any;
  x: number;
  y: number;
  w: number;
  h: number;
  objectId: any;
  isSelect: boolean;

  draw(contex: CanvasRenderingContext2D): void;
  update?(deltaTime: number): void;
  mouseClick?(x: number, y: number, button: number): void;
  onSelected?(): void;
  onDeselected?(): void;
  getPointEvent?(): { x: number; y: number };
  destroy?(): void;
  setData(data: any): any;
  interaction?(gameObject: GameObject): void;
  isCollision?(gameObject: GameObject): boolean;
}
