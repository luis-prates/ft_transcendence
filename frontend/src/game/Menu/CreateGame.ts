import { Menu, type ElementUI, type Rectangle, Game } from "@/game";
import Router from "@/router";
import socket from "@/socket/Socket";

//Audio
import sound_close_tab from "@/assets/audio/close.mp3";

export class CreateGame {
  private _menu = new Menu({ layer: "Global", isFocus: true });

  private radius: number = 10;
  private background: ElementUI = this.createBackground();
//  private onResult: (result: any) => void = () => {};
  
//  private player: Player;

  private objectId: string;
  private type: string = "solo"; //Solo or Multiplayer
  private score: number = 3; // 3 6 9 12
  private view: string = "public"; //public or private
  private tableColor: string = "#1e8c2f";
  //private tableSkin: string;

//  constructor(player: Player) {
  constructor(objectId: string) {
    this.objectId = objectId;

    this.menu.add(this.background);
    this.menu.add(this.createButtonExit(31, 7));
    //Type
    this.menu.add(this.createButton("type", 40 + 1 * (10 / 4), 20, "Solo", 8));
    this.menu.add(this.createButton("type", 40 + 5.25 * (10 / 4), 20, "Multiplayer", 10));
    //Score
    this.menu.add(this.createButton("score", 40 + 0.5 * (10 / 4), 30, "3", 3));
    this.menu.add(this.createButton("score", 40 + 2.75 * (10 / 4), 30, "6", 3));
    this.menu.add(this.createButton("score", 40 + 5 * (10 / 4), 30, "9", 3));
    this.menu.add(this.createButton("score", 40 + 7.25 * (10 / 4), 30, "12", 3));
    //View
    this.menu.add(this.createButton("view", 40 + 1 * (10 / 4), 40, "Public", 8));
    this.menu.add(this.createButton("view", 40 + 5.5 * (10 / 4), 40, "Private", 8));
    //Table
    this.menu.add(this.createButton("table", 40 + 3.25 * (10 / 4), 75, "Custom", 8));
  


    //Start Game
    this.menu.add(this.createButtonStartGame(32.5 + (10 / 2), 85, "Start Game"));
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

  private createButton(type: string, x: number, y: number, label: string, width: number): ElementUI {
    let color = "black";
    const button: ElementUI = {
      type: type,
      rectangle: { x: x + "%", y: y + "%", w: width + "%", h: "6%" },
      draw: (ctx: CanvasRenderingContext2D) => {
          if (button.type == "type" && this.type == label.toLowerCase())
            color = "red";
          else if (button.type == "score" && this.score.toString() == label) 
            color = "red";
          else if (button.type == "view" && this.view == label.toLowerCase()) 
            color = "red";
          else
            color = "black";
          
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
          if (button.type == "type")
            this.type = label.toLowerCase();
          else if (button.type == "score") 
            this.score = parseInt(label);
          else if (button.type == "view") 
            this.view = label.toLowerCase();
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
        console.log({objectId: this.objectId, maxScore: this.score, table: this.tableColor, tableSkin: "", bot: this.type == "solo" });
        socket.emit("new_game", { objectId: this.objectId, maxScore: this.score, table: this.tableColor, tableSkin: "", bot: this.type == "solo" });
        Router.push(
          `/game?objectId=${this.objectId}`
        );
        //this.onResult(label);
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
    ctx.fillStyle = '#ffffff';
    ctx.font = "30px 'Press Start 2P', cursive";
		ctx.textAlign = 'center';
		ctx.fillText('NEW GAME', pos.x + pos.w / 2, pos.y + pos.h * 0.075);
		ctx.strokeText('NEW GAME', pos.x + pos.w / 2, pos.y + pos.h * 0.075);

    //Type
    ctx.fillStyle = 'black';
    ctx.font = "18px 'Press Start 2P', cursive";
		ctx.fillText('Type:', pos.x + pos.w * 0.15, pos.y + pos.h * 0.20);

    //Score
		ctx.fillText('Score:', pos.x + pos.w * 0.15, pos.y + pos.h * 0.31);

    //View
		ctx.fillText('View:', pos.x + pos.w * 0.15, pos.y + pos.h * 0.42);

    //Table
		ctx.fillText('Table:', pos.x + pos.w * 0.15, pos.y + pos.h * 0.52);

    //Table
    const pointx = pos.w * 0.01;
    const pointy = pos.h * 0.01;

    ctx.fillStyle = "white";
    ctx.fillRect(
      pos.x + pos.w * 0.30, 
      pos.y + pos.h * 0.5,
      pos.w * 0.5,
      pos.h * 0.25,
      );
    ctx.fillStyle = this.tableColor;

    ctx.fillRect(
        pos.x + pos.w * 0.30 + pointx, 
        pos.y + pos.h * 0.5 + pointy,
        pos.w * 0.5 - 2 * pointx,
        pos.h * 0.25 - 2 * pointy,
    );
    ctx.fillStyle = "white";

    //if (photo.complete) ctx.drawImage(photo, pos.x + pointx, pos.y + pointy, scaledWidth, scaledHeight);

    //Vertical Line
    ctx.fillRect(
      pos.x + pos.w * 0.30 + pointx + ((pos.w * 0.5 - 2 * pointx) / 2), 
      pos.y + pos.h * 0.5,
      pointx,
      pos.h * 0.25,
    );
    //Horizontal Line
    ctx.fillRect(
      pos.x + pos.w * 0.30, 
      pos.y + pos.h * 0.5 + pointy + ((pos.h * 0.25 - 2 * pointy) / 2),
      pos.w * 0.5,
      pointy,
    );
 
  
  }

  private createButtonExit(x: number, y: number): ElementUI {
    const close_tab = new Audio(sound_close_tab);
    const button: ElementUI = {
      type: "exit",
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
        close_tab.play();
        this.menu.close();
      },
    };
    return button;
  }

  get menu(): Menu {
    return this._menu;
  }
}
