export class Table {
  width: number = 30;
  height: number = 100;
  background: string;
  color: string;

  constructor(width: number, height: number, background: string, color: string) {
    this.width = width;
    this.height = height;
    this.background = background;
    this.color = color;
  }

  update() {}

  draw(context: CanvasRenderingContext2D) {
    context.fillStyle = this.background;
    context.fillRect(0, 0, this.width, this.height);
    context.fillStyle = "white";
    context.fillRect(68, 164, this.width - 137, this.height - 228);
    context.fillStyle = this.color;
    context.fillRect(78, 174, this.width - 158, this.height - 248);
    context.fillStyle = "white";
    context.fillRect(78, this.height - 330, this.width - 154, 10);
    context.fillRect(this.width / 2 - 5, 152, 10, this.height - 205);
    context.fillStyle = "black";
    context.fillRect(this.width / 2 - 10, 132, 20, 20);
    context.fillRect(this.width / 2 - 10, this.height - 53, 20, 20);
  }
}
