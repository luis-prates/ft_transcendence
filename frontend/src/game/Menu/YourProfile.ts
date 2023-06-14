import { Menu, type ElementUI, type Rectangle, Game, Player } from "@/game";
import { userStore, type Historic } from "@/stores/userStore";
import { Skin, TypeSkin } from "../ping_pong/Skin";
import { AnimationMenu } from "./AnimationMenu";

//Audio
import sound_close_tab from "@/assets/audio/close.mp3";

//Image
import avatarDefault from "@/assets/images/pingpong/avatar_default.jpg";
import avatares from "@/assets/images/lobby/115990-9289fbf87e73f1b4ed03565ed61ae28e.jpg";
import pencil from "@/assets/images/lobby/pencil.png";
import { PaginationMenu } from "./PaginationMenu";

export class YourProfile {
  private _menu = new Menu({ layer: "Global", isFocus: true });

  private background: ElementUI = this.createBackground();
  private customAvatar: ElementUI = this.createAvatar();
  private customPaddle: ElementUI = this.createCustomPaddle();

  private user = userStore().user;
  private player: Player;
  private avatarImage = new Image();

  private avatar_pagination: PaginationMenu;
  private matche_pagination: PaginationMenu;
  private paddle_pagination: PaginationMenu;

  private new_nickname = "";

  //MiniPerfil
  private skin = new Skin();
  private avataresImage = new Image();
  private skinPadleImage: HTMLImageElement;
  private colorChoose: string = "";
  private skinPadle: string = "";


  constructor(player: Player) {
    this.player = player;

    this.avatarImage.src = this.user.infoPong.avatar ? this.user.infoPong.avatar : avatarDefault;

    this.skinPadle = this.user.infoPong.skin.default.paddle;
    this.skinPadleImage = this.skin.get_skin(TypeSkin.Paddle + "_" + this.user.infoPong.skin.default.paddle);

    this.matche_pagination = new PaginationMenu(this.user.infoPong.historic, 4, 2, this.background, this.menu);

    this.new_nickname = this.user.nickname;

    this.avataresImage.src = avatares;

    this.avatar_pagination = new PaginationMenu([ 0 , 1 , 2 , 3 , 4 , 5, 6, 7], 1, 1, this.customAvatar);
    this.avatar_pagination.page = Math.ceil(player.animation.sx / 48 / 3) + player.animation.sy / 80;

    
    this.paddle_pagination = new PaginationMenu(this.user.infoPong.skin.paddles, 4, 4, this.customPaddle);
    this.colorChoose = this.user.infoPong.color;
    this.skinPadle = this.user.infoPong.skin.default.paddle;
    this.skinPadleImage = this.skin.get_skin(TypeSkin.Paddle + "_" + this.user.infoPong.skin.default.paddle);

    
    this.menu.add(this.background);
    this.menu.add(this.background, this.createButtonExit(33.5, 6, "profile"));

    //Custom and Save Buttons
    this.menu.add(this.background, this.createButton("photo", 1, 26, "Update Photo", 9));
    this.menu.add(this.background, this.createButton("save", 28, 26, "Save", 5));


    //Arrow Buttons
    this.menu.add(this.background, this.matche_pagination.createArrowButton("left", 2.5, 33.5, 2));
    this.menu.add(this.background, this.matche_pagination.createArrowButton("right", 30.5, 33.5, 2));

    let squareW = 10;
    let squareH = 8;
    let paddingX = 6;
    let paddingY = 12;

    let page = 0;

    this.user.infoPong.historic.forEach((matche: any, index: number) => {
      if ((index == 0 ? index + 1 : index) % this.matche_pagination.max_for_page == 0) page++;

      const i = index - page * this.matche_pagination.max_for_page;

      const squareX = 1 + (i % this.matche_pagination.max_for_line) * (squareW + paddingX);
      const squareY = 30 + paddingY + Math.floor(i / this.matche_pagination.max_for_line) * (squareH + paddingY);
      this.menu.add(this.background, this.createMatches(index, matche, squareX, squareY));
    });

    //Custom Menu
    this.menu.add(this.background, this.customPaddle);
    this.customPaddle.visible = false;

    //Colors
    this.menu.add(this.customPaddle, this.createColorButton(34.5 + 1 * (10 / 3), 53.5, "red"));
    this.menu.add(this.customPaddle, this.createColorButton(34.5 + 2 * (10 / 3), 53.5, "#1e8c2f"));
    this.menu.add(this.customPaddle, this.createColorButton(34.5 + 3 * (10 / 3), 53.5, "orange"));
    this.menu.add(this.customPaddle, this.createColorButton(34.5 + 4 * (10 / 3), 53.5, "#de1bda"));
    this.menu.add(this.customPaddle, this.createColorButton(34.5 + 5 * (10 / 3), 53.5, "blue"));
    this.menu.add(this.customPaddle, this.createColorButton(34.5 + 6 * (10 / 3), 53.5, "#efc120"));

    //Paddle Skins
    page = 0;
    
    this.menu.add(this.customPaddle, this.createSkinButton(-1, "", 35.5 + 1 * (10 / 3), 66.5));
    this.user.infoPong.skin.paddles.forEach((skin: any, index: number) => {
      if ((index == 0 ? index + 1 : index) % this.paddle_pagination.max_for_page == 0) page++;

      const i = index - page * this.paddle_pagination.max_for_page;

      const squareX = 35.5 + (i + 2 % this.paddle_pagination.max_for_line) * (10 / 3);
      const squareY = 66.5;

      this.menu.add(this.customPaddle, this.createSkinButton(index, skin, squareX, squareY));
    });

    //Arrow Buttons
    this.menu.add(this.background, this.paddle_pagination.createArrowButton("left", 35.5, 70.5, 2));
    this.menu.add(this.background, this.paddle_pagination.createArrowButton("right", 56.5, 70.5, 2));

    //Custom Avatar
    this.menu.add(this.background, this.customAvatar);
    this.customAvatar.visible = false;

    //Arrow Buttons
    this.menu.add(this.background, this.avatar_pagination.createArrowButton("left", 35 + 2, 31.5, 2));
    this.menu.add(this.background, this.avatar_pagination.createArrowButton("right", 35 + 7.25, 31.5, 2));

    //Custom On / Off
    this.menu.add(this.background, this.createButtonCustom(59, 40, 40, "paddle_on", "grey"));
    this.menu.add(this.background, this.createButtonCustom(35, 40, 40, "paddle_off", "white"));
    this.menu.add(this.background, this.createButtonCustom(46, 5, 35, "avatar_on", "grey"));
    this.menu.add(this.background, this.createButtonCustom(35, 5, 35, "avatar_off", "white"));

	  this.menu.add(this.background, this.createPencilButton(26.5, 9, 2, 3));
  }

  private createMatches(index: number, matche: Historic, x: number, y: number): ElementUI {
    const player1Image = new Image();
    const player2Image = new Image();

    const product: ElementUI = {
      type: "image",
      rectangle: { x: x + "%", y: y + "%", w: "15%", h: "15%" },
      draw: (ctx: CanvasRenderingContext2D) => {
        
        if (!(this.matche_pagination.isIndexInCurrentPage(index))) {
          if (product.enable)
            product.enable = false;
          return;
        }
        if (!product.enable)
          product.enable = true;

        const offSetTittle = this.background.rectangle.y * 1.75;

        ctx.fillStyle = "silver";
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 2;

        this.roundRect(ctx, product.parent?.rectangle.x + product.rectangle.x, product.rectangle.y, product.rectangle.w, product.rectangle.h, 10);

        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#000";
        ctx.font = "20px 'Press Start 2P', cursive";

        ctx.fillText(matche.result, product.parent?.rectangle.x + product.rectangle.x + product.rectangle.w / 2.625, product.rectangle.y + offSetTittle, product.rectangle.w * 0.25);

        ctx.fillText(matche.player1, product.parent?.rectangle.x + product.rectangle.x + product.rectangle.w * 0.05, product.rectangle.y + product.rectangle.h * 0.9, product.rectangle.w * 0.3);

        ctx.fillText(matche.player2, product.parent?.rectangle.x + product.rectangle.x + product.rectangle.w * 0.65, product.rectangle.y + product.rectangle.h * 0.9, product.rectangle.w * 0.3);

        // matche.player1
        player1Image.src = matche.player1 == this.user.nickname ? this.user.infoPong.avatar : avatarDefault;
        player2Image.src = matche.player2 == this.user.nickname ? this.user.infoPong.avatar : avatarDefault;

        ctx.strokeRect(product.parent?.rectangle.x + product.rectangle.x + product.rectangle.w * 0.095, product.rectangle.y + product.rectangle.h * 0.3, product.rectangle.w * 0.2, product.rectangle.h * 0.35);
        ctx.strokeRect(
          product.parent?.rectangle.x + (product.rectangle.x + product.rectangle.w) - product.rectangle.w * 0.295,
          product.rectangle.y + product.rectangle.h * 0.3,
          product.rectangle.w * 0.2,
          product.rectangle.h * 0.35
        );

        ctx.drawImage(
          player2Image,
          product.parent?.rectangle.x + product.rectangle.x + product.rectangle.w * 0.095,
          product.rectangle.y + product.rectangle.h * 0.3,
          product.rectangle.w * 0.2,
          product.rectangle.h * 0.35
        );
        ctx.drawImage(
          player2Image,
          product.parent?.rectangle.x + (product.rectangle.x + product.rectangle.w) - product.rectangle.w * 0.295,
          product.rectangle.y + product.rectangle.h * 0.3,
          product.rectangle.w * 0.2,
          product.rectangle.h * 0.35
        );

        /*if (player1Image.complete) 
			else {
				player1Image.src = avatarDefault;
				ctx.drawImage(player1Image, product.rectangle.x + product.parent?.rectangle.w * 0.5, product.rectangle.y, product.rectangle.w, product.rectangle.h);
			}*/

        /*if (player2Image.complete) ctx.drawImage(player2Image, product.rectangle.x + this.background.rectangle.x * 0.25, product.rectangle.y, this.background.rectangle.x * 2, this.background.rectangle.y * 1.75);
			else {
				player2Image.src = avatarDefault;
				ctx.drawImage(player2Image, product.rectangle.w - this.background.rectangle.x * 1.25, product.rectangle.y, this.background.rectangle.x * 2, this.background.rectangle.y * 1.75);
			}*/
        ctx.lineWidth = 5;
        ctx.strokeText(
          matche.winner == this.user.nickname ? "WIN!" : "LOSE.",
          product.parent?.rectangle.x + product.rectangle.x + product.rectangle.w * 0.35,
          product.rectangle.y + product.rectangle.h * 0.12,
          product.rectangle.w * 0.3
        );
        ctx.fillStyle = matche.winner == this.user.nickname ? "gold" : "grey";
        ctx.fillText(
          matche.winner == this.user.nickname ? "WIN!" : "LOSE.",
          product.parent?.rectangle.x + product.rectangle.x + product.rectangle.w * 0.35,
          product.rectangle.y + product.rectangle.h * 0.12,
          product.rectangle.w * 0.3
        );
      },
      onClick: () => {},
    };
    return product;
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
    /*const animation = new AnimationMenu();
		let animation_finish = false;*/
    const background: ElementUI = {
      type: "image",
      rectangle: { x: "0%", y: "5%", w: "35%", h: "75%" },
      draw: (context: any) => {
        this.drawBackground(context, background.rectangle);
        //animation_finish = animation.animation(background.rectangle.x - background.rectangle.w, background.rectangle.x, 0, background);
      },
    };
    return background;
  }

  private createButton(type: string, x: number, y: number, label: string, width: number): ElementUI {
    let color = "black";
    let fileInput: any;
    if (type == "photo")
      fileInput = document.getElementById("fileInput") as HTMLElement;
    const button: ElementUI = {
      type: type,
      rectangle: { x: x + "%", y: y + "%", w: width + "%", h: "4.5%" },
      draw: (ctx: CanvasRenderingContext2D) => {
        ctx.fillStyle = "white";
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;

        if (type == "save" && 
        (this.player.animation.sx !== ((this.avatar_pagination.page - 4 >= 0 ? this.avatar_pagination.page - 4 : this.avatar_pagination.page) * 144) ||
        this.player.animation.sy !== ((this.avatar_pagination.page - 4 >= 0 ? 1 : 0) * 320) ||
        this.user.infoPong.color !== this.colorChoose ||
        this.user.infoPong.skin.default.paddle !== this.skinPadle ||
        this.user.infoPong.avatar !== this.avatarImage.src ||
        this.user.nickname !== this.new_nickname))
        {
          ctx.fillStyle = "green";
        }
        this.roundRect(ctx, button.parent?.rectangle.x + button.rectangle.x, button.rectangle.y, button.rectangle.w, button.rectangle.h, 10);
        
        
        ctx.fill();
        ctx.stroke();
        
        ctx.fillStyle = "black";
        ctx.font = "10px 'Press Start 2P', cursive";

        const begin = button.parent?.rectangle.x + button.rectangle.x + button.rectangle.w * 0.1;
        const max_with = button.rectangle.w - button.rectangle.w * 0.2;

        let offset = 0;
        let offsetmax = 0;
        const labelWidth = ctx.measureText(label).width;
        while (begin + offset + labelWidth < begin + max_with - offset) {
          offsetmax += button.rectangle.w * 0.05;
          if (begin + offsetmax + labelWidth > begin + max_with - offset) break;
          offset = offsetmax;
        }

        ctx.fillText(label, button.parent?.rectangle.x + button.rectangle.x + button.rectangle.w * 0.1 + offset, button.rectangle.y + button.rectangle.h / 2 + 6, button.rectangle.w - button.rectangle.w * 0.2 - offset);
      },
      onClick: () => {
        if (type == "save") {
            this.player.animation.sx = (this.avatar_pagination.page - 4 >= 0 ? this.avatar_pagination.page - 4 : this.avatar_pagination.page) * 144;
            this.player.animation.sy =  (this.avatar_pagination.page - 4 >= 0 ? 1 : 0) * 320;
            this.user.infoPong.color = this.colorChoose;
            this.user.infoPong.skin.default.paddle = this.skinPadle;
            this.user.infoPong.avatar = this.avatarImage.src ? this.avatarImage.src : this.user.infoPong.avatar;
            this.user.nickname = this.new_nickname;
        }
        if (type == "photo") {
          fileInput.click();
        }
      },
    };

    if (type == "photo") 
    {
      fileInput.addEventListener("change", async (event: any) => {

        if (event.target)
        {
          let fileForm = new FormData();
          const selectedFile = event.target.files[0];
          
          fileForm.append("image", selectedFile, selectedFile.name);

          try {
            const response = await fetch("https://api.imgbb.com/1/upload?key=d9a1c108b92558d90d3b1bd9f59a507c", {
              method: "POST",
              body: fileForm,
            });
          
            if (response.ok) {
              const data = await response.json();
              console.log("response data:", data);
              this.avatarImage.src = data.data.display_url;
            } else {
              throw new Error("Erro na requisição");
            }
          } catch (error) {
            console.error(error);
          }
        }
      });
    }
    
    return button;
  }

  private drawBackground(ctx: CanvasRenderingContext2D, pos: Rectangle) {
    const backgroundColor = "rgba(210, 180, 140, 0.6)";
    const borderColor = "black";

    ctx.fillStyle = backgroundColor;
    this.roundRect(ctx, pos.x, pos.y, pos.w, pos.h, 10);
    ctx.fill();

    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    //Level
    ctx.font = "12px 'Press Start 2P', cursive";
    ctx.fillStyle = "black";
    ctx.fillText("Level: " + this.user.infoPong.level, pos.x + pos.w * 0.3, pos.y + pos.h * 0.13, pos.w - (pos.x + pos.w * 0.5));

    //Money
    ctx.fillText("Money: " + this.user.wallet + "₳", pos.x + pos.w * 0.3, pos.y + pos.h * 0.16, pos.w - (pos.x + pos.w * 0.5));

    //Level
    const wins = this.user.infoPong.historic.filter((history: any) => history.winner == this.user.nickname).length;
    ctx.fillText("Wins:  " + wins, pos.x + pos.w * 0.3, pos.y + pos.h * 0.19, pos.w - (pos.x + pos.w * 0.5));

    const loses = this.user.infoPong.historic.filter((history: any) => history.loser == this.user.nickname).length;
    ctx.fillText("Loses: " + loses, pos.x + pos.w * 0.3, pos.y + pos.h * 0.22, pos.w - (pos.x + pos.w * 0.5));

    //Avatar

    ctx.strokeStyle = "black";
    ctx.lineWidth = 5;
    ctx.strokeRect(pos.x + pos.w * 0.05, pos.y + pos.h * 0.05, pos.w * 0.2, pos.h * 0.2);

    try {
      ctx.drawImage(this.avatarImage, pos.x + pos.w * 0.05, pos.y + pos.h * 0.05, pos.w * 0.2, pos.h * 0.2);
    } catch {
      this.avatarImage.src = avatarDefault;
      ctx.drawImage(this.avatarImage, pos.x + pos.w * 0.05, pos.y + pos.h * 0.05, pos.w * 0.2, pos.h * 0.2);
    }

    //Paddle
    const scale = 100 / 30;
    const scaledWidth = pos.w * 0.035 * scale;
    const scaledHeight = pos.h * 0.055 * scale;
    const pointx = pos.w - pos.w * 0.15;
    const pointy = pos.h * 0.07;

    ctx.fillStyle = this.colorChoose;
    ctx.fillRect(pos.x + pointx, pos.y + pointy, scaledWidth * 0.5, scaledHeight * 0.9);

    if (this.skinPadleImage.complete) {
      ctx.drawImage(this.skinPadleImage, pos.x + pointx, pos.y + pointy, scaledWidth * 0.5, scaledHeight * 0.9);
    }

    ctx.strokeStyle = "black";
    ctx.lineWidth = 3;
    ctx.strokeRect(pos.x + pointx, pos.y + pointy, scaledWidth * 0.5, scaledHeight * 0.9);

    //Matches
    ctx.font = "22px 'Press Start 2P', cursive";
    ctx.lineWidth = 4;
    ctx.strokeStyle = "black";
    ctx.strokeText("Matches", pos.x + pos.w * 0.35, pos.y + pos.h * 0.425, pos.w * 0.275);

    ctx.lineWidth = 3;

    ctx.fillStyle = "white";
    ctx.fillText("Matches", pos.x + pos.w * 0.35, pos.y + pos.h * 0.425, pos.w * 0.275);

    /*if (this.avataresImage.complete) ctx.drawImage(this.avataresImage, 
      ((this.chooseAvatar - 4 >= 0 ? this.chooseAvatar - 4 : this.chooseAvatar) * 144) + 48, //+3
      (this.chooseAvatar - 4 >= 0 ? 1 : 0) * 320, //+4
      48, 80,
      pos.x + pos.w * 0.05, 
      pos.y + pos.h * 0.04,
      pos.w * 0.4,
      pos.h * 0.80);*/
  }

  //✖
  private createButtonExit(x: number, y: number, type: string): ElementUI {
    const close_tab = new Audio(sound_close_tab);
    const button: ElementUI = {
      type: type,
      rectangle: { x: x + "%", y: y + "%", w: "1%", h: "2%" },
      draw: (ctx: CanvasRenderingContext2D) => {
        
        ctx.font = "8px 'Press Start 2P', cursive";
        ctx.fillStyle = "red";
        ctx.strokeStyle = "black";
        ctx.fillRect(button.parent?.rectangle.x + button.rectangle.x, button.rectangle.y, button.rectangle.w, button.rectangle.h);
        ctx.strokeRect(button.parent?.rectangle.x + button.rectangle.x, button.rectangle.y, button.rectangle.w, button.rectangle.h);

        ctx.lineWidth = 3;

        ctx.beginPath();
        ctx.moveTo(button.parent?.rectangle.x + button.rectangle.x + 5, button.rectangle.y + 5);
        ctx.lineTo(button.parent?.rectangle.x + button.rectangle.x + 5 + button.rectangle.w - 10, button.rectangle.y + 5 + button.rectangle.h - 10);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(button.parent?.rectangle.x + button.rectangle.x + 5, button.rectangle.y + 5 + button.rectangle.h - 10);
        ctx.lineTo(button.parent?.rectangle.x + button.rectangle.x + 5 + button.rectangle.w - 10, button.rectangle.y + 5);
        ctx.stroke();
      },
      onClick: () => {
        close_tab.play();
        if (button.type == "profile") { 
          
          this.menu.close();
          const inputName = document.getElementById("inputName") as HTMLInputElement;
          inputName.disabled = true;
          inputName.style.display = "none";
        }
      },
    };
    return button;
  }

  private createButtonCustom(x: number, y: number, h: number, type: string, color: string): ElementUI {
    let visible = false;
    const close_tab = new Audio(sound_close_tab);
    const button: ElementUI = {
      type: type,
      rectangle: { x: x + "%", y: y + "%", w: "1%", h: h + "%" },
      draw: (ctx: CanvasRenderingContext2D) => {
        if (button.type == "avatar_on" && this.customAvatar.visible) visible = true;
        else if (button.type == "paddle_on" && this.customPaddle.visible) visible = true;
        else if (button.type == "avatar_off" && this.customAvatar.visible == false) visible = true;
        else if (button.type == "paddle_off" && this.customPaddle.visible == false) visible = true;

        if (visible == false) return;

        ctx.fillStyle = color;
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;

        this.roundRect(ctx, button.parent?.rectangle.x + button.rectangle.x, button.rectangle.y, button.rectangle.w, button.rectangle.h, 10);

        ctx.fill();
        ctx.stroke();
      },
      onClick: () => {
        if (visible == false) return;
        if (button.type == "avatar_on") this.customAvatar.visible = false;
        else if (button.type == "paddle_on") this.customPaddle.visible = false;
        else if (button.type == "avatar_off") this.customAvatar.visible = true;
        else if (button.type == "paddle_off") this.customPaddle.visible = true;
        visible = false;
        close_tab.play();
      },
    };
    return button;
  }

  private createAvatar(): ElementUI {
    const avatar: ElementUI = {
      type: "image",
      rectangle: { x: "35%", y: "5%", w: "12%", h: "35%" },
      draw: (context: any) => {
        const pos: Rectangle = avatar.rectangle;
        const backgroundColor = "rgba(210, 180, 140, 0.6)";
        const borderColor = "black";

        context.fillStyle = backgroundColor;
        this.roundRect(context, pos.x, pos.y, pos.w, pos.h, 10);
        context.fill();

        context.strokeStyle = borderColor;
        context.lineWidth = 2;
        context.stroke();

        //Avatar
        context.strokeStyle = "black";
        context.strokeRect(pos.x + pos.w * 0.09, pos.y + pos.h * 0.1, pos.w * 0.75, pos.h * 0.8);

        context.fillStyle = "rgba(0, 0, 0, 0.3)";

        context.fillRect(pos.x + pos.w * 0.09, pos.y + pos.h * 0.1, pos.w * 0.75, pos.h * 0.8);
        context.fillStyle = "white";

        if (this.avataresImage.complete)
          context.drawImage(
            this.avataresImage,
            (this.avatar_pagination.page - 4 >= 0 ? this.avatar_pagination.page - 4 : this.avatar_pagination.page) * 144 + 48, //+3
            (this.avatar_pagination.page - 4 >= 0 ? 1 : 0) * 320, //+4
            48,
            80,
            pos.x + pos.w * 0.09,
            pos.y + pos.h * 0.04,
            pos.w * 0.75,
            pos.h * 0.8
          );
      },
    };
    return avatar;
  }

  private createCustomPaddle(): ElementUI {
    const custom: ElementUI = {
      type: "custom",
      rectangle: { x: "35%", y: "40%", w: "25%", h: "40%" },
      draw: (context: any) => {
        const backgroundColor = "rgba(210, 180, 140, 0.6)"; //"#FFC857";
        const borderColor = "black";

        context.fillStyle = backgroundColor;
        this.roundRect(context, custom.rectangle.x, custom.rectangle.y, custom.rectangle.w, custom.rectangle.h, 10);
        context.fill();

        context.strokeStyle = borderColor;
        context.lineWidth = 2;
        context.stroke();
			
        //Tittle
        context.fillStyle = "#ffffff";
        context.font = "25px 'Press Start 2P', cursive";
        context.lineWidth = 4;
        context.strokeText("Custom", custom.rectangle.x + custom.rectangle.w * 0.275, custom.rectangle.y + custom.rectangle.h * 0.125, custom.rectangle.w * 0.45);
        context.fillText("Custom", custom.rectangle.x + custom.rectangle.w * 0.275, custom.rectangle.y + custom.rectangle.h * 0.125, custom.rectangle.w * 0.45);

        context.textAlign = "start";
        //Type
        context.fillStyle = "black";
        context.font = "18px 'Press Start 2P', cursive";
        context.fillText("Color:", custom.rectangle.x + custom.rectangle.w * 0.35, custom.rectangle.y + custom.rectangle.h * 0.285, custom.rectangle.w * 0.3);

        //Skin
        context.fillText("Skin:", custom.rectangle.x + custom.rectangle.w * 0.37, custom.rectangle.y + custom.rectangle.h * 0.625, custom.rectangle.w * 0.25);
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

        this.roundRect(ctx, button.parent?.parent?.rectangle.x + button.rectangle.x, button.rectangle.y, button.rectangle.w, button.rectangle.h, 10);

        ctx.fill();
        ctx.stroke();
      },
      onClick: () => {
        this.colorChoose = color;
      },
    };
    return button;
  }

  private createSkinButton(index: number, skin: string, x: number, y: number): ElementUI {
    const skinImage = this.skin.get_skin(TypeSkin.Paddle + "_" + skin);
    const button: ElementUI = {
      type: "skin",
      rectangle: { x: x + "%", y: y + "%", w: "2.5%", h: "12%" },
      draw: (ctx: CanvasRenderingContext2D) => {
        
        if (index > 0 && !(this.paddle_pagination.isIndexInCurrentPage(index))) {
          if (button.enable)
            button.enable = false;
          return;
        }
        if (!button.enable)
          button.enable = true;
        
        ctx.strokeStyle = skin == this.skinPadle ? "red" : "black";
        ctx.lineWidth = 2;

        ctx.lineWidth = 3;

        if (skin == "") {
          ctx.beginPath();
          ctx.moveTo(button.parent?.parent?.rectangle.x + button.rectangle.x + 5, button.rectangle.y + 5);
          ctx.lineTo(button.parent?.parent?.rectangle.x + button.rectangle.x + 5 + button.rectangle.w - 10, button.rectangle.y + 5 + button.rectangle.h - 10);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(button.parent?.parent?.rectangle.x + button.rectangle.x + 5, button.rectangle.y + 5 + button.rectangle.h - 10);
          ctx.lineTo(button.parent?.parent?.rectangle.x + button.rectangle.x + 5 + button.rectangle.w - 10, button.rectangle.y + 5);
          ctx.stroke();
        } else if (skinImage.complete) {
          ctx.save();

          ctx.beginPath();
          ctx.moveTo(button.parent?.parent?.rectangle.x + button.rectangle.x + 10, button.rectangle.y);
          ctx.arcTo(button.parent?.parent?.rectangle.x + button.rectangle.x + button.rectangle.w, button.rectangle.y, button.rectangle.x + button.rectangle.w, button.rectangle.y + button.rectangle.h, 10);
          ctx.arcTo(button.parent?.parent?.rectangle.x + button.rectangle.x + button.rectangle.w, button.rectangle.y + button.rectangle.h, button.rectangle.x, button.rectangle.y + button.rectangle.h, 10);
          ctx.arcTo(button.parent?.parent?.rectangle.x + button.rectangle.x, button.rectangle.y + button.rectangle.h, button.rectangle.x, button.rectangle.y, 10);
          ctx.arcTo(button.parent?.parent?.rectangle.x + button.rectangle.x, button.rectangle.y, button.rectangle.x + button.rectangle.w, button.rectangle.y, 10);
          ctx.closePath();
          ctx.clip();
          ctx.drawImage(skinImage, button.parent?.parent?.rectangle.x + button.rectangle.x, button.rectangle.y, button.rectangle.w, button.rectangle.h);

          ctx.restore();
        }

        this.roundRect(ctx, button.parent?.parent?.rectangle.x + button.rectangle.x, button.rectangle.y, button.rectangle.w, button.rectangle.h, 10);

        ctx.stroke();
      },
      onClick: () => {

        if (index > 0 && !(this.paddle_pagination.isIndexInCurrentPage(index))) return;

        this.skinPadle = skin;
        this.skinPadleImage = skinImage;
      },
    };
    return button;
  }

  private createPencilButton(x: number, y: number, w: number, h: number): ElementUI {
    const pencilImage = new Image();
    pencilImage.src = pencil;

    let edit: boolean = false;
    
    const inputName = document.getElementById("inputName") as HTMLInputElement;
    inputName.value = this.new_nickname;
    inputName.disabled = edit;

    const button: ElementUI = {
      type: "pencil",
      rectangle: { x: x + "%", y: y + "%", w: w + "%", h: h + "%" },
      draw: (ctx: CanvasRenderingContext2D) => {

        const pos_x: number = button.parent?.rectangle.x + button.parent?.rectangle.w * 0.3;
        const pos_y: number = button.parent?.rectangle.y + button.parent?.rectangle.h * 0.055;
        const width: number = button.parent?.rectangle.w * 0.45;
        
        inputName.style.width = width + "px";
        inputName.style.position = "absolute";
        inputName.style.top = pos_y + "px";
        inputName.style.left = pos_x + "px";


        if (edit == false)
        {
          //NickName
          ctx.fillStyle = "black";
          ctx.font = "22px 'Press Start 2P', cursive";
          ctx.fillText(this.new_nickname, 
            button.parent?.rectangle.x + button.parent?.rectangle.w * 0.3, 
            button.parent?.rectangle.y + button.parent?.rectangle.h * 0.1, 
            button.parent?.rectangle.w * 0.45);
        }

        if (pencilImage.complete)
          ctx.drawImage(pencilImage, button.parent?.rectangle.x + button.rectangle.x, button.rectangle.y, button.rectangle.w, button.rectangle.h);
        
        this.roundRect(ctx, button.parent?.rectangle.x + button.rectangle.x, button.rectangle.y, button.rectangle.w, button.rectangle.h, 10);

      },
      onClick: () => {
        if (edit)
        {
          edit = false;
          inputName.disabled = true;
          inputName.style.display = "none";
          this.new_nickname = inputName.value;
        }
        else
        {
          edit = true;
          inputName.disabled = false;
          inputName.style.display = "block";
        }

      },
    };
    return button;
  }

  get menu(): Menu {
    return this._menu;
  }
}
