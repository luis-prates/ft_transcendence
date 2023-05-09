export interface GameObject {
  imagem: any;
  x: number;
  y: number;
  w: number;
  h: number;

  draw(contex: CanvasRenderingContext2D): void;
  update(deltaTime: number): void;
  mouseClick?(x: number, y: number, button: number): void;
}
