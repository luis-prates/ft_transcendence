import { Menu, type ElementUI, type Rectangle, Game, Lobby } from "@/game";
import { MessageList } from "./MessageList";
import { userStore, type Friendship } from "@/stores/userStore";

//Sound
import sound_close_tab from "@/assets/audio/close.mp3";

export class Messages {
  private _menu = new Menu({ layer: "Global", isFocus: false });
  private radius: number = 10;
  private background: ElementUI = this.createBackground();
    
  private user = userStore().user;
  private functions = userStore();
 // private getUsers = userStore().getUsers;
  private friendRequests : any | void [] = [];
  private response: any | void [] = [];
  private onResult: (result: any) => void = () => {};
  
  constructor() {
    this.fetchUsers();
  }

  async fetchUsers() {
    try {
      // Obtenha os usuários da base de dados
      this.friendRequests = await userStore().getFriendRequests();

      this.friendRequests = this.friendRequests.filter((request: { requestorId: number; }) => request.requestorId !== this.user.id);
      

      console.log("friendRequests: ", this.friendRequests);
      
      this.menu.add(this.background);
      this.menu.add(this.createButtonExit(38, 16));

      this.menu.add(this.background, this.createMessageButton(38.5, 16 + 1 * 6, "Request", "Request Friends"));
      this.menu.add(this.background, this.createMessageButton(38.5, 16 + 2 * 6, "Block", "Your Block List"));
      this.menu.add(this.background, this.createMessageButton(38.5, 16 + 3 * 6, "Blocked", "Who Blocked You!"));

    } catch (error) {
      console.error('Erro ao buscar os usuários:', error);
      this.menu.close();
    }
  }

  private createBackground(): ElementUI {
    const background: ElementUI = {
      type: "image",
      rectangle: { x: "37.5%", y: "15%", w: "25%", h: "27.5%" },
      draw: (ctx: any) => {
        const pos = background.rectangle;
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
    
        ctx.fillStyle = "grey";
        ctx.strokeStyle = "black";
        ctx.lineWidth = 3;
        this.fillTextCenter(ctx, "Messages", pos, pos.y + pos.h * 0.125, undefined, "bold 22px Arial", true)
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
 
  }

  private createMessageButton(x: number, y: number, type: string, tittle: string): ElementUI {
	const button: ElementUI = {
      type: type,
      rectangle: { x: x + "%", y: y + "%", w: "23%", h: "5%" },
      draw: (ctx: CanvasRenderingContext2D) => {
        
        ctx.font = "bold 18px Arial";
        ctx.fillStyle = "grey";
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;

        this.roundRect(ctx, button.rectangle.x, button.rectangle.y, button.rectangle.w, button.rectangle.h, this.radius);
        ctx.fill();
        ctx.stroke();

		    ctx.fillStyle = "white";
		    ctx.strokeStyle = "black";
        
        ctx.lineWidth = 5;
		    //tittle

        this.fillTextCenter(ctx, tittle, button.rectangle, button.rectangle.y + button.rectangle.h * 0.625, undefined, "bold 18px Arial", true);

        ctx.lineWidth = 2;
      },
      onClick: () => {        
        const confirmButton = new MessageList(type);
        this._menu.visible = false;
        confirmButton.show((value) => {
          if (value == "EXIT") {
            this._menu.visible = true;
          }
      });
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

  private fillTextCenter(ctx: CanvasRenderingContext2D, label: string, rectangle: Rectangle, y: number, max_with?: number, font?: string, stroke?: boolean) {
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

    if (stroke)
      ctx.strokeText(label, rectangle.x + rectangle.w * 0.1 + offset, y, rectangle.w - rectangle.w * 0.2 - offset);
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