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

  private fillTextCenter(ctx: CanvasRenderingContext2D, label: string, rectangle: Rectangle, y: number, stroke?: boolean, max_with?: number)
  {
    const begin = rectangle.x + rectangle.w * 0.1;
    const max = max_with ? max_with : rectangle.w - rectangle.w * 0.2;

    let offset = 0;
    let offsetmax = 0;
    const labelWidth = ctx.measureText(label).width;
    while (begin + offset + labelWidth < begin + max - offset) {
      offsetmax += rectangle.w * 0.05;
      if (begin + offsetmax + labelWidth > begin + max - offset) break;
      offset = offsetmax;
    }

    if (stroke)
      ctx.strokeText(label, rectangle.x + rectangle.w * 0.1 + offset, y, rectangle.w - rectangle.w * 0.2 - offset);
    ctx.fillText(label, rectangle.x + rectangle.w * 0.1 + offset, y, rectangle.w - rectangle.w * 0.2 - offset);
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
      	  ctx.textAlign = "start";
      	
          this.fillTextCenter(ctx, label, button.rectangle, button.rectangle.y + button.rectangle.h * 0.6);
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

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 18px Arial";
    ctx.textAlign = "start";
    ctx.lineWidth = 3;

    this.fillTextCenter(ctx, "Do you want to buy,", pos, pos.y + pos.h * 0.15, true);
    this.fillTextCenter(ctx, "for " + this.productPrice + "₳?", pos, pos.y + pos.h * 0.48, true);
    ctx.fillStyle = "gold";
    this.fillTextCenter(ctx, this.productName, pos, pos.y + pos.h * 0.32, true);
  }

  public show(onResult: (result: any) => void) {
    this.onResult = onResult;
    Game.addMenu(this.menu);
  }
}
/*
//Regua Horizontal
ctx.strokeRect(button.rectangle.x + button.rectangle.w * 0.475, button.rectangle.y + button.rectangle.h * 0.05, button.rectangle.w * 0.05, 1);

ctx.strokeRect(button.rectangle.x, button.rectangle.y + button.rectangle.h / 2, button.rectangle.w, 1);
ctx.strokeRect(button.rectangle.x + button.rectangle.w / 2, button.rectangle.y, 1, button.rectangle.h);
ctx.strokeRect(button.rectangle.x + button.rectangle.w * 0.33, button.rectangle.y, 1, button.rectangle.h);
ctx.strokeRect(button.rectangle.x + button.rectangle.w * 0.66, button.rectangle.y, 1, button.rectangle.h);
*/