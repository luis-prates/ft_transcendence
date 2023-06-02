import { Menu, type ElementUI, type Rectangle, Game } from "@/game";
import Router from "@/router";
import socket from "@/socket/Socket";

//Skins
import skinGame from "@/assets/images/skin/table/skin_Game-Over.png";
import skinSwag from "@/assets/images/skin/table/skin_swag.png";
import skinOnePiece from "@/assets/images/skin/table/skin_onepiece.jpg";

//Audio
import sound_close_tab from "@/assets/audio/close.mp3";

export class CreateGame {
  private _menu = new Menu({ layer: "Global", isFocus: true });

  private radius: number = 10;
  private background: ElementUI = this.createBackground();
  private customMenu: ElementUI = this.createCustomMenu();
  //  private onResult: (result: any) => void = () => {};

  //  private player: Player;

  private data: {
    className: string;
    objectId: string;
    color: string;
    x: number;
    y: number;
  };
  private type: string = "solo"; //Solo or Multiplayer
  private score: number = 3; // 3 6 9 12
  private view: string = "public"; //public or private
  private tableColor: string = "#1e8c2f"; //
  private tableSkin: string = "";

  private skinImage = new Image();

  // private custom: boolean = false;

  //  constructor(player: Player) {
  constructor(data: any) {
    this.data = data;

    this.menu.add(this.background);

    this.menu.add(this.background, this.createButtonExit(31, 7, "newGame"));
    //Type
    this.menu.add(this.background, this.createButton("type", 40 + 1 * (10 / 4), 20, "Solo", 8));
    this.menu.add(this.background, this.createButton("type", 40 + 5.25 * (10 / 4), 20, "Multiplayer", 10));
    //Score
    this.menu.add(this.background, this.createButton("score", 40 + 0.5 * (10 / 4), 30, "3", 3));
    this.menu.add(this.background, this.createButton("score", 40 + 2.75 * (10 / 4), 30, "6", 3));
    this.menu.add(this.background, this.createButton("score", 40 + 5 * (10 / 4), 30, "9", 3));
    this.menu.add(this.background, this.createButton("score", 40 + 7.25 * (10 / 4), 30, "12", 3));
    //View
    this.menu.add(this.background, this.createButton("view", 40 + 1 * (10 / 4), 40, "Public", 8));
    this.menu.add(this.background, this.createButton("view", 40 + 5.5 * (10 / 4), 40, "Private", 8));
    //Table
    this.menu.add(this.background, this.createButton("table", 40 + 3.25 * (10 / 4), 75, "Custom", 8));

    //Start Game
    this.menu.add(this.background, this.createButtonStartGame(32.5 + 10 / 2, 85, "Start Game"));

    //Custom Menu
    this.menu.add(this.customMenu);
    this.customMenu.visible = false;

    //Colors
    this.menu.add(this.customMenu, this.createColorButton(37 + 1 * (10 / 3), 28, "red"));
    this.menu.add(this.customMenu, this.createColorButton(37 + 2 * (10 / 3), 28, "#1e8c2f"));
    this.menu.add(this.customMenu, this.createColorButton(37 + 3 * (10 / 3), 28, "#efc120"));
    this.menu.add(this.customMenu, this.createColorButton(37 + 4 * (10 / 3), 28, "#de1bda"));
    this.menu.add(this.customMenu, this.createColorButton(37 + 5 * (10 / 3), 28, "blue"));
    this.menu.add(this.customMenu, this.createColorButton(37 + 6 * (10 / 3), 28, "black"));

    //TODO FOREACH
    //Skin
    this.menu.add(this.customMenu, this.createSkinButton(24 + 1 * (10 / 1.5), 46, ""));
    this.menu.add(this.customMenu, this.createSkinButton(24 + 2 * (10 / 1.5), 46, "onepiece"));
    this.menu.add(this.customMenu, this.createSkinButton(24 + 3 * (10 / 1.5), 46, "swag"));
    this.menu.add(this.customMenu, this.createSkinButton(24 + 4 * (10 / 1.5), 46, "game"));
    this.menu.add(this.customMenu, this.createSkinButton(24 + 5 * (10 / 1.5), 46, ""));
    this.menu.add(this.customMenu, this.createSkinButton(24 + 6 * (10 / 1.5), 46, ""));

    this.menu.add(this.customMenu, this.createButtonExit(31, 12, "custom"));
  }

  private skinChoose(name: string): string {
    if (name == "onepiece") return skinOnePiece;
    else if (name == "swag") return skinSwag;
    else if (name == "game") return skinGame;
    return "";
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
      rectangle: { x: "30%", y: "5%", w: "40%", h: "90%" },
      draw: (context: any) => {
        this.drawBackground(context, background.rectangle);
      },
    };
    return background;
  }

  private createButtonExit(x: number, y: number, type: string): ElementUI {
    const close_tab = new Audio(sound_close_tab);
    const button: ElementUI = {
      type: type,
      rectangle: { x: x + "%", y: y + "%", w: "3%", h: "3%" },
      draw: (ctx: CanvasRenderingContext2D) => {
        ctx.strokeStyle = "black";
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
        console.log("close: ", button.type);
        close_tab.play();
        if (button.type == "newGame") this.menu.close();
        else if (button.type == "custom") {
          this.customMenu.visible = false;
          this.background.visible = true;
        }
      },
    };
    return button;
  }

  private createButton(type: string, x: number, y: number, label: string, width: number): ElementUI {
    let color = "black";
    const button: ElementUI = {
      type: type,
      rectangle: { x: x + "%", y: y + "%", w: width + "%", h: "6%" },
      draw: (ctx: CanvasRenderingContext2D) => {
        if (button.type == "type" && this.type == label.toLowerCase()) color = "red";
        else if (button.type == "score" && this.score.toString() == label) color = "red";
        else if (button.type == "view" && this.view == label.toLowerCase()) color = "red";
        else color = "black";

        ctx.fillStyle = "white";
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;

        this.roundRect(ctx, button.rectangle.x, button.rectangle.y, button.rectangle.w, button.rectangle.h, this.radius);

        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "black";
        ctx.font = "12px 'Press Start 2P', cursive";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(label, button.rectangle.x + button.rectangle.w / 2, button.rectangle.y + button.rectangle.h / 2);
      },
      onClick: () => {
        console.log(button.type, label);
        if (button.type == "type") this.type = label.toLowerCase();
        else if (button.type == "score") this.score = parseInt(label);
        else if (button.type == "view") this.view = label.toLowerCase();
        else if (button.type == "table") {
          this.customMenu.visible = true;
          this.background.visible = false;
        }
      },
    };
    return button;
  }

  private createCustomMenu(): ElementUI {
    const background: ElementUI = {
      type: "image",
      rectangle: { x: "30%", y: "10%", w: "40%", h: "80%" },
      draw: (context: any) => {
        this.drawCustomMenu(context, background.rectangle);
      },
    };
    return background;
  }

  private createColorButton(x: number, y: number, color: string): ElementUI {
    const button: ElementUI = {
      type: "color",
      rectangle: { x: x + "%", y: y + "%", w: "2.5%", h: "6%" },
      draw: (ctx: CanvasRenderingContext2D) => {
        ctx.fillStyle = color;
        ctx.strokeStyle = color == this.tableColor ? "red" : "black";
        ctx.lineWidth = 2;

        this.roundRect(ctx, button.rectangle.x, button.rectangle.y, button.rectangle.w, button.rectangle.h, this.radius);

        ctx.fill();
        ctx.stroke();
      },
      onClick: () => {
        this.tableColor = color;
      },
    };
    return button;
  }

  private createSkinButton(x: number, y: number, skin: string): ElementUI {
    const skinImage = new Image();
    const button: ElementUI = {
      type: "skin",
      rectangle: { x: x + "%", y: y + "%", w: "5%", h: "10%" },
      draw: (ctx: CanvasRenderingContext2D) => {
        skinImage.src = this.skinChoose(skin);

        ctx.strokeStyle = skin == this.tableSkin ? "red" : "black";
        ctx.lineWidth = 2;

        ctx.lineWidth = 3;

        if (skin == "") {
          ctx.beginPath();
          ctx.moveTo(button.rectangle.x + 5, button.rectangle.y + 5);
          ctx.lineTo(button.rectangle.x + 5 + button.rectangle.w - 10, button.rectangle.y + 5 + button.rectangle.h - 10);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(button.rectangle.x + 5, button.rectangle.y + 5 + button.rectangle.h - 10);
          ctx.lineTo(button.rectangle.x + 5 + button.rectangle.w - 10, button.rectangle.y + 5);
          ctx.stroke();
        } else if (skinImage.complete) {
          ctx.save();

          ctx.beginPath();
          ctx.moveTo(button.rectangle.x + this.radius, button.rectangle.y);
          ctx.arcTo(button.rectangle.x + button.rectangle.w, button.rectangle.y, button.rectangle.x + button.rectangle.w, button.rectangle.y + button.rectangle.h, this.radius);
          ctx.arcTo(button.rectangle.x + button.rectangle.w, button.rectangle.y + button.rectangle.h, button.rectangle.x, button.rectangle.y + button.rectangle.h, this.radius);
          ctx.arcTo(button.rectangle.x, button.rectangle.y + button.rectangle.h, button.rectangle.x, button.rectangle.y, this.radius);
          ctx.arcTo(button.rectangle.x, button.rectangle.y, button.rectangle.x + button.rectangle.w, button.rectangle.y, this.radius);
          ctx.closePath();
          ctx.clip();
          ctx.drawImage(skinImage, button.rectangle.x, button.rectangle.y, button.rectangle.w, button.rectangle.h);

          ctx.restore();
        }

        this.roundRect(ctx, button.rectangle.x, button.rectangle.y, button.rectangle.w, button.rectangle.h, this.radius);

        ctx.stroke();
      },
      onClick: () => {
        this.tableSkin = skin;
        this.skinImage.src = this.skinChoose(skin);
      },
    };
    return button;
  }

  private createButtonStartGame(x: number, y: number, label: string): ElementUI {
    const button: ElementUI = {
      type: "button",
      rectangle: { x: x + "%", y: y + "%", w: "25%", h: "6%" },
      draw: (ctx: CanvasRenderingContext2D) => {
        ctx.fillStyle = "white";
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;

        this.roundRect(ctx, button.rectangle.x, button.rectangle.y, button.rectangle.w, button.rectangle.h, this.radius);

        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "black";
        ctx.font = "30px 'Press Start 2P', cursive";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("Start Game", button.rectangle.x + button.rectangle.w / 2, button.rectangle.y + button.rectangle.h / 2);
      },
      onClick: () => {
        this.menu.close();
        console.log({ objectId: this.data.objectId, maxScore: this.score, table: this.tableColor, tableSkin: this.skinImage.src, bot: this.type == "solo" });
        socket.emit("new_game", { objectId: this.data.objectId, maxScore: this.score, table: this.tableColor, tableSkin: this.skinImage.src, bot: this.type == "solo" });
        socket.emit("new_gameobject", this.data);
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

    //Tittle
    ctx.fillStyle = "#ffffff";
    ctx.font = "30px 'Press Start 2P', cursive";
    ctx.textAlign = "center";
    ctx.fillText("NEW GAME", pos.x + pos.w / 2, pos.y + pos.h * 0.075);
    ctx.strokeText("NEW GAME", pos.x + pos.w / 2, pos.y + pos.h * 0.075);

    //Type
    ctx.fillStyle = "black";
    ctx.font = "18px 'Press Start 2P', cursive";
    ctx.fillText("Type:", pos.x + pos.w * 0.15, pos.y + pos.h * 0.2);

    //Score
    ctx.fillText("Score:", pos.x + pos.w * 0.15, pos.y + pos.h * 0.31);

    //View
    ctx.fillText("View:", pos.x + pos.w * 0.15, pos.y + pos.h * 0.42);

    //Table
    ctx.fillText("Table:", pos.x + pos.w * 0.15, pos.y + pos.h * 0.52);

    //Draw Table
    this.drawTable(ctx, pos.x + pos.w * 0.3, pos.y + pos.h * 0.5, pos.w * 0.5, pos.h * 0.25, pos.w * 0.01, pos.h * 0.01);
  }

  private drawTable(ctx: CanvasRenderingContext2D, start_pos_x: number, start_pos_y: number, start_pos_w: number, start_pos_h: number, pointx: number, pointy: number) {
    ctx.fillStyle = "white";
    ctx.fillRect(start_pos_x, start_pos_y, start_pos_w, start_pos_h);
    ctx.fillStyle = this.tableColor;

    ctx.fillRect(start_pos_x + pointx, start_pos_y + pointy, start_pos_w - 2 * pointx, start_pos_h - 2 * pointy);
    ctx.fillStyle = "white";

    if (this.skinImage.complete) {
      ctx.drawImage(this.skinImage, start_pos_x + pointx, start_pos_y + pointy, start_pos_w - 2 * pointx, start_pos_h - 2 * pointy);
    }

    //Vertical Line
    ctx.fillRect(start_pos_x + pointx + (start_pos_w - 2 * pointx) / 2, start_pos_y, pointx, start_pos_h);
    //Horizontal Line
    ctx.fillRect(start_pos_x, start_pos_y + pointy + (start_pos_h - 2 * pointy) / 2, start_pos_w, pointy);
  }

  private drawCustomMenu(ctx: CanvasRenderingContext2D, pos: Rectangle) {
    const backgroundColor = "#FFC857";
    const borderColor = "black";

    ctx.fillStyle = backgroundColor;
    this.roundRect(ctx, pos.x, pos.y, pos.w, pos.h, this.radius);
    ctx.fill();

    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    //Tittle
    ctx.fillStyle = "#ffffff";
    ctx.font = "30px 'Press Start 2P', cursive";
    ctx.textAlign = "center";
    ctx.fillText("Custom", pos.x + pos.w / 2, pos.y + pos.h * 0.075);
    ctx.strokeText("Custom", pos.x + pos.w / 2, pos.y + pos.h * 0.075);

    //Type
    ctx.fillStyle = "black";
    ctx.font = "18px 'Press Start 2P', cursive";
    ctx.fillText("Color:", pos.x + pos.w * 0.5, pos.y + pos.h * 0.175);

    //Skin
    ctx.fillText("Skin:", pos.x + pos.w * 0.5, pos.y + pos.h * 0.4);

    //Table
    ctx.fillText("Table:", pos.x + pos.w * 0.5, pos.y + pos.h * 0.65, pos.w * 0.17);

    this.drawTable(ctx, pos.x + pos.w * 0.25, pos.y + pos.h * 0.7, pos.w * 0.5, pos.h * 0.25, pos.w * 0.01, pos.h * 0.01);
  }

  get menu(): Menu {
    return this._menu;
  }
}
