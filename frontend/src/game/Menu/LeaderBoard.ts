import { Menu, type ElementUI, type Rectangle, Game, Lobby } from "@/game";

//Sound
import sound_close_tab from "@/assets/audio/close.mp3";
import { userStore } from "@/stores/userStore";

//image
import avatarDefault from "@/assets/images/pingpong/avatar_default.jpg";
import { Profile } from "./Profile";
import { YourProfile } from "./YourProfile";
import { PaginationMenu } from "./PaginationMenu";
import { ConfirmButton, STATUS_CONFIRM } from "./ConfirmButton";


export class LeaderBoard {
  private _menu = new Menu({ layer: "Global", isFocus: false });
  private radius: number = 10;
  private background: ElementUI = this.createBackground();
  private pagination_leaderBoard: any | PaginationMenu;
  
  private user = userStore().user;
 // private getUsers = userStore().getUsers;
  private users : any | void [] = [];
  private onResult: (result: any) => void = () => {};
  
  constructor() {
    this.fetchUsers();
  }

  async fetchUsers() {
    try {
      this.users = await userStore().getUsers();
      
      console.log("users: ", this.users); // Faça o que desejar com o array de usuários

      this.pagination_leaderBoard = new PaginationMenu(this.users, 10, 1);
      
      this.menu.add(this.background);
      this.menu.add(this.createButtonExit(35.5, 11));

      let your_position = 0;
      let page = 0;

      this.users.forEach((user: any, index: number) => {
        if ((index == 0 ? index + 1 : index) % this.pagination_leaderBoard.max_for_page == 0) page++;
        const i = index - page * this.pagination_leaderBoard.max_for_page;

        this.menu.add(this.background, this.createRanking(index, 37.5, 11 + (i + 1) * 6, (index + 1), user.nickname, user.image ? user.image : avatarDefault, user.id, false));
        if (user.nickname == this.user.nickname)
          your_position = index + 1;
      });
      //Your Position
      this.menu.add(this.background, this.createRanking(your_position - 1, 37.5, 11 + 11 * 6, your_position, this.user.nickname, this.user.image, this.user.id, true));
  
      //Arrow Buttons
      this.menu.add(this.pagination_leaderBoard.createArrowButton("left", 46.5, 11 + 12 * 6, 2));
      this.menu.add(this.pagination_leaderBoard.createArrowButton("right", 51.5, 11 + 12 * 6, 2));

    } catch (error) {
      const confirmButton = new ConfirmButton(error, STATUS_CONFIRM.ERROR);
			confirmButton.show((value) => {
				if (value == "OK") {
					this.menu.close();
					this.onResult("EXIT");
				}
			});
    }
  }

  private createBackground(): ElementUI {
    const background: ElementUI = {
      type: "image",
      rectangle: { x: "35%", y: "10%", w: "30%", h: "78%" },
      draw: (ctx: any) => {
        const pos = background.rectangle;
        const backgroundColor = 'rgba(192, 192, 192, 0.6)';
        const borderColor = "#8B4513";
      
        ctx.fillStyle = backgroundColor;
        this.roundRect(ctx, pos.x, pos.y, pos.w, pos.h, this.radius);
        ctx.fill();
    
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 1;
        ctx.stroke();
    
        this.ReguaTeste(ctx, pos.x + pos.w * 0.33, pos.y + pos.h * 0.065, pos.w * 0.33, pos.h * 0.045, 4);
        
        ctx.font = pos.h * 0.045 + "px 'Press Start 2P', cursive";
        ctx.textAlign = "start";
        ctx.fillStyle = "gold";
        ctx.lineWidth = 4;
        ctx.strokeText("Leader Board", pos.x + pos.w * 0.33, pos.y + pos.h * 0.065, pos.w * 0.33);
        ctx.fillText("Leader Board", pos.x + pos.w * 0.33, pos.y + pos.h * 0.065, pos.w * 0.33);

        //Letter for Player
        ctx.font = pos.h * 0.03 + "px 'Press Start 2P', cursive";
      },
    };
    return background;
  }

  private createButtonExit(x: number, y: number): ElementUI {
    const close_tab = new Audio(sound_close_tab);
    const button: ElementUI = {
      type: "exit",
      rectangle: { x: x + "%", y: y + "%", w: "2.5%", h: "3%" },
      draw: (ctx: CanvasRenderingContext2D) => {
        ctx.strokeStyle = "#8B4513";
        ctx.lineWidth = 3;
        ctx.strokeRect(button.rectangle.x, button.rectangle.y, button.rectangle.w, button.rectangle.h);

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
        this.onResult("EXIT");
      },
    };
    return button;
  }

  private createRanking(index: number, x: number, y: number, position: number, nickname: string, pic: string, id: number, all_visible: boolean): ElementUI {
    const avatar = new Image();
	avatar.src = pic;
	const raking: ElementUI = {
      type: "ranking",
      rectangle: { x: x + "%", y: y + "%", w: "25%", h: "5%" },
      draw: (ctx: CanvasRenderingContext2D) => {
        if (!(this.pagination_leaderBoard.isIndexInCurrentPage(index)) && !all_visible) {
          raking.enable = false;
        return;
      }
      if (!raking.enable)
        raking.enable = true;



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

		    ctx.strokeRect(raking.rectangle.x + raking.rectangle.x * 0.075, raking.rectangle.y + raking.parent?.rectangle.y * 0.035, raking.rectangle.w * 0.1, raking.rectangle.h * 0.8);
		    ctx.drawImage(avatar, raking.rectangle.x + raking.rectangle.x * 0.075, raking.rectangle.y + raking.parent?.rectangle.y * 0.035, raking.rectangle.w * 0.1, raking.rectangle.h * 0.8);
      
		    ctx.fillStyle = "white";
        ctx.strokeStyle = nickname == this.user.nickname ? "red" : "black";        
        
        ctx.lineWidth = 5;
		    //Posicao
        let x = raking.rectangle.x + raking.rectangle.w * 0.035;
        let y = raking.rectangle.y + raking.rectangle.h * 0.725;
        let w = raking.rectangle.w * 0.05;
        let h = raking.rectangle.h * 0.5;

		    ctx.strokeText(position.toString(), x, y, w);
        ctx.fillText(position.toString(), x, y, w);

        //Test
        this.ReguaTeste(ctx, x, y, w, h, 5);
        
		    //Nickname
        x = raking.rectangle.x + raking.rectangle.w * 0.25;
        w = raking.rectangle.w * 0.525;
		    
        ctx.strokeText(nickname,  x, y, w);
		    ctx.fillText(nickname, x, y, w);

        //Test
        this.ReguaTeste(ctx, x, y, w, h, 5);
        
		    //Points //TODO
        x = raking.rectangle.x + raking.rectangle.w * 0.825;
        w = raking.rectangle.w * 0.125;
      
		    ctx.strokeText("1235",  x, y, w);
		    ctx.fillText("1235", x, y, w);

        //Test
        this.ReguaTeste(ctx, x, y, w, h, 5);
      },
      onClick: () => {
        let confirmButton;
        if (id != this.user.id)
          confirmButton = new Profile(id);
        else
          confirmButton = new YourProfile(Lobby.getPlayer());
        this._menu.visible = false;
        this._menu.enable = false;
        confirmButton.show((value) => {
          if (value == "EXIT") {
            this._menu.visible = true;
            this._menu.enable = true;
          }
        });
      },
    };
    return raking;
  }

  //Test
  ReguaTeste(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, lineWidth: number)
  {
    return ;
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

  public show(onResult: (result: any) => void) {
    this.onResult = onResult;
    Game.addMenu(this.menu);
  }
}
