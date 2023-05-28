import { Menu, type ElementUI, type Rectangle, Game } from "@/game";

export class ConfirmButton {
  private menu = new Menu({ layer: "Global", isFocus: true });
  private radius: number = 10;
  private background: ElementUI = this.createBackground();
  private productName: string;
  private productPrice: number;
  private onResult: (result: any) => void = () => {};

  constructor(productName: string, productPrice: number) {
    this.productName = productName;
    this.productPrice = productPrice;
    this.menu.add(this.background);
    this.menu.add(this.createButton(40 + 10 / 4, 57, "CONFIRM"));
    this.menu.add(this.createButton(55 - 10 / 4, 57, "CANCEL"));
  }

  private roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
    const r = x + width;
    const b = y + height;
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(r - radius, y);
    ctx.quadraticCurveTo(r, y, r, y + radius);
    ctx.lineTo(r, y + height - radius);
    ctx.quadraticCurveTo(r, b, r - radius, b);
    ctx.lineTo(x + radius, b);
    ctx.quadraticCurveTo(x, b, x, b - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  private createBackground(): ElementUI {
    const background: ElementUI = {
      type: "image",
      rectangle: { x: "40%", y: "45%", w: "20%", h: "20%" },
      draw: (context: any) => {
        this.drawBackground(context, background.rectangle);
      },
    };
    return background;
  }

  private createButton(x: number, y: number, label: string): ElementUI {
    const button: ElementUI = {
      type: "exit",
      rectangle: { x: x + "%", y: y + "%", w: "5%", h: "6%" },
      draw: (ctx: CanvasRenderingContext2D) => {
        ctx.fillStyle = "white";
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;

        this.roundRect(ctx, button.rectangle.x, button.rectangle.y, button.rectangle.w, button.rectangle.h, this.radius);

        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "black";
        ctx.font = "12px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(label, button.rectangle.x + button.rectangle.w / 2, button.rectangle.y + button.rectangle.h / 2);
      },
      onClick: () => {
        this.menu.close();
        this.onResult(label);
      },
    };
    return button;
  }

  private drawBackground(ctx: CanvasRenderingContext2D, pos: Rectangle) {
    const backgroundColor = "#FFC857";
    const borderColor = "black";

    ctx.fillStyle = backgroundColor;
    this.roundRect(ctx, pos.x, pos.y, pos.w, pos.h, this.radius);
    ctx.fill();

    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    /*ctx.fillStyle = '#ffffff';
		ctx.font = 'bold 22px Arial';
		ctx.textAlign = 'center';
		ctx.fillText('CONFIRM?', pos.x + pos.w / 2, pos.y + pos.h * 0.15);
		ctx.strokeText('CONFIRM?', pos.x + pos.w / 2, pos.y + pos.h * 0.15);*/

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 18px Arial";
    ctx.textAlign = "center";
    ctx.lineWidth = 1;
    ctx.fillText("Do you want to buy,", pos.x + pos.w / 2, pos.y + pos.h * 0.15);
    ctx.strokeText("Do you want to buy,", pos.x + pos.w / 2, pos.y + pos.h * 0.15);
    ctx.fillStyle = "gold";
    ctx.fillText(this.productName, pos.x + pos.w / 2, pos.y + pos.h * 0.3);
    ctx.strokeText(this.productName, pos.x + pos.w / 2, pos.y + pos.h * 0.3);
    ctx.fillStyle = "#ffffff";
    ctx.fillText("for " + this.productPrice + "₳?", pos.x + pos.w / 2, pos.y + pos.h * 0.45);
    ctx.strokeText("for " + this.productPrice + "₳?", pos.x + pos.w / 2, pos.y + pos.h * 0.45);
  }

  public show(onResult: (result: any) => void) {
    this.onResult = onResult;
    Game.addMenu(this.menu);
  }
}
