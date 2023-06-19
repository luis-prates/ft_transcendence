import { Menu, type ElementUI, type Rectangle, Game, Player } from "@/game";
import { ConfirmButton } from "./ConfirmButton";
import { skin, TypeSkin, type ProductSkin } from "../ping_pong/Skin";

//Sound
import sound_close_tab from "@/assets/audio/close.mp3";
import { userStore } from "@/stores/userStore";
import { PaginationMenu } from "./PaginationMenu";

//Images
import battleImage from "@/assets/images/lobby/menu/battle.png";
import leaderBoardImage from "@/assets/images/lobby/menu/leaderboard.png";
import messageImage from "@/assets/images/lobby/menu/message.png";
import { LeaderBoard } from "./LeaderBoard";


export class YourMenu {
  private _menu = new Menu({ layer: "Global", isFocus: false });
  private background: ElementUI = this.createBackground();

  private img_battle = new Image();
  private img_leaderBoard = new Image();
  private img_message = new Image();

  private user = userStore().user;

  constructor() {
    this.menu.add(this.background);

    this.img_battle.src = battleImage;
    this.img_leaderBoard.src = leaderBoardImage;
    this.img_message.src = messageImage;

    this.menu.add(this.background, this.createButton("message", 42.5 + 0.5, 0.5, "Messages", 9));
    this.menu.add(this.background, this.createButton("battle", 42.5 + 5.5, 0.5, "Battles", 9));
    this.menu.add(this.background, this.createButton("leaderboard", 42.5 + 10.5, 0.5, "LeaderBoard", 9));


  }

  private createBackground(): ElementUI {
    const background: ElementUI = {
      type: "image",
      rectangle: { x: "42.5%", y: "0%", w: "15%", h: "8%" },
      draw: (ctx: any) => {
        /*const backgroundColor = "rgba(210, 180, 140, 0.6)"; // Cor de fundo castanho
        const borderColor = "#8B4513"; // Cor de contorno mais escuro
        const pos = background.rectangle;

        // Desenha o corpo do balão com cor de fundo castanho
        ctx.fillStyle = backgroundColor;
        this.roundRect(ctx, pos.x, pos.y, pos.w, pos.h, 10);
        ctx.fill();
    
        // Desenha o contorno do balão com cor mais escura
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 2;
        ctx.stroke();*/

        
  //Regua

 /* ctx.strokeRect( pos.x + pos.w * 0.35, pos.y + pos.h * 0.075, pos.w * 0.3, 1);

  ctx.strokeRect(pos.x, pos.y + pos.h / 2, pos.w, 1);
  ctx.strokeRect(pos.x + pos.w / 2, pos.y, 1, pos.h);
  ctx.strokeRect(pos.x + pos.w * 0.33, pos.y, 1, pos.h);
  ctx.strokeRect(pos.x + pos.w * 0.66, pos.y, 1, pos.h);*/



      },
    };
    return background;
  }

	private createButton(type: string, x: number, y: number, label: string, width: number): ElementUI {
    let img: HTMLImageElement;
    if (type == "message")
      img = this.img_message;
    else if (type == "battle")
      img = this.img_battle;
    else if (type == "leaderboard")
      img = this.img_leaderBoard;

	  const button: ElementUI = {
		type: type,
		rectangle: { x: x + "%", y: y + "%", w: "4%", h: "7%" },
		draw: (ctx: CanvasRenderingContext2D) => {
		
      ctx.fillStyle = "rgba(100, 100, 100, 0.6)";
			ctx.strokeStyle = "black";
			ctx.lineWidth = 2;

			this.roundRect(ctx, button.rectangle.x, button.rectangle.y, button.rectangle.w, button.rectangle.h, 10);

			ctx.fill();
			ctx.stroke();

			ctx.fillStyle = "black";
			ctx.font = "10px 'Press Start 2P', cursive";

			const begin = button.rectangle.x + button.rectangle.w * 0.1;
			const max_with = button.rectangle.w - (button.rectangle.w * 0.2);

			let offset = 0;
			let offsetmax = 0;
			const labelWidth = ctx.measureText(label).width;
			while (begin + offset + labelWidth < begin + max_with - offset)
			{
				offsetmax += button.rectangle.w * 0.05;
				if (begin + offsetmax + labelWidth > begin + max_with - offset)
					break ;
				offset = offsetmax;
			}

      
			if (img.complete)
        ctx.drawImage(img, 
          button.rectangle.x + button.rectangle.w * 0.25, 
          button.rectangle.y + button.rectangle.h * 0.05, 
          button.rectangle.w * 0.5, 
          button.rectangle.h * 0.65);
      

			  ctx.fillText(label, 
			  button.rectangle.x + button.rectangle.w * 0.1 + offset,
			  button.rectangle.y + button.rectangle.h * 0.9, 
			  button.rectangle.w - (button.rectangle.w * 0.2) - offset);
			},
			onClick: () => {
      if (type == "message")
      {
        //TODO
      }
      else if (type == "battle")
      {
        //Todo 
      }
      else if (type == "leaderboard")
      {
        Game.instance.addMenu(new LeaderBoard().menu);
      }
  
		},
	  };
	  return button;
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
