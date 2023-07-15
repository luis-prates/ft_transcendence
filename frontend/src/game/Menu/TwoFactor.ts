import { Menu, type ElementUI, type Rectangle, Game } from "@/game";

export class TwoFactor {
  private _menu = new Menu({ layer: "Global", isFocus: true});
  private background: ElementUI = this.createBackground();
  private qrImage = new Image();

  private onResult: (result: any) => void = () => {};

  constructor(qrSrc: string) {
    this.qrImage.src = qrSrc;
    /*if (!this.qrImage.complete)
    {
      console.log("NAO ESTA A CARREGAR!")
      return ;
    }*/
    this.menu.add(this.background);
    this.menu.add(this.createButton(40 + 10 / 4, 47, "CONFIRM"));
    this.menu.add(this.createButton(55 - 10 / 4, 47, "CANCEL"));
  }

  private fillTextCenter(ctx: CanvasRenderingContext2D, label: string, x: number, y: number, w: number, h: number, max_with?: number, font?: string, stroke?: boolean) {
    ctx.font = font ? h + "px " + font : h + "px Arial";
    ctx.textAlign = "start";
    
    const begin = x + w * 0.1;
    const max = max_with ? max_with : w - w * 0.2;

    let offset = 0;
    let offsetmax = 0;
    const labelWidth = ctx.measureText(label).width;
    while (begin + offset + labelWidth < begin + max - offset) {
      offsetmax += w * 0.05;
      if (begin + offsetmax + labelWidth > begin + max - offset) break;
      offset = offsetmax;
    }
    
    
    if (stroke)
    ctx.strokeText(label, x + w * 0.1 + offset, y, w - w * 0.2 - offset);
    ctx.fillText(label, x + w * 0.1 + offset, y, w - w * 0.2 - offset);

    //this.ReguaTeste(ctx, x + w * 0.1, y, w - w * 0.2, h, 5);
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
    const inputTwoFactor = document.getElementById("inputTwoFactor") as HTMLInputElement;

    inputTwoFactor.disabled = false;
    inputTwoFactor.style.display = "block";
    inputTwoFactor.style.color = "black";
    inputTwoFactor.style.position = "absolute";
    inputTwoFactor.style.backgroundColor = "transparent";

    const background: ElementUI = {
      type: "image",
      rectangle: { x: "40%", y: "20%", w: "20%", h: "35%" },
      draw: (ctx: any) => {
        const pos = background.rectangle;
        const backgroundColor = "#FFC857";
        const borderColor = "black";
    
        ctx.fillStyle = backgroundColor;
        this.roundRect(ctx, pos.x, pos.y, pos.w, pos.h, 10);
        ctx.fill();
    
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 3;
        ctx.stroke();

        const input_y = pos.y + pos.h * 0.575;
        
        inputTwoFactor.style.width = pos.w * 0.8 + "px";
        inputTwoFactor.style.height = pos.h * 0.15 + "px";
        inputTwoFactor.style.top = input_y + "px";
        inputTwoFactor.style.left = pos.x + pos.w * 0.1 + "px";

        let lado = pos.w * 0.5 < pos.h * 0.5 ? pos.w * 0.5 : pos.h * 0.5;
        //lado = (pos.x + pos.w * 0.25) - (pos.x + pos.w * 0.1);

        const pos_image_x = (pos.w / 2) - (lado / 2);
        const image_y = pos.y + pos.h * 0.05;

        //correction
        lado = (input_y) - (image_y + lado) < 2 ? lado - 5 : lado;

        if (this.qrImage.complete)
          ctx.drawImage(this.qrImage, pos.x + pos_image_x, image_y, lado, lado);

        ctx.strokeStyle = "black";
        ctx.lineWidth = 3;
        ctx.strokeRect(pos.x + pos_image_x, image_y, lado, lado);
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
			
      	  this.roundRect(ctx, button.rectangle.x, button.rectangle.y, button.rectangle.w, button.rectangle.h, 10);
			
      	  ctx.fill();
      	  ctx.stroke();
			
      	  ctx.fillStyle = "black";
      	  ctx.font = "12px Arial";
      	  ctx.textAlign = "start";
      	
          this.fillTextCenter(ctx, label, button.rectangle.x, button.rectangle.y + button.rectangle.h * 0.6, button.rectangle.w, button.rectangle.h * 0.2, undefined, "'Press Start 2P', cursive", false);
        },
      	onClick: () => {
          const inputTwoFactor = document.getElementById("inputTwoFactor") as HTMLInputElement;
          inputTwoFactor.disabled = true;
          inputTwoFactor.style.display = "none";
      	  this.menu.close();
      	  this.onResult(label);
      	},
    };
    return button;
  }

  drawMessage(ctx: CanvasRenderingContext2D, pos: Rectangle, par1: string, par2: string, par3: string)
  {
    ctx.fillStyle = "#ffffff";
    ctx.lineWidth = 4;

    let x = pos.x;
    let y = pos.y + pos.h * 0.15;
    let w = pos.w;
    let h = pos.h * 0.10;

    this.fillTextCenter(ctx, par1, x, y, w, h, undefined, "'Press Start 2P', cursive", true);
    
    y = pos.y + pos.h * 0.5;
    this.fillTextCenter(ctx, par3, x, y, w, h, undefined, "'Press Start 2P', cursive", true);
    ctx.fillStyle = "gold";
    
    y = pos.y + pos.h * 0.325;
    this.fillTextCenter(ctx, par2, x, y, w, h, undefined, "'Press Start 2P', cursive", true);
  }

  //Test
  ReguaTeste(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, lineWidth: number)
  {
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, w, 1);
    ctx.strokeRect(x, (y) - h, w, 1);
    ctx.strokeRect(x + w, (y) - h, 1, h);
    ctx.strokeRect(x, (y) - h, 1, h);
    ctx.lineWidth = lineWidth;
    
    //Medidas
    /*context.strokeRect( pos.x + pos.w * 0.35, pos.y + pos.h * 0.075, pos.w * 0.3, 1);
    context.strokeRect(pos.x, pos.y + pos.h / 2, pos.w, 1);
    context.strokeRect(pos.x + pos.w / 2, pos.y, 1, pos.h);
    context.strokeRect(pos.x + pos.w * 0.33, pos.y, 1, pos.h);
    context.strokeRect(pos.x + pos.w * 0.66, pos.y, 1, pos.h);*/
  }

  get menu(): Menu {
    return this._menu;
  }

  public show(onResult: (result: any) => void) {
    this.onResult = onResult;
    Game.addMenu(this.menu);
  }
  
}
