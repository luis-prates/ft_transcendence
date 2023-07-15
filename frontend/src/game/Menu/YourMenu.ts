import { Menu, type ElementUI, type Rectangle, Game, Player } from "@/game";
import { LeaderBoard } from "./LeaderBoard";
import { userStore } from "@/stores/userStore";
import { Messages } from "./Messages";
import { BattleMenu } from "./BattleMenu";

//Sound
import sound_close_tab from "@/assets/audio/close.mp3";

//Images
import battleImage from "@/assets/images/lobby/menu/battle_.png";
import leaderBoardImage from "@/assets/images/lobby/menu/trofeo.png";
import messageImage from "@/assets/images/lobby/menu/message.png";

export class YourMenu {
  private _menu = new Menu({ layer: "Global", isFocus: false });
  private background: ElementUI = this.createBackground();

  private battleMenu: boolean = false;
  private leaderBoardMenu: boolean = false;
  private messagesMenu: boolean = false;

  private img_battle = new Image();
  private img_leaderBoard = new Image();
  private img_message = new Image();
  public notification: string = "";

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

    const numberOfFriendRequest = this.user.friendsRequests.filter((friendship) => friendship.requesteeId === this.user.id).length;
    this.notification = numberOfFriendRequest == 0 ? "" : (numberOfFriendRequest <= 99 ? numberOfFriendRequest.toString() : "99" );

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

			if (img.complete)
      ctx.drawImage(img, 
        button.rectangle.x + button.rectangle.w * 0.25, 
        button.rectangle.y + button.rectangle.h * 0.05, 
        button.rectangle.w * 0.5, 
        button.rectangle.h * 0.60);
        
        
        if (type == "message")
        {
          ctx.fillStyle = "red";
          this.fillTextCenter(ctx, this.notification, 
          button.rectangle.x + button.rectangle.w * 0.6, 
          button.rectangle.y + button.rectangle.h * 0.65, 
          button.rectangle.w * 0.16,
          button.rectangle.h * 0.25, undefined, "'Press Start 2P', cursive", false);
        }
          
        ctx.fillStyle = "black";
        ctx.lineWidth = 1;
        this.fillTextCenter(ctx, label, 
        button.rectangle.x, 
        button.rectangle.y + button.rectangle.h * 0.95,
        button.rectangle.w,
        button.rectangle.h * 0.25, undefined, "'Press Start 2P', cursive", false);
			},
			onClick: () => {
        if (type == "message")
        {
          if (this.messagesMenu || this.battleMenu || this.leaderBoardMenu)
            return ;
          this.notification = "";
          this.messagesMenu = true;
          const confirmButton = new Messages();
          confirmButton.show((value) => {
            if (value == "EXIT") {
              this.messagesMenu = false;
            }
          });
        }
        else if (type == "battle")
        {
          if (this.messagesMenu || this.battleMenu || this.leaderBoardMenu)
            return ;
          if (this.messagesMenu || this.battleMenu || this.leaderBoardMenu)
            return ;
          this.battleMenu = true;
          const battleBoard = new BattleMenu();
          battleBoard.show((value) => {
            if (value == "EXIT") {
              this.battleMenu = false;
            }
          });
        }
        else if (type == "leaderboard")
        {
          if (this.messagesMenu || this.battleMenu || this.leaderBoardMenu)
            return ;
          this.leaderBoardMenu = true;
          const leaderBoard = new LeaderBoard();
          leaderBoard.show((value) => {
            if (value == "EXIT") {
              this.leaderBoardMenu = false;
            }
          });
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
  }

  get menu(): Menu {
    return this._menu;
  }
}
