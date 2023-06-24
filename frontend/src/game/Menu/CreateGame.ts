import { Menu, type ElementUI, type Rectangle, Game } from "@/game";
import Router from "@/router";
import { socketClass } from "@/socket/Socket";

//Audio
import sound_close_tab from "@/assets/audio/close.mp3";
import { skin, TypeSkin } from "../ping_pong/Skin";
import { userStore } from "@/stores/userStore";
import { PaginationMenu } from "./PaginationMenu";
import axios from "axios";
import { env } from "../../env";
import { io, type Socket } from "socket.io-client";

export class CreateGame {
  private _menu = new Menu({ layer: "Global", isFocus: true });

  private radius: number = 10;
  private background: ElementUI = this.createBackground();
  private customMenu: ElementUI = this.createCustomMenu();

  private user = userStore().user;
  private updateTableSkin = userStore().updateTableDefault;

 public gameSocket: Socket;
 public lobbySocket: Socket = socketClass.getLobbySocket();
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
  private products = skin;
  private table_pagination: PaginationMenu;

  //  constructor(player: Player) {
  constructor(data: any) {
    this.data = data;

    this.tableColor = this.user.infoPong.skin.default.tableColor ? this.user.infoPong.skin.default.tableColor : "#1e8c2f";
    this.tableSkin = this.user.infoPong.skin.default.tableSkin ? this.user.infoPong.skin.default.tableSkin : "";
    this.skinImage = this.products.get_skin(TypeSkin.Table + "_" + this.tableSkin);

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
    

    this.table_pagination = new PaginationMenu(this.user.infoPong.skin.tables, 4, 4, this.customMenu);
    
    //Arrow Buttons
    this.menu.add(this.customMenu, this.table_pagination.createArrowButton("left", 31, 49, 2));
    this.menu.add(this.customMenu, this.table_pagination.createArrowButton("right", 67, 49, 2));

    let page = 0;
    
    this.menu.add(this.customMenu, this.createSkinButton(-1, "", 27.5 + 1 * (10 / 1.5), 46));
    this.user.infoPong.skin.tables.forEach((skin: string, index: number) => {
      if ((index == 0 ? index + 1 : index) % this.table_pagination.max_for_page == 0) page++;

      const i = index - page * this.table_pagination.max_for_page;

      const squareX = 27.5 + (i + 2 % this.table_pagination.max_for_line) * (10 / 1.5);
      const squareY = 46;

      if (this.tableSkin == skin)
        this.table_pagination.page = page;

      this.menu.add(this.customMenu, this.createSkinButton(index, skin, squareX, squareY));
    });
    //Save Default Table
    this.menu.add(this.customMenu, this.createButton("default", 59.5, 83, "Save Default Table", 10));

    this.menu.add(this.customMenu, this.createButtonExit(31, 12, "custom"));
	console.log(`userId: ${this.user.id}`);
	socketClass.setGameSocket({
		query: {
			userId: this.user.id,
		},
	})
	this.gameSocket = socketClass.getGameSocket();
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
    const close_tab = new Audio(sound_close_tab);
    let color = "black";
    const button: ElementUI = {
      type: type,
      rectangle: { x: x + "%", y: y + "%", w: width + "%", h: "6%" },
      draw: (ctx: CanvasRenderingContext2D) => {
        if (button.type == "type" && this.type == label.toLowerCase()) color = "red";
        else if (button.type == "score" && this.score.toString() == label) color = "red";
        else if (button.type == "view" && this.view == label.toLowerCase()) color = "red";
        else color = "black";

        
        if (button.type == "default")
        {
            if (this.user.infoPong.skin.default.tableColor == this.tableColor && 
              this.user.infoPong.skin.default.tableSkin == this.tableSkin)
            {
              button.enable = false;
              return ;
            }
            else if (button.enable == false) button.enable = true;
        }

        ctx.fillStyle = "white";
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;

        this.roundRect(ctx, button.rectangle.x, button.rectangle.y, button.rectangle.w, button.rectangle.h, this.radius);

        ctx.fill();
        ctx.stroke();

        this.fillTextCenter(ctx, label, button.rectangle, button.rectangle.y + button.rectangle.h * 0.65, undefined, "12px 'Press Start 2P', cursive");     

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
        else if (button.type == "default") {
          this.user.infoPong.skin.default.tableColor = this.tableColor;
          this.user.infoPong.skin.default.tableSkin = this.tableSkin;
          //DATABASE
          this.updateTableSkin(this.tableColor, this.tableSkin)
        }
        close_tab.play();
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

  private createSkinButton(index: number, skin: string, x: number, y: number): ElementUI {
    const skinImage = this.products.get_skin(TypeSkin.Table + "_" + skin);
    const button: ElementUI = {
      type: "skin",
      rectangle: { x: x + "%", y: y + "%", w: "5%", h: "10%" },
      draw: (ctx: CanvasRenderingContext2D) => {

        if (index >= 0 && !(this.table_pagination.isIndexInCurrentPage(index))) {
          if (button.enable)
            button.enable = false;
          return;
        }
        if (!button.enable)
          button.enable = true;

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

        if (index > 0 && !(this.table_pagination.isIndexInCurrentPage(index))) return;

        this.tableSkin = skin;

        this.skinImage = skinImage;
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

        ctx.fillStyle = "black"

        this.fillTextCenter(ctx, label, button.rectangle, button.rectangle.y + button.rectangle.h * 0.9, undefined, "30px 'Press Start 2P', cursive");     

      },
      onClick: async () => {
        this.menu.close();
        console.log({ objectId: this.data.objectId, maxScore: this.score, table: this.tableColor, tableSkin: this.skinImage.src, bot: this.type == "solo" });
        const gameCreate = await axios.post(
          env.BACKEND_PORT + "/game/create",
          {
            gameType: "PUBLIC",
            players: [ this.user.id ],
            gameRequest: { objectId: this.data.objectId, maxScore: this.score, table: this.tableColor, tableSkin: this.skinImage.src, bot: this.type == "solo" },
        }		//,
        //   {
        //     headers: {
        //       Authorization: `Bearer ${this.user.access_token_server}`,
        //     },
        //   }
        );
		console.log(`Axios Response: ${JSON.stringify(gameCreate.data)}`);
		console.log('Axios Post Request completed. Emitting new_game event.');
		this.data.objectId = gameCreate.data.id;
        //! this should be unnecessary now. Post request above does the same
		// this.gameSocket.emit("new_game", { objectId: this.data.objectId, maxScore: this.score, table: this.tableColor, tableSkin: this.skinImage.src, bot: this.type == "solo" });
        console.log('Emitting new_gameobject event.');
		this.lobbySocket.emit("new_gameobject", this.data);
		console.log('Emitting new_gameobject event completed.');
        Router.push(`/game?objectId=${this.data.objectId}`);
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
    ctx.fillText("NEW GAME", pos.x + pos.w * 0.3, pos.y + pos.h * 0.075, pos.w * 0.4);
    ctx.strokeText("NEW GAME", pos.x + pos.w * 0.3, pos.y + pos.h * 0.075, pos.w * 0.4);

    //Type
    ctx.fillStyle = "black";
    ctx.font = "18px 'Press Start 2P', cursive";
    ctx.fillText("Type:", pos.x + pos.w * 0.08, pos.y + pos.h * 0.215, pos.w * 0.14);

    //Score
    ctx.fillText("Score:", pos.x + pos.w * 0.05, pos.y + pos.h * 0.325, pos.w * 0.17);

    //View
    ctx.fillText("View:", pos.x + pos.w * 0.08, pos.y + pos.h * 0.435, pos.w * 0.14);

    //Table
    ctx.fillText("Table:", pos.x + pos.w * 0.05, pos.y + pos.h * 0.535, pos.w * 0.17);

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
    ctx.fillText("Custom", pos.x + pos.w * 0.35, pos.y + pos.h * 0.075, pos.w * 0.3);
    ctx.strokeText("Custom", pos.x + pos.w * 0.35, pos.y + pos.h * 0.075, pos.w * 0.3);

    //Type
    ctx.fillStyle = "black";
    ctx.font = "18px 'Press Start 2P', cursive";
    ctx.fillText("Color:", pos.x + pos.w * 0.425, pos.y + pos.h * 0.175, pos.w * 0.15);

    //Skin
    ctx.fillText("Skin:", pos.x + pos.w * 0.445, pos.y + pos.h * 0.4, pos.w * 0.14);

    //Table
    ctx.fillText("Table:", pos.x + pos.w * 0.445, pos.y + pos.h * 0.65, pos.w * 0.14);

    this.drawTable(ctx, pos.x + pos.w * 0.25, pos.y + pos.h * 0.7, pos.w * 0.5, pos.h * 0.25, pos.w * 0.01, pos.h * 0.01);
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

  get menu(): Menu {
    return this._menu;
  }
}
  //Regua
/* 
  ctx.strokeRect( pos.x + pos.w * 0.35, pos.y + pos.h * 0.075, pos.w * 0.3, 1);

  ctx.strokeRect(pos.x, pos.y + pos.h / 2, pos.w, 1);
  ctx.strokeRect(pos.x + pos.w / 2, pos.y, 1, pos.h);
  ctx.strokeRect(pos.x + pos.w * 0.33, pos.y, 1, pos.h);
  ctx.strokeRect(pos.x + pos.w * 0.66, pos.y, 1, pos.h);
*/