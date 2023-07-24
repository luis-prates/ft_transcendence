import { Menu, type ElementUI, type Rectangle, Game, Lobby } from "@/game";

//Sound
import sound_close_tab from "@/assets/audio/close.mp3";
import { userStore, type Friendship } from "@/stores/userStore";

//image
import { Profile } from "./Profile";
import { PaginationMenu } from "./PaginationMenu";
import type { Socket } from "socket.io-client";
import { socketClass } from "@/socket/SocketClass";


export class MessageList {
  private title: string;
  private _menu = new Menu({ layer: "Global", isFocus: false });
  private radius: number = 10;
  private background: ElementUI = this.createBackground();
  
  private pagination_list: any | PaginationMenu;
  private user = userStore().user;
  private functions = userStore();
  private usersList : any | void [] = [];
  private response: any | void [] = [];
  private onResult: (result: any) => void = () => {};
  
  constructor(tittle: string) {
    this.title = tittle;
    if (this.title == "Request")
      {
        this.usersList = this.user.friendsRequests;
        this.usersList = this.usersList.filter((request: { requestorId: number; }) => request.requestorId !== this.user.id);
      }
      else if (this.title == "Block")
      {
        this.usersList = this.user.block;
        this.usersList = this.usersList.filter((block: any) => block.blockedId !== this.user.id);
      }
      else
      { 
        this.usersList = this.user.block;
        this.usersList = this.usersList.filter((block: any) => block.blockerId !== this.user.id);
      }
      
      console.log("Message List", this.title, ":", this.usersList)

      this.pagination_list = new PaginationMenu(this.usersList, 8, 1);


      console.log("friendRequests: ", this.usersList);
      
      this.menu.add(this.background);
      this.menu.add(this.createButtonExit(38, 16));

      let page = 0;

      this.usersList.forEach((request: any, index: number) => {
        if ((index == 0 ? index + 1 : index) % this.pagination_list.max_for_page == 0) page++;
        this.response[index] = -1;
        const i = index - page * this.pagination_list.max_for_page;
        
        console.log(request)
        if (this.title == "Request")
        {
          this.menu.add(this.background, this.createInvite(index, 38.5, 16 + (i + 1) * 6, 16, request.requestorName, request.requestorId));
          this.menu.add(this.background, this.createButtonRequest(index, 55, 16 + (i + 1) * 6, "Accept", request.requestorId, request.requestorName));
          this.menu.add(this.background, this.createButtonRequest(index, 58.5, 16 + (i + 1) * 6, "Reject", request.requestorId, request.requestorName));
        }
        else if (this.title == "Block")
        {
          const id = request.blockedId;
          if (request.blocked)
          {
            const nickname = request.blocked.nickname;
            this.menu.add(this.background, this.createInvite(index, 38.5, 16 + (i + 1) * 6, 19.5, nickname, id));
            this.menu.add(this.background, this.createButtonBlock(index, 58.5, 16 + (i + 1) * 6, "Unblock", id));
          }
        }
        else if (this.title = "Blocked")
        {
          const id = request.blockerId;
          if (request.blocker)
          {
            const nickname = request.blocker.nickname;
            this.menu.add(this.background, this.createInvite(index, 38.5, 16 + (i + 1) * 6, 23, nickname, id));
          }
        }
          
      });

      //Arrow Buttons
      this.menu.add(this.pagination_list.createArrowButton("left", 46.5, 16 + 9 * 6, 2));
      this.menu.add(this.pagination_list.createArrowButton("right", 51.5, 16 + 9 * 6, 2));

  }

  private createBackground(): ElementUI {
    const background: ElementUI = {
      type: "image",
      rectangle: { x: "37.5%", y: "15%", w: "25%", h: "60%" },
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

	      ctx.fillStyle = "grey";
	      ctx.strokeStyle = "black";
        ctx.lineWidth = 3;
        this.fillTextCenter(ctx, this.title, pos.x + pos.w * 0.25, pos.y + pos.h * 0.075, pos.w * 0.5, pos.h * 0.05, undefined, "'Press Start 2P', cursive", true)
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

  private createInvite(index: number, x: number, y: number, w: number, nickname: string, id: number): ElementUI {
	const invite: ElementUI = {
      type: "ranking",
      rectangle: { x: x + "%", y: y + "%", w: w + "%", h: "5%" },
      draw: (ctx: CanvasRenderingContext2D) => {
        if (!(this.pagination_list.isIndexInCurrentPage(index))) {
          if (invite.enable)
            invite.enable = false;
          return;
        }
        if (!invite.enable)
          invite.enable = true;
        
        ctx.font = "bold 18px Arial";
        ctx.fillStyle = this.response[index] == -1 ? "gold" : (this.response[index] == 1 ? "green" : "red");
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;

        this.roundRect(ctx, invite.rectangle.x, invite.rectangle.y, invite.rectangle.w, invite.rectangle.h, this.radius);
        ctx.fill();
        ctx.stroke();

		    ctx.fillStyle = "white";
        ctx.lineWidth = 5;

		    //Nickname
        this.fillTextCenter(ctx, nickname, invite.rectangle.x, invite.rectangle.y + invite.rectangle.h * 0.75, invite.rectangle.w, invite.rectangle.h * 0.5, undefined, "'Press Start 2P', cursive", true);
      },
      onClick: () => {
        if (!(this.pagination_list.isIndexInCurrentPage(index))) return ;

        //Go to Profile
        if (id != this.user.id)
          Game.instance.addMenu(new Profile(id).menu);
      },
    };
    return invite;
  }

  private createButtonRequest(index: number, x: number, y: number, label: string, id: number, nickname: string): ElementUI {
    const close_tab = new Audio(sound_close_tab);
    const button: ElementUI = {
      type: label,
      rectangle: { x: x + "%", y: y + "%", w: "3%", h: "5%" },
      draw: (ctx: CanvasRenderingContext2D) => {
        if (!(this.pagination_list.isIndexInCurrentPage(index))) {
          if (button.enable)
            button.enable = false;
          return;
        }
        if (!button.enable)
          button.enable = true;
        if (this.response[index] > -1)
          button.visible = false;

        ctx.fillStyle = label == "Accept" ? "green" : "red";
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;

        this.roundRect(ctx, button.rectangle.x, button.rectangle.y, button.rectangle.w, button.rectangle.h, this.radius);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#000";

        this.fillTextCenter(ctx, label, button.rectangle.x, button.rectangle.y + button.rectangle.h * 0.625, button.rectangle.w, button.rectangle.h * 0.2, undefined, "'Press Start 2P', cursive", false);

      },
      onClick: () => {
        if (!(this.pagination_list.isIndexInCurrentPage(index))) return ;

        close_tab.play();
        if (button.type == "Accept")
        {
          this.functions.acceptFriendRequest(id, nickname);
          this.response[index] = 1;
        }
        else if (button.type == "Reject")
        {
          this.functions.rejectFriendRequest(id);
          this.response[index] = 0;
        }
      },
    };
    return button;
  }

  private createButtonBlock(index: number, x: number, y: number, label: string, id: number): ElementUI {
    const close_tab = new Audio(sound_close_tab);
    const button: ElementUI = {
      type: label,
      rectangle: { x: x + "%", y: y + "%", w: "3%", h: "5%" },
      draw: (ctx: CanvasRenderingContext2D) => {
        if (!(this.pagination_list.isIndexInCurrentPage(index))) {
          if (button.enable)
            button.enable = false;
          return;
        }
        if (!button.enable)
          button.enable = true;
        if (this.response[index] > -1)
          button.visible = false;

        ctx.fillStyle = "green";
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;

        this.roundRect(ctx, button.rectangle.x, button.rectangle.y, button.rectangle.w, button.rectangle.h, this.radius);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#000";

        this.fillTextCenter(ctx, label, button.rectangle.x, button.rectangle.y + button.rectangle.h * 0.625, button.rectangle.w, button.rectangle.h * 0.2, undefined, "'Press Start 2P', cursive", false);

      },
      onClick: () => {
        if (!(this.pagination_list.isIndexInCurrentPage(index))) return ;

        close_tab.play();
        if (button.type == "Unblock")
        {
          this.functions.unblockUser(id);
          this.response[index] = 1;
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

  public show(onResult: (result: any) => void) {
    this.onResult = onResult;
    Game.addMenu(this.menu);
  }
}
