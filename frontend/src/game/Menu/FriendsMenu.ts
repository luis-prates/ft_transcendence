import { Menu, type ElementUI, type Rectangle, Game, Lobby } from "@/game";

//Sound
import sound_close_tab from "@/assets/audio/close.mp3";
import { userStore, type GAME, GameStatus } from "@/stores/userStore";
import { PaginationMenu } from "./PaginationMenu";
import { Profile } from "./Profile";

//image
import friendImage from "@/assets/images/lobby/menu/your_friend.png";
import messageImage from "@/assets/chat/dm_messages.png";
import avatarDefault from "@/assets/chat/avatar.png";



export class FriendsMenu {
  private _menu = new Menu({ layer: "Global", isFocus: false });
  private radius: number = 10;
  private background: ElementUI = this.createBackground();
  private user = userStore().user;
  private friends = userStore().user.friends;
  
  private pagination_friends: any | PaginationMenu;
  
  private onResult: (result: any) => void = () => {};
  
  constructor() {
    this.pagination_friends = new PaginationMenu(this.friends, 10, 1);

    //console.log("friends: ", this.friends); // Faça o que desejar com o array de usuários

    this.menu.add(this.background);
    this.menu.add(this.createButtonExit(30.5, 11));

    let page = 0;

    this.friends.forEach((friend: any, index: number) => {
      if ((index == 0 ? index + 1 : index) % this.pagination_friends.max_for_page == 0) page++;
      const i = index - page * this.pagination_friends.max_for_page;

      this.menu.add(this.background, this.createFriend(index, 32.5, 12 + (i + 1) * 6.25, friend));
      this.menu.add(this.background, this.createMessage(index, 62.25, 12.5 + (i + 1) * 6.25, friend));
    });

     //Arrow Buttons
    this.menu.add(this.pagination_friends.createArrowButton("left", 46.5, 30 + 9 * 6, 2));
    this.menu.add(this.pagination_friends.createArrowButton("right", 51.5, 30 + 9 * 6, 2));
  }

  private createBackground(): ElementUI {
    const friends_image = new Image();
    friends_image.src = friendImage;

    const background: ElementUI = {
      type: "image",
      rectangle: { x: "30%", y: "10%", w: "40%", h: "80%" },
      draw: (ctx: any) => {
        const pos = background.rectangle
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
    
        if (friends_image.complete)
          ctx.drawImage(friends_image, pos.x + pos.w * 0.01, pos.y + pos.h * 0.01, pos.w * 0.98, pos.h * 0.98);
        
        ctx.lineWidth = 5;
        ctx.textAlign = "start";
        ctx.fillStyle = "gold";
        this.fillTextCenter(ctx, "Friends", pos.x + pos.w * 0.3, pos.y + pos.h * 0.095, pos.w * 0.39, pos.h * 0.07, undefined, "'Press Start 2P', cursive", true);
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
        ctx.lineWidth = 3;
        ctx.strokeStyle = "red";
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

  private createFriend(index: number, x: number, y: number, friend: any): ElementUI {
    const image_friend = new Image();
    image_friend.src = friend.image ? friend.image : avatarDefault;

	  const battle: ElementUI = {
      type: "battle",
      rectangle: { x: x + "%", y: y + "%", w: "35%", h: "5%" },
      draw: (ctx: CanvasRenderingContext2D) => {

        if (!(this.pagination_friends.isIndexInCurrentPage(index))) {
            battle.enable = false;
          return;
        }
        if (!battle.enable)
          battle.enable = true;

        ctx.fillStyle = "rgba(205, 127, 50, 0.8)";
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;

        this.roundRect(ctx, battle.rectangle.x, battle.rectangle.y, battle.rectangle.w, battle.rectangle.h, this.radius);
		
        ctx.fill();
        ctx.stroke();

		    ctx.fillStyle = "white";
        ctx.strokeStyle = "black";
        
        ctx.lineWidth = 7;


        this.fillTextCenter(ctx, friend.nickname, battle.rectangle.x + battle.rectangle.w * 0.1, battle.rectangle.y + battle.rectangle.h * 0.7, battle.rectangle.w * 0.35,  battle.rectangle.h * 0.4, undefined, "'Press Start 2P', cursive", true);
        
        if (image_friend.complete)
          this.drawImageCircle(ctx, image_friend, battle.rectangle.x + battle.rectangle.w * 0.0135, battle.rectangle.y + battle.rectangle.h * 0.125, battle.rectangle.w * 0.095, battle.rectangle.h * 0.8, true);
      
        const color = friend.status ? (friend.status == "ONLINE" ? "green" : (friend.status == "IN-GAME" ? "orange" : "red")) : "red";
        const centerX = battle.rectangle.x + battle.rectangle.w * 0.08;
        const centerY = battle.rectangle.y + battle.rectangle.h * 0.8;
        const radius = battle.rectangle.w * 0.01;
  
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.closePath();
        ctx.lineWidth = 1;
        ctx.stroke();
        //TODO
      },
      onClick: () => {
        let profileMenu;
        profileMenu = new Profile(friend.id);
        this._menu.visible = false;
        this._menu.enable = false;
        profileMenu.show((value) => {
          if (value == "EXIT") {
            this._menu.visible = true;
            this._menu.enable = true;
          }
        });
        
      },
    };
    return battle;
  }

  private createMessage(index: number, x: number, y: number, friend: any): ElementUI {
    const image_friend = new Image();
    //image_friend.src = friend.image;
    const message_image = new Image();
    message_image.src = messageImage;

	  const battle: ElementUI = {
      type: "battle",
      rectangle: { x: x + "%", y: y + "%", w: "3.5%", h: "4%" },
      draw: (ctx: CanvasRenderingContext2D) => {

        if (!(this.pagination_friends.isIndexInCurrentPage(index))) {
            battle.enable = false;
          return;
        }
        if (!battle.enable)
          battle.enable = true;

        if (message_image.complete)
          ctx.drawImage(message_image, battle.rectangle.x, battle.rectangle.y, battle.rectangle.w, battle.rectangle.h);

      },
      onClick: () => {
        //TODO SendMessage
      },
    };
    return battle;
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

  private drawImageCircle(ctx: CanvasRenderingContext2D, image: HTMLImageElement, dx: number, dy: number, dw: number, dh: number, stroke?: boolean)
  {
    const centerX = dx + dw / 2;
    const centerY = dy + dh / 2;
    const radius = Math.min(dw, dh) / 2;

    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.closePath();

    if (stroke)
    {
      ctx.strokeStyle = "black";
      ctx.lineWidth = 3;
      ctx.stroke();
    }
    ctx.clip();
    
    ctx.drawImage(image, centerX - radius, centerY - radius, radius * 2, radius * 2);

    
    ctx.restore();
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

/* ctx.strokeRect( x + w * 0.1, y, w - w * 0.2 - offset, 1);
  
  ctx.strokeRect( x + w * 0.1, y - h, 1, h );
  ctx.strokeRect( x + w * 0.1, y - h, w - w * 0.2 - offset, 1);
  
  ctx.strokeRect(x, y + h / 2, w, 1);
  ctx.strokeRect(x + w / 2, y, 1, h);
  ctx.strokeRect(x + w * 0.33, y, 1, h);
  ctx.strokeRect(x + w * 0.66, y, 1, h);*/

  /*
      //Regua

    ctx.strokeStyle = "white";
    ctx.lineWidth = 1;
    ctx.strokeRect( x + w * 0.1, y - h, 1, h );
    ctx.strokeRect( x + w * 0.1 + w - w * 0.2, y - h, 1, h );
    
    
    ctx.strokeRect( x + w * 0.1, y, w - w * 0.2 - offset, 1);
    ctx.strokeRect( x + w * 0.1, y - h, w - w * 0.2 - offset, 1);
    ctx.strokeStyle = "black";
    
    /*ctx.strokeRect(x, y + h / 2, w, 1);
    ctx.strokeRect(x + w / 2, y, 1, h);
    ctx.strokeRect(x + w * 0.33, y, 1, h);
    ctx.strokeRect(x + w * 0.66, y, 1, h);*/