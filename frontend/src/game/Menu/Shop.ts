import { Menu, type ElementUI, type Rectangle, Game, Player } from "@/game";
import { ConfirmButton } from "./ConfirmButton";
import { Skin, TypeSkin, type ProductSkin } from "../ping_pong/Skin";

//Sound
import sound_caching from "@/assets/audio/caching.mp3";
import sound_close_tab from "@/assets/audio/close.mp3";
import { userStore } from "@/stores/userStore";
import { PaginationMenu } from "./PaginationMenu";

export class Shop {
  private _menu = new Menu({ layer: "Global", isFocus: true });
  private radius: number = 10;
  private background: ElementUI = this.createBackground();
  private products = new Skin();
  private user = userStore().user;
  private yourMoney: number = 0;
  private pagination_shop: PaginationMenu;

  constructor() {
    this.pagination_shop = new PaginationMenu(this.products.skins, 15, 5);
    this.menu.add(this.background);
    this.menu.add(this.createButtonExit(10.5, 11));
    this.createAll();
    this.yourMoney = this.user.wallet;
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

    let page = 0;

    this.products.skins.forEach((skin, index) => {
      if ((index == 0 ? index + 1 : index) % 15 == 0) page++;

      const i = index - page * this.pagination_shop.max_for_page;

      // Loop para desenhar os quadrados de produtos
      const squareX = 10 + 3 + (i % this.pagination_shop.max_for_line) * (squareW + paddingX);
      const squareY = 10 + paddingY + Math.floor(i / this.pagination_shop.max_for_line) * (squareH + paddingY);

      this.menu.add(this.createProduct(index, skin, squareX, squareY));
    });

    //Arrow Buttons
    this.menu.add(this.pagination_shop.createArrowButton("left", 11, 85, 2));
    this.menu.add(this.pagination_shop.createArrowButton("right", 87, 85, 2));
  }

  private fillTextCenter(ctx: CanvasRenderingContext2D, label: string, rectangle: Rectangle, y: number, max_with?: number, font?: string) {
    ctx.fillStyle = "#000";
    ctx.font = font ? font : "12px Arial";
    ctx.textAlign = "start";

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

    ctx.fillText(label, rectangle.x + rectangle.w * 0.1 + offset, y, rectangle.w - rectangle.w * 0.2 - offset);
  }

  private createProduct(index: number, skin: ProductSkin, x: number, y: number): ElementUI {
    const buy_sound = new Audio(sound_caching);

    const product: ElementUI = {
      type: "image",
      rectangle: { x: x + "%", y: y + "%", w: "10%", h: "15%" },
      draw: (ctx: CanvasRenderingContext2D) => {
        
        if (!(this.pagination_shop.isIndexInCurrentPage(index))) {
          if (product.enable)
            product.enable = false;
          return;
        }
        if (!product.enable)
          product.enable = true;

        const offSetTittle = this.background.rectangle.y * 0.05;
        const offSetPrice = this.background.rectangle.y * 0.2;

        ctx.fillStyle = "DarkSlateBlue";
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 2;

        this.roundRect(ctx, product.rectangle.x, product.rectangle.y, product.rectangle.w, product.rectangle.h, this.radius);

        ctx.fill();
        ctx.stroke();

        if (skin.type == TypeSkin.Tabble && skin.image.complete) {
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

          ctx.fillStyle = "#1e8c2f";
          ctx.fillRect(product.rectangle.x + pointx, product.rectangle.y + pointy, scaledWidth, scaledHeight);

          if (skin.image.complete) ctx.drawImage(skin.image, product.rectangle.x + pointx, product.rectangle.y + pointy, scaledWidth, scaledHeight);

          ctx.fillStyle = "white";
          //Midle Line
          ctx.fillRect(product.rectangle.x + pointx, product.rectangle.y + pointy + (scaledHeight / 2 - this.background.rectangle.y * 0.78 * 0.01), scaledWidth, this.background.rectangle.y * 0.78 * 0.02);
          //Vertical
          ctx.fillRect(product.rectangle.x + (product.rectangle.w / 2 - this.background.rectangle.y * 0.78 * 0.01), product.rectangle.y + pointy, this.background.rectangle.y * 0.78 * 0.02, scaledHeight);
        } else if (skin.type == TypeSkin.Paddle && skin.image.complete) {
          const scale = 100 / 30;
          const scaledWidth = product.rectangle.w * 0.15 * scale;
          const scaledHeight = product.rectangle.h * 0.3 * scale;
          const pointx = (product.rectangle.w - scaledWidth * 0.5) / 2;
          const pointy = (product.rectangle.h - scaledHeight * 0.9) / 2;

          if (skin.image.complete) {
            ctx.drawImage(skin.image, product.rectangle.x + pointx, product.rectangle.y + pointy, scaledWidth * 0.5, scaledHeight * 0.9);
          }

          ctx.strokeStyle = "black";
          ctx.lineWidth = 3;
          ctx.strokeRect(product.rectangle.x + pointx, product.rectangle.y + pointy, scaledWidth * 0.5, scaledHeight * 0.9);
        }

        this.fillTextCenter(ctx, (skin.type == TypeSkin.Paddle ? "Paddle " : "Table ") + skin.tittle, product.rectangle, product.rectangle.y - offSetTittle);

        this.fillTextCenter(ctx, skin.price == 0 ? "FREE" : skin.price.toString() + "₳", product.rectangle, product.rectangle.y + product.rectangle.h + offSetPrice);
      },
      onClick: () => {

        if (!(this.pagination_shop.isIndexInCurrentPage(index))) return ;

        let canBuy: boolean = false;
        if (skin.type == TypeSkin.Paddle && !this.user.infoPong.skin.paddles.includes(skin.name as never)) canBuy = true;
        else if (skin.type == TypeSkin.Tabble && !this.user.infoPong.skin.tables.includes(skin.name as never)) canBuy = true;

        if (this.yourMoney >= skin.price && canBuy) {
          const confirmButton = new ConfirmButton(skin.tittle, skin.price);
          confirmButton.show((value) => {
            if (value == "CONFIRM") {
              if (skin.type == TypeSkin.Paddle) this.user.infoPong.skin.paddles.push(skin.name as never);
              else if (skin.type == TypeSkin.Tabble) this.user.infoPong.skin.tables.push(skin.name as never);
              this.yourMoney -= skin.price;
              buy_sound.play();
            }
          });
        }
      },
    };
    return product;
  }

  private createButtonExit(x: number, y: number): ElementUI {
    const close_tab = new Audio(sound_close_tab);
    const button: ElementUI = {
      type: "exit",
      rectangle: { x: x + "%", y: y + "%", w: "1.5%", h: "3%" },
      draw: (ctx: CanvasRenderingContext2D) => {
        ctx.strokeStyle = "black";
        ctx.fillStyle = "red";
        ctx.lineWidth = 3;
        ctx.strokeRect(button.rectangle.x, button.rectangle.y, button.rectangle.w, button.rectangle.h);
        ctx.fillRect(button.rectangle.x, button.rectangle.y, button.rectangle.w, button.rectangle.h);

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
    const backgroundColor = "rgba(210, 180, 140, 0.6)"; // Cor de fundo castanho
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
    ctx.font = "bold 22px Arial";
    ctx.fillStyle = "gold";
    ctx.fillText("Shop", pos.x + pos.w * 0.475, pos.y + pos.h * 0.05, pos.w * 0.05);
    ctx.strokeText("Shop", pos.x + pos.w * 0.475, pos.y + pos.h * 0.05, pos.w * 0.05);

    // Adiciona sublinhado ao título
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(pos.x + pos.w / 2 - 30, pos.y + pos.h * 0.06);
    ctx.lineTo(pos.x + pos.w / 2 + 30, pos.y + pos.h * 0.06);
    ctx.stroke();

    ctx.font = "bold 18px Arial";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 3;
    ctx.strokeText("Your Money: " + this.yourMoney + "₳", pos.x + pos.w * 0.055, pos.y + pos.h * 0.05, pos.w * 0.15);
    ctx.fillText("Your Money: " + this.yourMoney + "₳", pos.x + pos.w * 0.055, pos.y + pos.h * 0.05, pos.w * 0.15);
    ctx.lineWidth = 2;
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
