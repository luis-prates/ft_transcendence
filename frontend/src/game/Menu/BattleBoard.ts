import { Menu, type ElementUI, type Rectangle, Game, Lobby } from "@/game";

//Sound
import sound_close_tab from "@/assets/audio/close.mp3";
import { userStore, type Historic } from "@/stores/userStore";

//image
import avatarDefault from "@/assets/images/pingpong/avatar_default.jpg";
import vsImage from "@/assets/images/lobby/menu/vs.png";

import { Profile } from "./Profile";
import { YourProfile } from "./YourProfile";


export class BattleBoard {
  private _menu = new Menu({ layer: "Global", isFocus: false });
  private radius: number = 10;
  private background: ElementUI = this.createBackground();
  
  
  private user = userStore().user;
 // private getUsers = userStore().getUsers;
  private users : any | void [] = [];
  private onResult: (result: any) => void = () => {};
  
  constructor() {
    
    this.fetchUsers();

    
	//TODO FOREACH
	/*this.menu.add(this.background, this.createRanking(37.5, 16 + 1 * 6, 1, "rteles", avatarDefault));
    this.menu.add(this.background, this.createRanking(37.5, 16 + 2 * 6, 2, "onepiece", avatarDefault));
    this.menu.add(this.background, this.createRanking(37.5, 16 + 3 * 6, 3, "pacman", avatarDefault));
    this.menu.add(this.background, this.createRanking(37.5, 16 + 4 * 6, 4, "mario", avatarDefault));
    this.menu.add(this.background, this.createRanking(37.5, 16 + 5 * 6, 5, "eduxx", avatarDefault));
    this.menu.add(this.background, this.createRanking(37.5, 16 + 6 * 6, 6, "maria", avatarDefault));
    this.menu.add(this.background, this.createRanking(37.5, 16 + 7 * 6, 7, "cabrita", avatarDefault));
    this.menu.add(this.background, this.createRanking(37.5, 16 + 8 * 6, 8, "ave rara", avatarDefault));
    this.menu.add(this.background, this.createRanking(37.5, 16 + 9 * 6, 9, "luis", avatarDefault));
    this.menu.add(this.background, this.createRanking(37.5, 16 + 10 * 6, 10, "ezekiel", avatarDefault));*/


  }

  async fetchUsers() {
    try {
      // Obtenha os usuários da base de dados
      const games : Historic[] = await userStore().getUserGames(this.user.id);
  
      // Armazene os usuários no array
  
      console.log("games: ", games); // Faça o que desejar com o array de usuários
      
      this.menu.add(this.background);
      this.menu.add(this.createButtonExit(35.5, 16));

      let your_position = 0;
      let page = 0;

      games.forEach((game: Historic, index: number) => {
        console.log(index + ':', game);
        if (index < 7)
          this.menu.add(this.background, this.createBattle(index, 32.5, 13 + (index + 1) * 9.25, game.players[0], game.players[1]));
      });
      //Your Position
      //this.menu.add(this.background, this.createBattle(37.5, 16 + 11 * 6, your_position, this.user.nickname, this.user.image, this.user.id));
    }
    catch (error) 
    {
      console.error('Erro ao buscar os usuários:', error);
      this.menu.close();
      this.onResult("EXIT");
    }
  }

  private createBackground(): ElementUI {
    const background: ElementUI = {
      type: "image",
      rectangle: { x: "30%", y: "10%", w: "40%", h: "78%" },
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

    ctx.font = "18px 'Press Start 2P', cursive";
    ctx.textAlign = "start";
	  ctx.fillStyle = "gold";
    ctx.fillText("Battle Board", pos.x + pos.w * 0.33, pos.y + pos.h * 0.05, pos.w * 0.33);
    ctx.strokeText("Battle Board", pos.x + pos.w * 0.33, pos.y + pos.h * 0.05, pos.w * 0.33);

    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(pos.x + pos.w / 2 - 30, pos.y + pos.h * 0.06);
    ctx.lineTo(pos.x + pos.w / 2 + 30, pos.y + pos.h * 0.06);
    ctx.stroke();
  }

  private createBattle(index: number, x: number, y: number, player1: any, player2?: any): ElementUI {
    const image_vs = new Image();
    image_vs.src = vsImage;

	  const battle: ElementUI = {
      type: "battle",
      rectangle: { x: x + "%", y: y + "%", w: "35%", h: "7.5%" },
      draw: (ctx: CanvasRenderingContext2D) => {
        ctx.fillStyle = "#CD7F32";
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;

        this.roundRect(ctx, battle.rectangle.x, battle.rectangle.y, battle.rectangle.w, battle.rectangle.h, this.radius);
		
        ctx.fill();
        ctx.stroke();


		    //ctx.strokeRect(battle.rectangle.x + battle.rectangle.x * 0.075, battle.rectangle.y + battle.parent?.rectangle.y * 0.035, battle.rectangle.w * 0.1, battle.rectangle.h * 0.8);
		    
        ctx.drawImage(image_vs, battle.rectangle.x + battle.rectangle.w * 0.4, battle.rectangle.y + battle.parent?.rectangle.y * 0.035, battle.rectangle.w * 0.15, battle.rectangle.h * 0.8);
      
		    ctx.fillStyle = "white";
        ctx.strokeStyle = "black";
        
        ctx.lineWidth = 7;

		    //Nickname
		    ctx.strokeText(player1.nickname, battle.rectangle.x + battle.rectangle.w * 0.05, battle.rectangle.y + battle.rectangle.w * 0.1, battle.rectangle.w * 0.375);
        ctx.fillText(player1.nickname, battle.rectangle.x + battle.rectangle.w * 0.05, battle.rectangle.y + battle.rectangle.w * 0.1, battle.rectangle.w * 0.375);
      
        ctx.strokeText(player2.nickname, battle.rectangle.x + battle.rectangle.w * 0.65, battle.rectangle.y + battle.rectangle.w * 0.1, battle.rectangle.w * 0.375);
        ctx.fillText(player2.nickname, battle.rectangle.x + battle.rectangle.w * 0.65, battle.rectangle.y + battle.rectangle.w * 0.1, battle.rectangle.w * 0.375);
     
      
      },
      onClick: () => {
        /*let confirmButton;
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
        });*/
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

  get menu(): Menu {
    return this._menu;
  }

  public show(onResult: (result: any) => void) {
    this.onResult = onResult;
    Game.addMenu(this.menu);
  }
}
