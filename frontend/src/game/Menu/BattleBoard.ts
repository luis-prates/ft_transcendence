import { Menu, type ElementUI, type Rectangle, Game, Lobby } from "@/game";

//Sound
import sound_close_tab from "@/assets/audio/close.mp3";
import { userStore, type Historic } from "@/stores/userStore";

//image
import avatarDefault from "@/assets/images/pingpong/avatar_default.jpg";
import vsImage from "@/assets/images/lobby/menu/vs.png";
import battleImage from "@/assets/images/lobby/menu/battle.png";

import { PaginationMenu } from "./PaginationMenu";


export class BattleBoard {
  private _menu = new Menu({ layer: "Global", isFocus: false });
  private radius: number = 10;
  private background: ElementUI = this.createBackground();
  
  private pagination_battles: any | PaginationMenu;
  
  private user = userStore().user;

  private onResult: (result: any) => void = () => {};
  
  constructor() {
    this.fetchUsers();
  }

  async fetchUsers() {
    try {
          const games : Historic[] = await userStore().getUserGames(this.user.id);

          this.pagination_battles = new PaginationMenu(games, 7, 1);

          console.log("games: ", games); // Faça o que desejar com o array de usuários

          this.menu.add(this.background);
          this.menu.add(this.createButtonExit(30.5, 11));

          let page = 0;

          games.forEach((game: Historic, index: number) => {
            if ((index == 0 ? index + 1 : index) % this.pagination_battles.max_for_page == 0) page++;
            const i = index - page * this.pagination_battles.max_for_page;

            this.menu.add(this.background, this.createBattle(index, 32.5, 10 + (i + 1) * 9.25, game.players[0], game.players[1]));
          });

           //Arrow Buttons
          this.menu.add(this.pagination_battles.createArrowButton("left", 46.5, 30 + 9 * 6, 2));
          this.menu.add(this.pagination_battles.createArrowButton("right", 51.5, 30 + 9 * 6, 2));
    }
    catch (error) 
    {
      console.error('Erro ao buscar os usuários:', error);
      this.menu.close();
      this.onResult("EXIT");
    }
  }

  private createBackground(): ElementUI {
    const battle_image = new Image();
    battle_image.src = battleImage;


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
    
        if (battle_image.complete)
          ctx.drawImage(battle_image, pos.x + pos.w * 0.01, pos.y + pos.h * 0.01, pos.w * 0.98, pos.h * 0.98);
        
        ctx.lineWidth = 5;
        ctx.textAlign = "start";
        ctx.fillStyle = "gold";
        this.fillTextCenter(ctx, "Battle Board", pos.x + pos.w * 0.3, pos.y + pos.h * 0.095, pos.w * 0.39, pos.h * 0.07, undefined, "'Press Start 2P', cursive", true);
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

  private createBattle(index: number, x: number, y: number, player1: any, player2?: any): ElementUI {
    const image_vs = new Image();
    image_vs.src = vsImage;
    const image_player1 = new Image();
    const image_player2 = new Image();
    image_player1.src = player1.image;
    image_player2.src = player2.image;

	  const battle: ElementUI = {
      type: "battle",
      rectangle: { x: x + "%", y: y + "%", w: "35%", h: "7.5%" },
      draw: (ctx: CanvasRenderingContext2D) => {

        if (!(this.pagination_battles.isIndexInCurrentPage(index))) {
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

		    if (image_vs.complete)
          ctx.drawImage(image_vs, battle.rectangle.x + battle.rectangle.w * 0.425, battle.rectangle.y + battle.rectangle.h * 0.125, battle.rectangle.w * 0.15, battle.rectangle.h * 0.8);
      
		    ctx.fillStyle = "white";
        ctx.strokeStyle = "black";
        
        ctx.lineWidth = 7;

        this.fillTextCenter(ctx, player1.nickname, battle.rectangle.x + battle.rectangle.w * 0.09, battle.rectangle.y + battle.rectangle.h * 0.7, battle.rectangle.w * 0.375,  battle.rectangle.h * 0.4, undefined, "'Press Start 2P', cursive", true)
        this.fillTextCenter(ctx, player2.nickname, battle.rectangle.x + battle.rectangle.w * 0.575, battle.rectangle.y + battle.rectangle.h * 0.7, battle.rectangle.w * 0.375,  battle.rectangle.h * 0.4, undefined, "'Press Start 2P', cursive", true)
        
        if (image_player1.complete)
        this.drawImageCircle(ctx, image_player1, battle.rectangle.x + battle.rectangle.w * 0.0135, battle.rectangle.y + battle.rectangle.h * 0.125, battle.rectangle.w * 0.095, battle.rectangle.h * 0.8, true);
          
        if (image_player2.complete)
          this.drawImageCircle(ctx, image_player2, battle.rectangle.x + battle.rectangle.w * 0.89, battle.rectangle.y + battle.rectangle.h * 0.125, battle.rectangle.w * 0.095, battle.rectangle.h * 0.8, true);
      },
      onClick: () => {
        //Entrar na Partida
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