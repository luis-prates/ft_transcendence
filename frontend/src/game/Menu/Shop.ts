import { Menu, type ElementUI, type Rectangle, Game } from "@/game";

//Paddle Skin
import skin_mario from "@/assets/images/skin/line/skin_Mario.jpeg";

//Table Skin
import skin_onepiece from "@/assets/images/skin/table/skin_onepiece.jpg";

//Sound
import sound_caching from "@/assets/audio/caching.mp3";
import sound_close_tab from "@/assets/audio/close.mp3";
import { ConfirmButton } from "./ConfirmButton";

export class Shop {
  private _menu = new Menu({ layer: "Global", isFocus: true });
  private radius: number = 10;
  private background: ElementUI = this.createBackground();

  constructor() {
    this.menu.add(this.background);
    this.menu.add(this.createButtonExit(10.5, 11));
    this.createAll();
  }

  private createBackground(): ElementUI {
    const background: ElementUI = {
      type: "image",
      rectangle: { x: "10%", y: "10%", w: "80%", h: "80%" },
      draw: (context: any) => {
        this.draw(context, background.rectangle);
      },
    };
    return background;
  }

  private createAll() {
    // Configurações para desenhar os quadrados de produtos
    const squareW = 10;
    const squareH = 15;
    const paddingX = 6;
    const paddingY = 9;

    // Loop para desenhar os quadrados de produtos
    for (let i = 0; i < 15; i++) {
      const squareX = 10 + 3 + (i % 5) * (squareW + paddingX);
      const squareY = 10 + paddingY + Math.floor(i / 5) * (squareH + paddingY);

      if (i % 2) this.menu.add(this.createProduct("Text " + i, "table", skin_onepiece, squareX, squareY));
      else this.menu.add(this.createProduct("Text " + i, "paddle", skin_mario, squareX, squareY));
    }
  }

  private createProduct(name: string, type: string, image_src: string, x: number, y: number): ElementUI {
    const photo = new Image();
    photo.src = image_src;
    const buy_sound = new Audio(sound_caching);

    //const confirmButton = new ConfirmButton();

    const product: ElementUI = {
      type: "image",
      rectangle: { x: x + "%", y: y + "%", w: "10%", h: "15%" },
      draw: (ctx: CanvasRenderingContext2D) => {
        const offSetTittle = this.background.rectangle.y * 0.05;
        const offSetPrice = this.background.rectangle.y * 0.2;

        ctx.fillStyle = "DarkSlateBlue";
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 2;

        this.roundRect(ctx, product.rectangle.x, product.rectangle.y, product.rectangle.w, product.rectangle.h, this.radius);

        ctx.fill();
        ctx.stroke();

        /*ctx.fillRect(product.rectangle.x, product.rectangle.y, product.rectangle.w, product.rectangle.h);
		  		ctx.strokeRect(product.rectangle.x, product.rectangle.y, product.rectangle.w, product.rectangle.h);*/

        if (type == "table" && photo.complete) {
          const scaledWidth = product.rectangle.w * 0.8;
          const scaledHeight = product.rectangle.h * 0.78;
          const pointx = (product.rectangle.w - scaledWidth) / 2;
          const pointy = (product.rectangle.h - scaledHeight) / 2;

          ctx.fillStyle = "white";
          ctx.fillRect(
            product.rectangle.x + pointx - this.background.rectangle.y * 0.78 * 0.015,
            product.rectangle.y + pointy - this.background.rectangle.y * 0.78 * 0.015,
            scaledWidth + this.background.rectangle.y * 0.78 * 0.03,
            scaledHeight + this.background.rectangle.y * 0.78 * 0.03
          );

          if (photo.complete) ctx.drawImage(photo, product.rectangle.x + pointx, product.rectangle.y + pointy, scaledWidth, scaledHeight);

          //Midle Line
          ctx.fillRect(product.rectangle.x + pointx, product.rectangle.y + pointy + (scaledHeight / 2 - this.background.rectangle.y * 0.78 * 0.01), scaledWidth, this.background.rectangle.y * 0.78 * 0.02);
          //Vertical
          ctx.fillRect(product.rectangle.x + (product.rectangle.w / 2 - this.background.rectangle.y * 0.78 * 0.01), product.rectangle.y + pointy, this.background.rectangle.y * 0.78 * 0.02, scaledHeight);
        } else if (type == "paddle" && photo.complete) {
          const scale = 100 / 30;
          const scaledWidth = product.rectangle.w * 0.15 * scale;
          const scaledHeight = product.rectangle.h * 0.3 * scale;
          const pointx = (product.rectangle.w - scaledWidth * 0.5) / 2;
          const pointy = (product.rectangle.h - scaledHeight * 0.9) / 2;

          if (photo.complete) {
            ctx.drawImage(photo, product.rectangle.x + pointx, product.rectangle.y + pointy, scaledWidth * 0.5, scaledHeight * 0.9);
          }

          ctx.strokeStyle = "black";
          ctx.lineWidth = 3;
          ctx.strokeRect(product.rectangle.x + pointx, product.rectangle.y + pointy, scaledWidth * 0.5, scaledHeight * 0.9);
        }

        // Desenha o título do produto acima do quadrado
        ctx.fillStyle = "#000";
        ctx.font = "12px Arial";
        ctx.textAlign = "center";
        ctx.fillText(name, product.rectangle.x + product.rectangle.w / 2, product.rectangle.y - offSetTittle);

        // Desenha o preço do produto abaixo do quadrado
        ctx.fillStyle = "#000";
        ctx.font = "12px Arial";
        ctx.textAlign = "center";
        //548₳
        ctx.fillText("FREE", product.rectangle.x + product.rectangle.w / 2, product.rectangle.y + product.rectangle.h + offSetPrice);
      },
      onClick: () => {
        const confirmButton = new ConfirmButton(name, 0);
        confirmButton.show((value) => {
          if (value == "CONFIRM") buy_sound.play();
        });
      },
    };
    return product;
  }

  private createButtonExit(x: number, y: number): ElementUI {
    const close_tab = new Audio(sound_close_tab);
    const button: ElementUI = {
      type: "exit",
      rectangle: { x: x + "%", y: y + "%", w: "3%", h: "3%" },
      draw: (ctx: CanvasRenderingContext2D) => {
        ctx.strokeStyle = "#8B4513";
        ctx.strokeRect(button.rectangle.x, button.rectangle.y, button.rectangle.w, button.rectangle.h);

        ctx.lineWidth = 3;

        ctx.beginPath();
        ctx.moveTo(button.rectangle.x + 5, button.rectangle.y + 5);
        ctx.lineTo(button.rectangle.x + 5 + button.rectangle.w - 10, button.rectangle.y + 5 + button.rectangle.h - 10);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(button.rectangle.x + 5, button.rectangle.y + 5 + button.rectangle.h - 10);
        ctx.lineTo(button.rectangle.x + 5 + button.rectangle.w - 10, button.rectangle.y + 5);
        ctx.stroke();
      },
      onClick: () => {
        close_tab.play();
        this.menu.close();
      },
    };
    return button;
  }

  public draw(ctx: CanvasRenderingContext2D, pos: Rectangle) {
    const backgroundColor = "#D2B48C"; // Cor de fundo castanho
    const borderColor = "#8B4513"; // Cor de contorno mais escuro

    // Desenha o corpo do balão com cor de fundo castanho
    ctx.fillStyle = backgroundColor;
    this.roundRect(ctx, pos.x, pos.y, pos.w, pos.h, this.radius);
    ctx.fill();

    // Desenha o contorno do balão com cor mais escura
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Escreve "Shop" no topo do balão
    //2ctx.fillStyle = '#000';
    ctx.font = "bold 22px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Shop", pos.x + pos.w / 2, pos.y + pos.h * 0.05);
    ctx.strokeText("Shop", pos.x + pos.w / 2, pos.y + pos.h * 0.05);

    // Adiciona sublinhado ao título
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(pos.x + pos.w / 2 - 30, pos.y + pos.h * 0.06); // Posição inicial do sublinhado
    ctx.lineTo(pos.x + pos.w / 2 + 30, pos.y + pos.h * 0.06); // Posição final do sublinhado
    ctx.stroke();
  }

  private static drawMessage(ctx: CanvasRenderingContext2D, pos: Rectangle, message: string) {
    ctx.font = "12px Arial";
    ctx.fillStyle = "black";

    const words = message.split(" ");
    const lineLength = 46; // Comprimento máximo da linha

    let line = 0;
    let currentLine = "";
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const testLine = currentLine + word + " ";

      if (testLine.length > lineLength) {
        ctx.fillText(currentLine, pos.x + 10, pos.y + 20 + line);
        currentLine = word + " ";
        line += 16; // Ajuste a altura da nova linha conforme necessário
      } else {
        currentLine = testLine;
      }
    }

    ctx.fillText(currentLine, pos.x + 10, pos.y + 20 + line);
  }

  roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
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

  get menu(): Menu {
    return this._menu;
  }
}
