import { Menu, type ElementUI, type Rectangle, Game, Player } from "@/game";
import { userStore } from "@/stores/userStore";

//Audio
import sound_close_tab from "@/assets/audio/close.mp3";

//Image
import avatares from "@/assets/images/lobby/115990-9289fbf87e73f1b4ed03565ed61ae28e.jpg"
import marioSkin from "@/assets/images/skin/line/skin_Mario.jpeg"
import onePieceSkin from "@/assets/images/skin/line/skin_OnePiece.png"
import pacmanSkin from "@/assets/images/skin/line/skin_Pac-Man.png"


export class YourMiniPerfil {
  private _menu = new Menu({ layer: "Global", isFocus: true });
  
  
  private radius: number = 10;
  private customMenu: ElementUI = this.createCustomMenu();
  private background: ElementUI = this.createBackground();
  private avataresImage = new Image();
  
  private user = userStore().user;
  private chooseAvatar: number;
  private skinPadleImage = new Image();
  private colorChoose: string = "";
  private skinPadle : string = "";
  
  private avatarArrowR: string = "white";
  private avatarArrowL: string = "white";

  private player: Player;
  
  //  private onResult: (result: any) => void = () => {};


  constructor(player: Player) {
    this.player = player;
    this.avataresImage.src = avatares;
    this.chooseAvatar = Math.ceil((player.animation.sx / 48) / 3) + (player.animation.sy / 80 > 3 * 80 ? 4 : 0);
    this.avatarArrowL = this.chooseAvatar == 0 ? "grey" : "white";
    this.avatarArrowR = this.chooseAvatar == 7 ? "grey" : "white";

    this.colorChoose = this.user.infoPong.color;
    this.skinPadleImage.src = this.skinChoose(this.user.infoPong.skin.default.paddle);

    //Custom Menu
    this.menu.add(this.customMenu);
    this.customMenu.visible = false;

    //Colors
    this.menu.add(this.customMenu, this.createColorButton(21 + 1 * (10 / 3), 18, "red"));
    this.menu.add(this.customMenu, this.createColorButton(21 + 2 * (10 / 3), 18, "#1e8c2f"));
    this.menu.add(this.customMenu, this.createColorButton(21 + 3 * (10 / 3), 18, "orange"));
    this.menu.add(this.customMenu, this.createColorButton(21 + 4 * (10 / 3), 18, "#de1bda"));
    this.menu.add(this.customMenu, this.createColorButton(21 + 5 * (10 / 3), 18, "blue"));
    this.menu.add(this.customMenu, this.createColorButton(21 + 6 * (10 / 3), 18, "#efc120"));

    //Skin
    this.menu.add(this.customMenu, this.createSkinButton(21 + 1 * (10 / 3), 31, ""));
    this.menu.add(this.customMenu, this.createSkinButton(21 + 2 * (10 / 3), 31, "onepiece"));
    this.menu.add(this.customMenu, this.createSkinButton(21 + 3 * (10 / 3), 31, "pacman"));
    this.menu.add(this.customMenu, this.createSkinButton(21 + 4 * (10 / 3), 31, "mario"));
    this.menu.add(this.customMenu, this.createSkinButton(21 + 5 * (10 / 3), 31, ""));
    this.menu.add(this.customMenu, this.createSkinButton(21 + 6 * (10 / 3), 31, ""));

    this.menu.add(this.customMenu, this.createButtonExit(46, 6, "custom"));

    //Mini Menu
    this.menu.add(this.background);
    this.menu.add(this.background, this.createButtonExit(19, 6, "minimenu"));

    //Arrow Buttons
	  this.menu.add(this.background, this.createArrowButton("left", 2.5, 31.5, 2));
	  this.menu.add(this.background, this.createArrowButton("right", 7.5, 31.5, 2));

    //Custom and Save Buttons
    this.menu.add(this.background, this.createButton("custom", 11, 28, "Custom", 9));
    this.menu.add(this.background, this.createButton("save", 11, 33.5, "Save", 9));

  }
  
  private skinChoose(name: string): string {
    if (name == "onepiece") return onePieceSkin;
    else if (name == "pacman") return pacmanSkin;
    else if (name == "mario") return marioSkin;
    return "";
  }

  private roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
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

  private createBackground(): ElementUI {
    const background: ElementUI = {
      type: "image",
      rectangle: { x: "1%", y: "5%", w: "20%", h: "35%" },
      draw: (context: any) => {
        this.drawBackground(context, background.rectangle);
          const scale = 100 / 30;
          const scaledWidth = background.rectangle.w * 0.05 * scale;
          const scaledHeight = background.rectangle.h * 0.1 * scale;
          const pointx = (background.rectangle.w + scaledWidth * 2) / 2;
          const pointy = (background.rectangle.h - scaledHeight * 1.18) / 2;
          
          context.fillStyle = this.colorChoose;
          context.fillRect(background.rectangle.x + pointx, background.rectangle.y + pointy, scaledWidth * 0.5, scaledHeight * 0.9);
          
          if (this.skinPadleImage.complete) {
            context.drawImage(this.skinPadleImage, background.rectangle.x + pointx, background.rectangle.y + pointy, scaledWidth * 0.5, scaledHeight * 0.9);
          }
          
          context.strokeStyle = "black";
          context.lineWidth = 3;
          context.strokeRect(background.rectangle.x + pointx, background.rectangle.y + pointy, scaledWidth * 0.5, scaledHeight * 0.9);
      },
    };
    return background;
  }

  private createButton(type: string, x: number, y: number, label: string, width: number): ElementUI {
    let color = "black";
    const button: ElementUI = {
      type: type,
      rectangle: { x: x + "%", y: y + "%", w: width + "%", h: "4.5%" },
      draw: (ctx: CanvasRenderingContext2D) => {
         
          ctx.fillStyle = "white";
      	  ctx.strokeStyle = color;
      	  ctx.lineWidth = 2;
			
      	  this.roundRect(ctx, button.rectangle.x, button.rectangle.y, button.rectangle.w, button.rectangle.h, this.radius);
			
      	  ctx.fill();
      	  ctx.stroke();
			
      	  ctx.fillStyle = "black";
          ctx.font = "10px 'Press Start 2P', cursive";

          const labelWidth = ctx.measureText(label).width;

      	  ctx.fillText(label, 
            button.rectangle.x + button.rectangle.w / 2 - labelWidth / 2,
            button.rectangle.y + button.rectangle.h / 2 + 6,
            /*TODO fazer com que a label tenha limite, ps this.background*/);
      	},
      	onClick: () => {
          if (type == "custom") {
            this.customMenu.visible = true;
          }
          else if (type == "save") {
            this.player.animation.sx = (this.chooseAvatar - 4 >= 0 ? this.chooseAvatar - 4 : this.chooseAvatar) * 144;
            this.player.animation.sy =  (this.chooseAvatar - 4 >= 0 ? 1 : 0) * 320;
            this.user.infoPong.color = this.colorChoose;
            this.user.infoPong.skin.default.paddle = this.skinPadle;
          }
          
      	},
    };
    return button;
  }

  private createArrowButton(type: string, x: number, y: number, width: number): ElementUI {
    const button: ElementUI = {
      type: type,
      rectangle: { x: x + "%", y: y + "%", w: width + "%", h: "4%" },
      draw: (ctx: CanvasRenderingContext2D) => {
         
       //const tamanhoSeta = button.rectangle.w; // Usar a largura do botão como tamanho da seta
       //  ctx.lineWidth = 4; // Definir a espessura da linha
          ctx.strokeStyle = "black"; // Definir a cor do sublinhado preto
          ctx.fillStyle = button.type == "right" ? this.avatarArrowR : this.avatarArrowL; // Definir a cor da seta branca

          const arrowSize = Math.min(button.rectangle.w, button.rectangle.h); // Tamanho da seta é a menor dimensão entre largura e altura do botão

          if (type == "right") {
            ctx.beginPath();
            ctx.moveTo(button.rectangle.x + button.rectangle.w, button.rectangle.y + button.rectangle.h / 2);
            ctx.lineTo(button.rectangle.x + button.rectangle.w - arrowSize, button.rectangle.y);
            ctx.lineTo(button.rectangle.x + button.rectangle.w - arrowSize, button.rectangle.y + button.rectangle.h);
            ctx.closePath();
          } else if (type == "left") {
            ctx.beginPath();
            ctx.moveTo(button.rectangle.x, button.rectangle.y + button.rectangle.h / 2);
            ctx.lineTo(button.rectangle.x + arrowSize, button.rectangle.y);
            ctx.lineTo(button.rectangle.x + arrowSize, button.rectangle.y + button.rectangle.h);
            ctx.closePath();
          }
          ctx.fill();
          ctx.stroke();
      	},
      	onClick: () => {
          if (type == "left" && this.chooseAvatar > 0) this.chooseAvatar -= 1;
          else if (type == "right" && this.chooseAvatar < 7)  this.chooseAvatar += 1;
          
          if (this.chooseAvatar == 0) this.avatarArrowL = "grey";
          else this.avatarArrowL = "white";
          
          if (this.chooseAvatar == 7) this.avatarArrowR = "grey";
          else this.avatarArrowR = "white";
      	},
    };
    return button;
  }

  private drawBackground(ctx: CanvasRenderingContext2D, pos: Rectangle) {
    const backgroundColor = "#FFC857";
    const borderColor = "black";

    ctx.fillStyle = backgroundColor;
    this.roundRect(ctx, pos.x, pos.y, pos.w, pos.h, this.radius);
    ctx.fill();

    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    //NickName
    ctx.fillStyle = 'black';
    ctx.font = "12px 'Press Start 2P', cursive";
	  ctx.fillText(this.user.nickname, pos.x + pos.w * 0.5, pos.y + pos.h * 0.18, pos.w - (pos.x + pos.w * 0.5));

    //Level
    ctx.font = "10px 'Press Start 2P', cursive";
	  ctx.fillText("Money: " + this.user.wallet + "₳", pos.x + pos.w * 0.5, pos.y + pos.h * 0.26, pos.w - (pos.x + pos.w * 0.5));

    //Avatar

    ctx.fillStyle = "white";
	  ctx.strokeStyle = "black";
    ctx.strokeRect(
      pos.x + pos.w * 0.05, 
      pos.y + pos.h * 0.1,
      pos.w * 0.4,
      pos.h * 0.80,
      );
    
    if (this.avataresImage.complete) ctx.drawImage(this.avataresImage, 
      ((this.chooseAvatar - 4 >= 0 ? this.chooseAvatar - 4 : this.chooseAvatar) * 144) + 48, //+3
      (this.chooseAvatar - 4 >= 0 ? 1 : 0) * 320, //+4
      48, 80,
      pos.x + pos.w * 0.05, 
      pos.y + pos.h * 0.04,
      pos.w * 0.4,
      pos.h * 0.80);
  }

  private createButtonExit(x: number, y: number, type: string): ElementUI {
    const close_tab = new Audio(sound_close_tab);
    const button: ElementUI = {
      type: type,
      rectangle: { x: x + "%", y: y + "%", w: "1%", h: "2%" },
      draw: (ctx: CanvasRenderingContext2D) => {
        ctx.fillStyle = "red";
        ctx.strokeStyle = "black";
        ctx.fillRect(button.rectangle.x, button.rectangle.y, button.rectangle.w, button.rectangle.h);
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
        if (button.type == "minimenu") this.menu.close();
        else if (button.type == "custom") this.customMenu.visible = false;
      },
    };
    return button;
  }

  private createCustomMenu(): ElementUI {
    const custom: ElementUI = {
      type: "custom",
      rectangle: { x: "18%", y: "5%", w: "30%", h: "40%" },
      draw: (context: any) => {
        const backgroundColor = "#FFC857";
        const borderColor = "black";
    
        context.fillStyle = backgroundColor;
        this.roundRect(context, custom.rectangle.x, custom.rectangle.y, custom.rectangle.w, custom.rectangle.h, this.radius);
        context.fill();
    
        context.strokeStyle = borderColor;
        context.lineWidth = 2;
        context.stroke();
    
        //Tittle
        context.fillStyle = "#ffffff";
        context.font = "25px 'Press Start 2P', cursive";
        context.textAlign = "center";
        context.fillText("Custom", custom.rectangle.x + custom.rectangle.w / 2, custom.rectangle.y + custom.rectangle.h * 0.125);
        context.strokeText("Custom", custom.rectangle.x + custom.rectangle.w / 2, custom.rectangle.y + custom.rectangle.h * 0.125);
    
        //Type
        context.fillStyle = "black";
        context.font = "18px 'Press Start 2P', cursive";
        context.fillText("Color:", custom.rectangle.x + custom.rectangle.w * 0.5, custom.rectangle.y + custom.rectangle.h * 0.285);
    
        //Skin
        context.fillText("Skin:", custom.rectangle.x + custom.rectangle.w * 0.5, custom.rectangle.y + custom.rectangle.h * 0.625);
    
      },
    };
    return custom;
  }

  private createColorButton(x: number, y: number, color: string): ElementUI {
    const button: ElementUI = {
      type: "color",
      rectangle: { x: x + "%", y: y + "%", w: "2.5%", h: "6%" },
      draw: (ctx: CanvasRenderingContext2D) => {
        ctx.fillStyle = color;
        ctx.strokeStyle = color == this.colorChoose ? "red" : "black";
        ctx.lineWidth = 2;

        this.roundRect(ctx, button.rectangle.x, button.rectangle.y, button.rectangle.w, button.rectangle.h, this.radius);

        ctx.fill();
        ctx.stroke();
      },
      onClick: () => {
        this.colorChoose = color;
      },
    };
    return button;
  }


  private createSkinButton(x: number, y: number, skin: string): ElementUI {
    const skinImage = new Image();
    const button: ElementUI = {
      type: "skin",
      rectangle: { x: x + "%", y: y + "%", w: "2.5%", h: "12%" },
      draw: (ctx: CanvasRenderingContext2D) => {
        skinImage.src = this.skinChoose(skin);

        ctx.strokeStyle = skin == this.skinPadle ? "red" : "black";
        ctx.lineWidth = 2;

        ctx.lineWidth = 3;

        if (skin == "") {
          ctx.beginPath();
          ctx.moveTo(button.rectangle.x + 5, button.rectangle.y + 5);
          ctx.lineTo(button.rectangle.x + 5 + button.rectangle.w - 10, button.rectangle.y + 5 + button.rectangle.h - 10);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(button.rectangle.x + 5, button.rectangle.y + 5 + button.rectangle.h - 10);
          ctx.lineTo(button.rectangle.x + 5 + button.rectangle.w - 10, button.rectangle.y + 5);
          ctx.stroke();
        } else if (skinImage.complete) {
          ctx.save();

          ctx.beginPath();
          ctx.moveTo(button.rectangle.x + this.radius, button.rectangle.y);
          ctx.arcTo(button.rectangle.x + button.rectangle.w, button.rectangle.y, button.rectangle.x + button.rectangle.w, button.rectangle.y + button.rectangle.h, this.radius);
          ctx.arcTo(button.rectangle.x + button.rectangle.w, button.rectangle.y + button.rectangle.h, button.rectangle.x, button.rectangle.y + button.rectangle.h, this.radius);
          ctx.arcTo(button.rectangle.x, button.rectangle.y + button.rectangle.h, button.rectangle.x, button.rectangle.y, this.radius);
          ctx.arcTo(button.rectangle.x, button.rectangle.y, button.rectangle.x + button.rectangle.w, button.rectangle.y, this.radius);
          ctx.closePath();
          ctx.clip();
          ctx.drawImage(skinImage, button.rectangle.x, button.rectangle.y, button.rectangle.w, button.rectangle.h);

          ctx.restore();
        }

        this.roundRect(ctx, button.rectangle.x, button.rectangle.y, button.rectangle.w, button.rectangle.h, this.radius);

        ctx.stroke();
      },
      onClick: () => {
        this.skinPadle = skin;
        this.skinPadleImage.src = this.skinChoose(skin);
      },
    };
    return button;
  }


  get menu(): Menu {
    return this._menu;
  }
}
