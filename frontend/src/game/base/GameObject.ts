export type GameObjectType = "map" | "character" | "npc" | "item" | "player";

export interface GameObject {
  type: GameObjectType;
  imagem: any;
  x: number;
  y: number;
  w: number;
  h: number;
  isSelect: boolean;

  draw(contex: CanvasRenderingContext2D): void;
  update(deltaTime: number): void;
  mouseClick?(x: number, y: number, button: number): void;
  onSelected?(): void;
  onDeselected?(): void;
  getPointEvent?(): { x: number; y: number };
}
