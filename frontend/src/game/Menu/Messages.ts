import { Menu, type ElementUI, type Rectangle, Game, Lobby } from "@/game";

//Sound
import sound_close_tab from "@/assets/audio/close.mp3";
import { userStore, type Friendship } from "@/stores/userStore";

//image
import avatarDefault from "@/assets/images/pingpong/avatar_default.jpg";
import { Profile } from "./Profile";
import { PaginationMenu } from "./PaginationMenu";


export class Messages {
  private _menu = new Menu({ layer: "Global", isFocus: false });
  private radius: number = 10;
  private background: ElementUI = this.createBackground();
  
  private pagination_request: PaginationMenu;
  
  private user = userStore().user;
  private functions = userStore();
 // private getUsers = userStore().getUsers;
  private friendRequests : any | void [] = [];
  private onResult: (result: any) => void = () => {};
  
  constructor() {
    this.pagination_request = new PaginationMenu([], 8, 1);
    this.fetchUsers();
  }

  async fetchUsers() {
    try {
      // Obtenha os usuários da base de dados
      this.friendRequests = await userStore().getFriendRequests();

      this.friendRequests = this.friendRequests.filter((request: { requestorId: number; }) => request.requestorId !== this.user.id);
      
      this.pagination_request = new PaginationMenu(this.friendRequests, 8, 1);


      console.log("friendRequests: ", this.friendRequests);
      
      this.menu.add(this.background);
      this.menu.add(this.createButtonExit(38, 16));

      let page = 0;

      this.friendRequests.forEach((request: Friendship, index: number) => {
        if ((index == 0 ? index + 1 : index) % 8 == 0) page++;
  
        const i = index - page * this.pagination_request.max_for_page;
          
        this.menu.add(this.background, this.createInvite(index, 38.5, 16 + (i + 1) * 6, request.requestorName, request.requestorId));
        this.menu.add(this.background, this.createButton(index, 55, 16 + (i + 1) * 6, "Accept", request.requestorId));
        this.menu.add(this.background, this.createButton(index, 58.5, 16 + (i + 1) * 6, "Reject", request.requestorId));
          
      });

      //Arrow Buttons
      this.menu.add(this.pagination_request.createArrowButton("left", 46.5, 16 + 9 * 6, 2));
      this.menu.add(this.pagination_request.createArrowButton("right", 51.5, 16 + 9 * 6, 2));

    } catch (error) {
      console.error('Erro ao buscar os usuários:', error);
      this.menu.close();
    }
  }

  private createBackground(): ElementUI {
    const background: ElementUI = {
      type: "image",
      rectangle: { x: "37.5%", y: "15%", w: "25%", h: "60%" },
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
        this.onResult("EXIT");
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
	  ctx.fillStyle = "grey";
	  ctx.strokeStyle = "black";
    ctx.fillText("Friends Requests", pos.x + pos.w * 0.30, pos.y + pos.h * 0.05, pos.w * 0.40);
    ctx.strokeText("Friends Requests", pos.x + pos.w * 0.30, pos.y + pos.h * 0.05, pos.w * 0.40);
  }

  private createInvite(index: number, x: number, y: number, nickname: string, id: number): ElementUI {
	const invite: ElementUI = {
      type: "ranking",
      rectangle: { x: x + "%", y: y + "%", w: "16%", h: "5%" },
      draw: (ctx: CanvasRenderingContext2D) => {
        if (!(this.pagination_request.isIndexInCurrentPage(index))) {
          if (invite.enable)
            invite.enable = false;
          return;
        }
        if (!invite.enable)
          invite.enable = true;
        
        ctx.font = "bold 18px Arial";
        ctx.fillStyle = "gold";
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;

        this.roundRect(ctx, invite.rectangle.x, invite.rectangle.y, invite.rectangle.w, invite.rectangle.h, this.radius);
        ctx.fill();
        ctx.stroke();

		    ctx.fillStyle = "white";
        
        ctx.lineWidth = 5;
		    //Nickname
		    ctx.strokeText(nickname, invite.rectangle.x + invite.rectangle.x * 0.025, invite.rectangle.y + invite.parent?.rectangle.y * 0.225, invite.rectangle.w * 0.375);
        ctx.fillText(nickname, invite.rectangle.x + invite.rectangle.x * 0.025, invite.rectangle.y + invite.parent?.rectangle.y * 0.225, invite.rectangle.w * 0.375);
      },
      onClick: () => {
        if (!(this.pagination_request.isIndexInCurrentPage(index))) return ;

        //Go to Profile
        if (id != this.user.id)
          Game.instance.addMenu(new Profile(id).menu);
      },
    };
    return invite;
  }

  private createButton(index: number, x: number, y: number, label: string, id: number): ElementUI {
    const close_tab = new Audio(sound_close_tab);
    const button: ElementUI = {
      type: label,
      rectangle: { x: x + "%", y: y + "%", w: "3%", h: "5%" },
      draw: (ctx: CanvasRenderingContext2D) => {
        if (!(this.pagination_request.isIndexInCurrentPage(index))) {
          if (button.enable)
            button.enable = false;
          return;
        }
        if (!button.enable)
          button.enable = true;

        ctx.fillStyle = label == "Accept" ? "green" : "red";
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;

        this.roundRect(ctx, button.rectangle.x, button.rectangle.y, button.rectangle.w, button.rectangle.h, this.radius);
        ctx.fill();
        ctx.stroke();

        this.fillTextCenter(ctx, label, button.rectangle, button.rectangle.y + button.rectangle.h * 0.625);

      },
      onClick: () => {
        if (!(this.pagination_request.isIndexInCurrentPage(index))) return ;

        close_tab.play();
        if (button.type == "Accept")
          this.functions.acceptFriendRequest(id);
        else if (button.type == "Reject")
          this.functions.rejectFriendRequest(id);
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

  public show(onResult: (result: any) => void) {
    this.onResult = onResult;
    Game.addMenu(this.menu);
  }
}
  //Regua
  /*
  context.strokeRect( pos.x + pos.w * 0.35, pos.y + pos.h * 0.075, pos.w * 0.3, 1);

  context.strokeRect(pos.x, pos.y + pos.h / 2, pos.w, 1);
  context.strokeRect(pos.x + pos.w / 2, pos.y, 1, pos.h);
  context.strokeRect(pos.x + pos.w * 0.33, pos.y, 1, pos.h);
  context.strokeRect(pos.x + pos.w * 0.66, pos.y, 1, pos.h);*/