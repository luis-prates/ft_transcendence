import { Menu, type ElementUI, type Rectangle, Game, Player } from "@/game";
import Router from "@/router";
import socket from "@/socket/Socket";
import { CreateGame } from "./CreateGame";

//Audio
import sound_close_tab from "@/assets/audio/close.mp3";

export class MiniPerfil {
  private _menu = new Menu({ layer: "Global", isFocus: true });

  private radius: number = 10;
  private background: ElementUI = this.createBackground();
//  private onResult: (result: any) => void = () => {};
  
//  private player: Player;

  private player: Player;

  constructor(player: Player) {
    this.player = player;

    this.menu.add(this.background);
    this.menu.add(this.createButtonExit(19, 6));

    //TODO if is not himself
    //if is friend the label is "-" if is not friend "+"
	  this.menu.add(this.createButtonAddFriend("add_friend", 9.25, 7, "+"));

    this.menu.add(this.createButton("challenge", 11, 15.5, "Challenge", 9));
    this.menu.add(this.createButton("send_message", 11, 22, "Send Message", 9));
	  this.menu.add(this.createButton("mute", 11, 28.5, "Mute", 9));

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
      rectangle: { x: "1%", y: "5%", w: "20%", h: "30%" },
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
      rectangle: { x: x + "%", y: y + "%", w: width + "%", h: "4.5%" },
      draw: (ctx: CanvasRenderingContext2D) => {
         
          ctx.fillStyle = "white";
      	  ctx.strokeStyle = color;
      	  ctx.lineWidth = 2;
			
      	  this.roundRect(ctx, button.rectangle.x, button.rectangle.y, button.rectangle.w, button.rectangle.h, this.radius);
			
      	  ctx.fill();
      	  ctx.stroke();
			
      	  ctx.fillStyle = "black";
          ctx.font = "10px 'Press Start 2P', cursive";

          const labelWidth = ctx.measureText(label).width;

      	  ctx.fillText(label, 
            button.rectangle.x + button.rectangle.w / 2 - labelWidth / 2,
            button.rectangle.y + button.rectangle.h / 2 + 6,
            /*TODO fazer com que a label tenha limite, ps this.background*/);
      	},
      	onClick: () => {
          if (type == "challenge") {
            //TODO Created table and send challenge
            /*const confirmButton = new CreateGame(this.player);
            confirmButton.show((value) => {
            if (value == "CONFIRM") buy_sound.play();
              }); */
          }
          else if (type == "send_message") {
            //TODO send priv message
          }
          else if (type == "mute") {
            //TODO mute or unmute
          }
      	},
    };
    return button;
  }

  private createButtonAddFriend(type: string, x: number, y: number, label: string): ElementUI {
    const button: ElementUI = {
      type: type,
      rectangle: { x: x + "%", y: y + "%", w: "1.5%", h: "2%" },
      draw: (ctx: CanvasRenderingContext2D) => {
         
          ctx.fillStyle = "green";
      	  ctx.strokeStyle = "black";
      	  ctx.lineWidth = 2;
			
      	  this.roundRect(ctx, button.rectangle.x, button.rectangle.y, button.rectangle.w, button.rectangle.h, this.radius);
			
      	  ctx.fill();
      	  ctx.stroke();
			
      	  ctx.fillStyle = "black";
          ctx.font = "10px 'Press Start 2P', cursive";

          const labelWidth = ctx.measureText(label).width;

      	  ctx.fillText(label, button.rectangle.x + button.rectangle.w / 2 - labelWidth/2, button.rectangle.y + button.rectangle.h / 2 + 6);
      	},
      	onClick: () => {
          //TODO Request Friend
          //Or UnFriend
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

    //NickName
    ctx.fillStyle = 'black';
    ctx.font = "12px 'Press Start 2P', cursive";
	  ctx.fillText(this.player.name, pos.x + pos.w * 0.5, pos.y + pos.h * 0.20, pos.w - (pos.x + pos.w * 0.5));

    //Level
	  ctx.fillText("Level: " + 5, pos.x + pos.w * 0.5, pos.y + pos.h * 0.31, pos.w - (pos.x + pos.w * 0.5));

    //Avatar
    const pointx = pos.w * 0.01;
    const pointy = pos.h * 0.01;

    ctx.fillStyle = "white";
	ctx.strokeStyle = "black";
    ctx.strokeRect(
      pos.x + pos.w * 0.05, 
      pos.y + pos.h * 0.1,
      pos.w * 0.4,
      pos.h * 0.85,
      );

    //if (photo.complete) ctx.drawImage(photo, pos.x + pointx, pos.y + pointy, scaledWidth, scaledHeight);

  }

  private createButtonExit(x: number, y: number): ElementUI {
    const close_tab = new Audio(sound_close_tab);
    const button: ElementUI = {
      type: "exit",
      rectangle: { x: x + "%", y: y + "%", w: "1%", h: "1%" },
      draw: (ctx: CanvasRenderingContext2D) => {
        ctx.fillStyle = "red";
        ctx.strokeStyle = "black";
        ctx.fillRect(button.rectangle.x, button.rectangle.y, button.rectangle.w, button.rectangle.h);
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
