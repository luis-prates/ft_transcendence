import { Menu, type ElementUI, type Rectangle, Game, Lobby } from "@/game";
import { userStore } from "@/stores/userStore";

//Sound
import sound_close_tab from "@/assets/audio/close.mp3";
import { BattleList } from "./BattleList";
import { socketClass } from "@/socket/SocketClass";
import Router from "@/router";

//image
import battleImage from "@/assets/images/lobby/menu/battle.png";

export class BattleMenu {
  private _menu = new Menu({ layer: "Global", isFocus: false });
  private radius: number = 10;
  private background: ElementUI = this.createBackground();
    
  private user = userStore().user;
  private functions = userStore();

  private onResult: (result: any) => void = () => {};
  
  constructor() {
    this.menu.add(this.background);
    this.menu.add(this.createButtonExit(38, 16));

    this.menu.add(this.background, this.createBattleButton(38.5, 16 + 1 * 6, "Waiting", "Battles Waiting"));
    this.menu.add(this.background, this.createBattleButton(38.5, 16 + 2 * 6, "Actives", "Battles Actives"));
    this.menu.add(this.background, this.createBattleButton(38.5, 16 + 3 * 6, "MatchMaking", "Match Making!"));
  }

  private createBackground(): ElementUI {
    const battle_image = new Image();
    battle_image.src = battleImage;

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

        if (battle_image.complete)
          ctx.drawImage(battle_image, pos.x + pos.w * 0.01, pos.y + pos.h * 0.01, pos.w * 0.98, pos.h * 0.98);
        
    
        ctx.fillStyle = "gold";
        ctx.lineWidth = 5;
        this.fillTextCenter(ctx, "Battle Menu", pos.x + pos.w * 0.25, pos.y + pos.h * 0.175, pos.w * 0.5, pos.h * 0.125, undefined, "'Press Start 2P', cursive", true);
        },
    };
    return background;
  }

  private createButtonExit(x: number, y: number): ElementUI {
    const close_tab = new Audio(sound_close_tab);
    const button: ElementUI = {
      type: "exit",
      rectangle: { x: x + "%", y: y + "%", w: "2%", h: "3%" },
      draw: (ctx: CanvasRenderingContext2D) => {
        ctx.lineWidth = 3;
        ctx.strokeStyle = "#8B4513";
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

  public draw(ctx: CanvasRenderingContext2D, pos: Rectangle) {
 
  }

  private createBattleButton(x: number, y: number, type: string, tittle: string): ElementUI {
	const button: ElementUI = {
      type: type,
      rectangle: { x: x + "%", y: y + "%", w: "23%", h: "5%" },
      draw: (ctx: CanvasRenderingContext2D) => {
        ctx.fillStyle = 'rgba(192, 57, 43, 0.9)';//"#C0392B";
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;

        this.roundRect(ctx, button.rectangle.x, button.rectangle.y, button.rectangle.w, button.rectangle.h, this.radius);
        ctx.fill();
        ctx.stroke();

		    ctx.fillStyle = "white";
		    ctx.strokeStyle = "black";
        
        ctx.lineWidth = 5;
        this.fillTextCenter(ctx, tittle, button.rectangle.x, button.rectangle.y + button.rectangle.h * 0.625, button.rectangle.w, button.rectangle.h * 0.35, undefined, "'Press Start 2P', cursive", true);
      },
      onClick: () => {
        if (type == "MatchMaking")
        {
          socketClass.setGameSocket({
            query: {
              userId: this.user.id,
            },
          });
            const gameSocket = socketClass.getGameSocket();
            gameSocket.emit("match_making_game", { 
            userId: this.user.id,
          });

          gameSocket.on("match_making_game", (e: any) => { 
            const gameId = e;
            gameSocket.off("match_making_game");
            Router.push(`/game?objectId=${gameId}`);
          });
        }
        else
        {
          const confirmButton = new BattleList(type);
          this._menu.visible = false;
          this._menu.enable = false;
          confirmButton.show((value) => {
            if (value == "EXIT") {
              this._menu.visible = true;
              this._menu.enable = true;
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

  public show(onResult: (result: any) => void) {
    this.onResult = onResult;
    Game.addMenu(this.menu);
  }
}