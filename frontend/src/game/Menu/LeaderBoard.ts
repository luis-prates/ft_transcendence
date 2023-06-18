import { Menu, type ElementUI, type Rectangle } from "@/game";

//Sound
import sound_close_tab from "@/assets/audio/close.mp3";
import { userStore } from "@/stores/userStore";

//image
import avatarDefault from "@/assets/images/pingpong/avatar_default.jpg";


export class LeaderBoard {
  private _menu = new Menu({ layer: "Global", isFocus: false });
  private radius: number = 10;
  private background: ElementUI = this.createBackground();
  
  private user = userStore().user;

  constructor() {
    this.menu.add(this.background);
    this.menu.add(this.createButtonExit(35.5, 16));

	//TODO FOREACH
	this.menu.add(this.background, this.createRanking(37.5, 16 + 1 * 6, 1, "rteles", avatarDefault));
    this.menu.add(this.background, this.createRanking(37.5, 16 + 2 * 6, 2, "onepiece", avatarDefault));
    this.menu.add(this.background, this.createRanking(37.5, 16 + 3 * 6, 3, "pacman", avatarDefault));
    this.menu.add(this.background, this.createRanking(37.5, 16 + 4 * 6, 4, "mario", avatarDefault));
    this.menu.add(this.background, this.createRanking(37.5, 16 + 5 * 6, 5, "eduxx", avatarDefault));
    this.menu.add(this.background, this.createRanking(37.5, 16 + 6 * 6, 6, "maria", avatarDefault));
    this.menu.add(this.background, this.createRanking(37.5, 16 + 7 * 6, 7, "cabrita", avatarDefault));
    this.menu.add(this.background, this.createRanking(37.5, 16 + 8 * 6, 8, "ave rara", avatarDefault));
    this.menu.add(this.background, this.createRanking(37.5, 16 + 9 * 6, 9, "luis", avatarDefault));
    this.menu.add(this.background, this.createRanking(37.5, 16 + 10 * 6, 10, "ezekiel", avatarDefault));

	//Your Position
    this.menu.add(this.background, this.createRanking(37.5, 16 + 11 * 6, 11, this.user.nickname, this.user.image));

  }

  private createBackground(): ElementUI {
    const background: ElementUI = {
      type: "image",
      rectangle: { x: "35%", y: "15%", w: "30%", h: "73%" },
      draw: (context: any) => {
        this.draw(context, background.rectangle);
      },
    };
    return background;
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
    const backgroundColor = 'rgba(192, 192, 192, 0.6)'; // Cor de fundo castanho
    const borderColor = "#8B4513"; // Cor de contorno mais escuro
	
    // Desenha o corpo do balão com cor de fundo castanho
    ctx.fillStyle = backgroundColor;
    this.roundRect(ctx, pos.x, pos.y, pos.w, pos.h, this.radius);
    ctx.fill();

    // Desenha o contorno do balão com cor mais escura
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.font = "bold 24px Arial";
    ctx.textAlign = "start";
	  ctx.fillStyle = "gold";
    ctx.fillText("Leader Board", pos.x + pos.w * 0.33, pos.y + pos.h * 0.05, pos.w * 0.33);
    ctx.strokeText("Leader Board", pos.x + pos.w * 0.33, pos.y + pos.h * 0.05, pos.w * 0.33);

    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(pos.x + pos.w / 2 - 30, pos.y + pos.h * 0.06);
    ctx.lineTo(pos.x + pos.w / 2 + 30, pos.y + pos.h * 0.06);
    ctx.stroke();
  }

  private createRanking(x: number, y: number, position: number, nickname: string, pic: string): ElementUI {
    const avatar = new Image();
	avatar.src = pic;
	const raking: ElementUI = {
      type: "ranking",
      rectangle: { x: x + "%", y: y + "%", w: "25%", h: "5%" },
      draw: (ctx: CanvasRenderingContext2D) => {
        ctx.fillStyle = position == 1 ? "gold" : (position == 2 ? "silver" : (position == 3 ? "#CD7F32" : "grey"));
        ctx.strokeStyle = nickname == this.user.nickname ? "red" : "black";
        ctx.lineWidth = 2;

        this.roundRect(ctx, raking.rectangle.x, raking.rectangle.y, raking.rectangle.w, raking.rectangle.h, this.radius);
		
        ctx.fill();
        ctx.stroke();

		    try {
		    	ctx.drawImage(avatar, raking.rectangle.x + raking.rectangle.x * 0.075, raking.rectangle.y + raking.parent?.rectangle.y * 0.035, raking.rectangle.w * 0.1, raking.rectangle.h * 0.8);
		    }
		    catch {
		    	avatar.src = avatarDefault;
		    	ctx.drawImage(avatar, raking.rectangle.x + raking.rectangle.x * 0.075, raking.rectangle.y + raking.parent?.rectangle.y * 0.035, raking.rectangle.w * 0.1, raking.rectangle.h * 0.8);
		    }

		    ctx.drawImage(avatar, raking.rectangle.x + raking.rectangle.x * 0.075, raking.rectangle.y + raking.parent?.rectangle.y * 0.035, raking.rectangle.w * 0.1, raking.rectangle.h * 0.8);
		    ctx.strokeRect(raking.rectangle.x + raking.rectangle.x * 0.075, raking.rectangle.y + raking.parent?.rectangle.y * 0.035, raking.rectangle.w * 0.1, raking.rectangle.h * 0.8);
      
		    ctx.fillStyle = "white";
        ctx.strokeStyle = nickname == this.user.nickname ? "red" : "black";

		    //Posicao
        ctx.fillText(position.toString(), raking.rectangle.x + raking.rectangle.x * 0.02, raking.rectangle.y + raking.parent?.rectangle.y * 0.225, raking.rectangle.w * 0.05);
		    ctx.strokeText(position.toString(), raking.rectangle.x + raking.rectangle.x * 0.02, raking.rectangle.y + raking.parent?.rectangle.y * 0.225, raking.rectangle.w * 0.05);
      
		    //Nickname
        ctx.fillText(nickname, raking.rectangle.x + raking.rectangle.x * 0.2, raking.rectangle.y + raking.parent?.rectangle.y * 0.225, raking.rectangle.w * 0.375);
		    ctx.strokeText(nickname, raking.rectangle.x + raking.rectangle.x * 0.2, raking.rectangle.y + raking.parent?.rectangle.y * 0.225, raking.rectangle.w * 0.375);
      },
      onClick: () => {
        //TODO DATABASE 
        //Get_User_info(user: User)
		    //TODO
		    //Go to Profile
      },
    };
    return raking;
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
